import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "../services/api";

interface TranslateContentButtonProps {
  chapterId?: string;
  userId?: string;
}

interface TranslationResponse {
  translated_text: string;
  target_language_name?: string;
}

const TranslateContentButton: React.FC<TranslateContentButtonProps> = ({
  chapterId,
  userId = "demo-user",
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("ur");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const contentContainerRef = useRef<HTMLElement | null>(null);
  // To cancel requests if user leaves
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Content container ko dhoondne ka logic
    const findContentContainer = () => {
      const selectors = [
        ".theme-doc-markdown",
        ".markdown",
        "article",
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

    // Agar page dynamic load ho raha ho to dobara check karein
    const observer = new MutationObserver(() => {
      if (!contentContainerRef.current) findContentContainer();
    });

    const body = document.querySelector("body");
    if (body) observer.observe(body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [chapterId]);

  // --- CHUNKING LOGIC (Ye Error Fix Karega) ---

  const createChunks = (container: HTMLElement): string[] => {
    // 3500 characters approx 1000-1500 tokens hote hain (Safe limit)
    const MAX_CHUNK_SIZE = 3500;
    const chunks: string[] = [];

    // Agar children elements hain (Standard HTML structure)
    if (container.children.length > 0) {
      let currentChunk = "";

      Array.from(container.children).forEach((child) => {
        const childHtml = child.outerHTML;

        // Agar current chunk limit cross kar raha hai, to usay save karo aur naya shuru karo
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
    }
    // Fallback: Agar children nahi hain (sirf text hai)
    else {
      const text = container.innerHTML;
      for (let i = 0; i < text.length; i += MAX_CHUNK_SIZE) {
        chunks.push(text.substring(i, i + MAX_CHUNK_SIZE));
      }
    }

    return chunks;
  };

  const handleTranslate = async () => {
    if (isTranslated) {
      handleUndo();
      return;
    }

    const container = contentContainerRef.current;
    if (!container) {
      setError("Content not found.");
      return;
    }

    setIsTranslating(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Preparing content...");

    // Store original for undo
    if (!originalContent) {
      setOriginalContent(container.innerHTML);
    }

    try {
      // 1. Content ko tukron me baantein (Chunks)
      const chunks = createChunks(container);
      console.log(`Total chunks to translate: ${chunks.length}`);

      if (chunks.length === 0) throw new Error("No content to translate");

      let finalTranslatedHtml = "";

      // Abort controller setup
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      // 2. Har chunk ko API par bhejein (One by one)
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const percent = Math.round((i / chunks.length) * 100);

        setProgress(percent);
        setStatusMessage(`Translating part ${i + 1} of ${chunks.length}...`);

        try {
          const response = await apiClient.post<TranslationResponse>(
            "/api/v1/translate",
            {
              text: chunk,
              target_language: targetLanguage,
              source_language: "en",
              preserve_formatting: true,
            },
          );

          finalTranslatedHtml += response.translated_text;

          // Thora delay taake server overload na ho
          await new Promise((r) => setTimeout(r, 200));
        } catch (chunkError) {
          console.error(`Error in chunk ${i}:`, chunkError);
          // Agar ek part fail ho, to hum original text rakh kar aage barh sakte hain
          // ya poora process rok sakte hain. Yahan hum original append kar rahay hain fallback k liye.
          finalTranslatedHtml += chunk;
        }
      }

      setProgress(100);
      setStatusMessage("Finalizing...");

      // 3. Translated HTML ko Page par lagayein
      setTimeout(() => {
        if (container) {
          container.style.opacity = "0";

          setTimeout(() => {
            const isRtl = targetLanguage === "ur" || targetLanguage === "ar";

            // Header add karein
            const header = `
              <div class="alert alert--success margin-bottom--md" style="direction: ltr; text-align: left; padding: 10px; border: 1px solid green; border-radius: 8px; margin-bottom: 20px;">
                <strong>✅ Translated successfully</strong>
              </div>
            `;

            container.innerHTML = header + finalTranslatedHtml;

            // Direction set karein
            container.style.direction = isRtl ? "rtl" : "ltr";
            container.style.textAlign = isRtl ? "right" : "left";
            container.style.opacity = "1";
          }, 300);
        }

        setIsTranslated(true);
        setIsTranslating(false);
        setStatusMessage("");
      }, 500);
    } catch (err: any) {
      console.error("Translation Error:", err);
      setError("Translation failed. Please try again later.");
      setIsTranslating(false);
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
      container.style.direction = "ltr";
      container.style.textAlign = "left";
      container.style.opacity = "1";

      setIsTranslated(false);
      setError(null);
    }, 300);
  };

  return (
    <div
      style={{
        margin: "2rem auto",
        padding: "1.5rem",
        border: "2px solid #e5e7eb",
        borderRadius: "12px",
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
        {/* Language Selection */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <select
            value={targetLanguage}
            onChange={(e) => {
              setTargetLanguage(e.target.value);
              if (isTranslated) handleUndo();
            }}
            disabled={isTranslating}
            style={{
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="ur">🇵🇰 اردو (Urdu)</option>
            <option value="ar">🇸🇦 العربية (Arabic)</option>
            <option value="es">🇪🇸 Español (Spanish)</option>
            <option value="fr">🇫🇷 Français (French)</option>
          </select>

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            style={{
              padding: "10px 20px",
              backgroundColor: isTranslated ? "#10b981" : "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isTranslating ? "not-allowed" : "pointer",
              fontWeight: "bold",
              opacity: isTranslating ? 0.7 : 1,
            }}
          >
            {isTranslating
              ? "Translating..."
              : isTranslated
                ? "Restore Original"
                : "Translate Page"}
          </button>
        </div>

        {/* Progress Bar */}
        {isTranslating && (
          <div style={{ width: "100%", marginTop: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                marginBottom: "5px",
              }}
            >
              <span>{statusMessage}</span>
              <span>{progress}%</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#eee",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: "#4f46e5",
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p style={{ color: "red", marginTop: "10px", fontSize: "0.9rem" }}>
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default TranslateContentButton;
