import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "../services/api";
// Agar useAuth aapke project me nahi hai to is line ko remove kar dein
// import { useAuth } from '../contexts/AuthContext';

interface PersonalizeContentButtonProps {
  chapterId: string;
  userId?: string;
}

// Response Type Definition
interface PersonalizeResponse {
  personalized_content: string;
  learning_level?: string;
  adjustments_made?: string[];
}

const PersonalizeContentButton: React.FC<PersonalizeContentButtonProps> = ({
  chapterId,
  userId = "1",
}) => {
  // Agar AuthContext use kar rahe hain to uncomment karein, warna neeche fallback hai
  // const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [learningLevel, setLearningLevel] = useState<string>("intermediate");

  const contentContainerRef = useRef<HTMLElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const findContentContainer = () => {
      const selectors = [
        ".theme-doc-markdown",
        "article",
        ".markdown",
        "main .container",
        '[class*="docItemContainer"]',
      ];

      for (const selector of selectors) {
        const container = document.querySelector(selector);
        if (
          container &&
          container.textContent &&
          container.textContent.length > 50
        ) {
          contentContainerRef.current = container as HTMLElement;
          return;
        }
      }
    };

    findContentContainer();

    const observer = new MutationObserver(() => {
      if (!contentContainerRef.current) findContentContainer();
    });

    const body = document.querySelector("body");
    if (body) observer.observe(body, { childList: true, subtree: true });

    // Set user preference if available (Optional logic)
    // if (user?.learning_level) setLearningLevel(user.learning_level);

    return () => {
      observer.disconnect();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [chapterId]);

  // --- CHUNKING LOGIC (Large Content Fix) ---
  const createChunks = (container: HTMLElement): string[] => {
    const MAX_CHUNK_SIZE = 3000; // Safe limit for Personalization context
    const chunks: string[] = [];

    if (container.children.length > 0) {
      let currentChunk = "";
      Array.from(container.children).forEach((child) => {
        const childHtml = child.outerHTML;
        if (
          currentChunk.length + childHtml.length > MAX_CHUNK_SIZE &&
          currentChunk.length > 0
        ) {
          chunks.push(currentChunk);
          currentChunk = "";
        }
        currentChunk += childHtml;
      });
      if (currentChunk) chunks.push(currentChunk);
    } else {
      const text = container.innerHTML;
      for (let i = 0; i < text.length; i += MAX_CHUNK_SIZE) {
        chunks.push(text.substring(i, i + MAX_CHUNK_SIZE));
      }
    }
    return chunks;
  };

  const handlePersonalize = async () => {
    if (isPersonalized) {
      handleUndo();
      return;
    }

    const container = contentContainerRef.current;
    if (!container) {
      setError("Content to personalize not found.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatusMessage(`Preparing to personalize for ${learningLevel}...`);

    if (!originalContent) {
      setOriginalContent(container.innerHTML);
    }

    try {
      // 1. Create Chunks
      const chunks = createChunks(container);
      console.log(`Personalizing in ${chunks.length} chunks`);

      if (chunks.length === 0) throw new Error("Page content is empty");

      let finalPersonalizedHtml = "";

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      // 2. Process Loop
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const percent = Math.round((i / chunks.length) * 100);

        setProgress(percent);
        setStatusMessage(`Adapting section ${i + 1} of ${chunks.length}...`);

        try {
          // Note: Removing substring limit, sending chunk
          const response = await apiClient.post<PersonalizeResponse>(
            "/api/v1/personalize",
            {
              content: chunk,
              user_id: userId ? parseInt(userId) : 1,
              learning_level: learningLevel,
              chapter_context: chapterId,
              content_type: "partial_chapter",
            },
          );

          finalPersonalizedHtml += response.personalized_content;

          // Small delay to prevent rate limiting
          await new Promise((r) => setTimeout(r, 150));
        } catch (chunkError) {
          console.error(`Error in chunk ${i}:`, chunkError);
          // Fallback: If AI fails for a chunk, keep original text for that part
          finalPersonalizedHtml += chunk;
        }
      }

      setProgress(100);
      setStatusMessage("Finalizing changes...");

      // 3. Apply Changes
      setTimeout(() => {
        if (container) {
          container.style.transition = "opacity 0.3s ease-in-out";
          container.style.opacity = "0";

          setTimeout(() => {
            const headerHtml = `
              <div class="alert alert--success margin-bottom--md" style="padding: 1rem; border-radius: 8px; background-color: ${getLevelColor()}20; border: 1px solid ${getLevelColor()}; margin-bottom: 20px;">
                <strong>${getLevelIcon()} Content Adapted: ${learningLevel.charAt(0).toUpperCase() + learningLevel.slice(1)} Level</strong>
                <div style="font-size: 0.85em; margin-top: 5px;">Content has been simplified and examples adjusted for your level.</div>
              </div>
            `;

            container.innerHTML = headerHtml + finalPersonalizedHtml;
            container.style.opacity = "1";
          }, 300);
        }

        setIsPersonalized(true);
        setIsProcessing(false);
        setStatusMessage("");
      }, 500);
    } catch (error: any) {
      console.error("Personalization Error:", error);
      const errorMessage =
        error.response?.data?.detail || error.message || "Process failed";
      setError(`Failed: ${errorMessage}`);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleUndo = () => {
    const container = contentContainerRef.current;
    if (!container || !originalContent) return;

    container.style.transition = "opacity 0.3s ease-in-out";
    container.style.opacity = "0";

    setTimeout(() => {
      container.innerHTML = originalContent;
      container.style.opacity = "1";
      setIsPersonalized(false);
      setError(null);
    }, 300);
  };

  const getLevelColor = () => {
    switch (learningLevel) {
      case "beginner":
        return "#10b981"; // Green
      case "advanced":
        return "#8b5cf6"; // Purple
      default:
        return "#3b82f6"; // Blue
    }
  };

  const getLevelIcon = () => {
    switch (learningLevel) {
      case "beginner":
        return "🌱";
      case "advanced":
        return "🚀";
      default:
        return "📖";
    }
  };

  return (
    <div
      className="custom-button-container"
      style={{
        margin: "1.5rem auto",
        padding: "1.5rem",
        border: "2px solid #e5e7eb",
        borderRadius: "16px",
        backgroundColor:
          "linear-gradient(-45deg,  #ff0055,  #7000ff,  #009c98, #000000)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        maxWidth: "700px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Level Selector */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <label
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Target Level:
          </label>
          <select
            value={learningLevel}
            onChange={(e) => {
              setLearningLevel(e.target.value);
              if (isPersonalized) handleUndo();
            }}
            disabled={isProcessing}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: `2px solid ${isProcessing ? "#e5e7eb" : "#d1d5db"}`,
              outline: "none",
              cursor: isProcessing ? "not-allowed" : "pointer",
            }}
          >
            <option value="beginner">🌱 Beginner (Simple)</option>
            <option value="intermediate">📖 Intermediate (Standard)</option>
            <option value="advanced">🚀 Advanced (Technical)</option>
          </select>
        </div>

        {/* Main Button */}
        <button
          onClick={handlePersonalize}
          disabled={isProcessing}
          style={{
            padding: "1rem 2rem",
            backgroundColor: isPersonalized ? "#059669" : getLevelColor(),
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: isProcessing ? "wait" : "pointer",
            fontWeight: "700",
            fontSize: "1.05rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            transition: "all 0.2s",
            opacity: isProcessing ? 0.8 : 1,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {isProcessing ? (
            <>
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  border: "3px solid rgba(255,255,255,0.3)",
                  borderTop: "3px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              ></span>
              <span>Processing...</span>
            </>
          ) : isPersonalized ? (
            <>↩️ Restore Original</>
          ) : (
            <>✨ Personalize Content</>
          )}
        </button>

        {/* Progress Bar & Status */}
        {isProcessing && (
          <div style={{ width: "100%", marginTop: "0.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "4px",
              }}
            >
              <span>{statusMessage}</span>
              <span>{progress}%</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "#e5e7eb",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: getLevelColor(),
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Status Text */}
        {!isProcessing && (
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: error ? "#dc2626" : "#6b7280",
              marginTop: "0.5rem",
            }}
          >
            {error
              ? `⚠️ ${error}`
              : isPersonalized
                ? "✅ Content updated based on your preferences."
                : "AI will rewrite the content to match your selected difficulty level."}
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PersonalizeContentButton;
