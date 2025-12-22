// src/components/ChatbotComponent.tsx

import React, { useState, useEffect, useRef } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useChatContext } from "../contexts/ChatContext";
import { ragService, ChatMessage as RAGMessage } from "../services/ragService";

// --- Types ---
interface ChatbotComponentProps {
  selectedText?: string | null;
}

// --- Icons ---
const Icons = {
  Play: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  ),
  Pause: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  ),
  MindMap: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 9V3"></path>
      <path d="M12 21v-6"></path>
      <path d="M9 12H3"></path>
      <path d="M21 12h-6"></path>
    </svg>
  ),
  Summarize: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="21" y1="10" x2="3" y2="10"></line>
      <line x1="21" y1="6" x2="3" y2="6"></line>
      <line x1="21" y1="14" x2="3" y2="14"></line>
      <line x1="21" y1="18" x2="3" y2="18"></line>
    </svg>
  ),
  Explain: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
};

// --- Helper: Message Bubble ---
const MessageBubble = ({ message }: { message: RAGMessage }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`message ${message.role}`}>
      <div className="message-content" style={{ whiteSpace: "pre-wrap" }}>
        {message.content}
      </div>
      {message.role === "assistant" && (
        <div className="message-tools">
          <button onClick={handleSpeak} className={isSpeaking ? "active" : ""}>
            {isSpeaking ? <Icons.Pause /> : <Icons.Play />}{" "}
            {isSpeaking ? "Stop" : "Listen"}
          </button>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
const ChatbotComponent: React.FC<ChatbotComponentProps> = ({
  selectedText: propSelectedText,
}) => {
  const {
    isChatOpen,
    openChat,
    closeChat,
    messages,
    addMessage,
    isLoading,
    setIsLoading,
    startNewConversation,
    currentIntent, // Intent coming from Context
  } = useChatContext();

  const [inputValue, setInputValue] = useState("");
  const [showLevels, setShowLevels] = useState(false);

  // FIX: Local state to hold the selection even if browser focus is lost
  const [capturedSelection, setCapturedSelection] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- CRITICAL FIX: Capture Selection Event Listener ---
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : "";

      // Only update if we actually have text (don't clear it immediately if user clicks chat)
      if (text.length > 0) {
        setCapturedSelection(text);
        console.log("Captured Selection:", text);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    // Also check on mouseup
    document.addEventListener("mouseup", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleSelectionChange);
    };
  }, []);

  // Update captured selection if prop changes (fallback)
  useEffect(() => {
    if (propSelectedText) {
      setCapturedSelection(propSelectedText);
    }
  }, [propSelectedText]);

  // Handle Auto-Intent (e.g. from popup menu)
  useEffect(() => {
    if (currentIntent && isChatOpen) {
      handleIntent(currentIntent);
    }
  }, [currentIntent]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // --- Logic ---
  const handleIntent = async (intent: string) => {
    // Priority: 1. Captured State, 2. Prop, 3. Context, 4. Try getting window selection again
    let textToUse =
      capturedSelection ||
      propSelectedText ||
      window.getSelection()?.toString() ||
      "";

    // Trim and validate
    textToUse = textToUse.trim();

    console.log("Attempting Intent:", intent);
    console.log("Text to use:", textToUse);

    if (!textToUse) {
      alert("Please select text on the page first.");
      return;
    }

    if (isLoading) return;

    let prompt = "";
    let userDisplay = "";

    switch (intent) {
      case "summarize":
        prompt = `Please summarize the following text in concise bullet points:\n\n"${textToUse}"`;
        userDisplay = "📝 Summarize Selection";
        break;
      case "mind-map":
        prompt = `Create a hierarchical text-based Mind Map for the concepts in this text:\n\n"${textToUse}"`;
        userDisplay = "🧠 Generate Mind Map";
        break;
      case "explain-beginner":
        prompt = `Explain this text as if I am 5 years old (Beginner Level):\n\n"${textToUse}"`;
        userDisplay = "👶 Explain (Beginner)";
        break;
      case "explain-intermediate":
        prompt = `Explain this text for a university student (Intermediate Level):\n\n"${textToUse}"`;
        userDisplay = "🎓 Explain (Intermediate)";
        break;
      case "explain-advanced":
        prompt = `Provide a detailed technical and theoretical analysis (Advanced Level) of:\n\n"${textToUse}"`;
        userDisplay = "🚀 Explain (Advanced)";
        break;
      default:
        return;
    }

    setShowLevels(false);

    // Check if chat is open, if not open it
    if (!isChatOpen) openChat();

    // Add user message
    addMessage({ role: "user", content: userDisplay, timestamp: new Date() });

    // Process
    await processRAG(prompt, textToUse);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    addMessage({ role: "user", content: text, timestamp: new Date() });

    // Use captured selection as context if available
    await processRAG(text, capturedSelection);
  };

  const processRAG = async (question: string, context: string) => {
    setIsLoading(true);
    try {
      console.log('[ChatbotComponent] Calling ragService with:', { question, context });
      const response = await ragService.sendChatMessage({
        question: question,
        context_text: context || null,
      });

      console.log('[ChatbotComponent] Got response:', response);
      addMessage({
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
      });
    } catch (error: any) {
      console.error("[ChatbotComponent] RAG Error:", error);
      addMessage({
        role: "assistant",
        content: `Error: ${error?.message || 'Failed to connect to AI service. Please try again.'}`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const readSelection = () => {
    const text = capturedSelection || window.getSelection()?.toString();
    if (!text) {
      alert("No text selected to read.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="chatbot-wrapper">
      <div style={{ position: "relative" }}>
        <button
          className={`toggle-btn ${isChatOpen ? "open" : ""}`}
          onClick={isChatOpen ? closeChat : openChat}
          title={isChatOpen ? "Close Assistant" : "Open Assistant"}
        >
          {isChatOpen ? "✕" : "💬"}
        </button>
        {!isChatOpen && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "20px",
              height: "20px",
              background: "#10b981",
              borderRadius: "50%",
              border: "3px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              color: "white",
              animation: "pulse 2s infinite"
            }}
          >
            ●
          </div>
        )}
      </div>

      {isChatOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <h3>Robotics AI</h3>
            <button onClick={startNewConversation} className="new-chat">
              New
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome">
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🤖</div>
                <p style={{ fontSize: "15px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                  Smart Learning Assistant
                </p>
                <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
                  Select text from the book to unlock AI-powered tools
                </p>
                {capturedSelection ? (
                  <div className="context-indicator success">
                    <div style={{ fontSize: "12px", marginBottom: "4px" }}>✅ Text Selected</div>
                    <div style={{ fontSize: "11px", fontStyle: "italic", marginTop: "6px", color: "inherit", opacity: 0.8 }}>
                      "{capturedSelection.substring(0, 30)}{capturedSelection.length > 30 ? '...' : ''}"
                    </div>
                  </div>
                ) : (
                  <div className="context-indicator warning">
                    <div style={{ fontSize: "12px", fontWeight: "600" }}>⚠️ No Text Selected</div>
                    <div style={{ fontSize: "11px", marginTop: "6px" }}>
                      Highlight text to get started
                    </div>
                  </div>
                )}
              </div>
            )}
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {isLoading && (
              <div className="loading-dots">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#7e22ce",
                    animation: "bounce 1.4s infinite"
                  }} />
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#a855f7",
                    animation: "bounce 1.4s infinite 0.2s"
                  }} />
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#d8b4fe",
                    animation: "bounce 1.4s infinite 0.4s"
                  }} />
                  <span style={{ marginLeft: "8px", color: "#6b7280", fontSize: "13px" }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Tools */}
          <div className="tools-container">
            <div className="toolbar-row">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleIntent("summarize");
                }}
                className={!capturedSelection ? "dimmed" : ""}
              >
                <Icons.Summarize /> Summary
              </button>

              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleIntent("mind-map");
                }}
                className={!capturedSelection ? "dimmed" : ""}
              >
                <Icons.MindMap /> Mind Map
              </button>

              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  readSelection();
                }}
                className={!capturedSelection ? "dimmed" : ""}
              >
                <Icons.Play /> Read
              </button>
            </div>

            <div className="toolbar-row">
              <button
                className={`level-toggle ${showLevels ? "active" : ""}`}
                onClick={() => setShowLevels(!showLevels)}
              >
                <Icons.Explain /> Explain Level ▼
              </button>
            </div>

            {showLevels && (
              <div className="level-options">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleIntent("explain-beginner");
                  }}
                >
                  👶 Beginner
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleIntent("explain-intermediate");
                  }}
                >
                  🎓 Inter
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleIntent("explain-advanced");
                  }}
                >
                  🚀 Advanced
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="input-area">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask follow up..."
            />
            <button onClick={handleSendMessage} className="send-btn">
              <span style={{ animation: "slideRight 0.5s ease infinite" }}>➤</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* --- WRAPPER & TOGGLE --- */
        .chatbot-wrapper {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 2000;
          font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
        }

        .toggle-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7e22ce 0%, #c026d5 100%);
          color: white;
          border: none;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(126, 34, 206, 0.4);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            box-shadow: 0 8px 24px rgba(126, 34, 206, 0.4);
          }
          50% {
            transform: translateY(-12px);
            box-shadow: 0 12px 32px rgba(126, 34, 206, 0.6);
          }
        }

        @keyframes pulse-ring {
          0% {
            box-shadow: 0 8px 24px rgba(126, 34, 206, 0.4), 0 0 0 0 rgba(126, 34, 206, 0.7);
          }
          50% {
            box-shadow: 0 8px 24px rgba(126, 34, 206, 0.4), 0 0 0 10px rgba(126, 34, 206, 0);
          }
          100% {
            box-shadow: 0 8px 24px rgba(126, 34, 206, 0.4), 0 0 0 0 rgba(126, 34, 206, 0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% {
            opacity: 0.8;
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
        }

        @keyframes slideRight {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(4px);
          }
        }

        .toggle-btn:hover {
          animation: none;
          transform: scale(1.15) translateY(-5px);
          box-shadow: 0 16px 40px rgba(126, 34, 206, 0.5);
        }

        .toggle-btn.open {
          animation: none;
          transform: scale(0.95) rotate(-90deg);
          box-shadow: 0 4px 16px rgba(126, 34, 206, 0.3);
        }

        /* --- CHAT WINDOW --- */
        .chat-window {
          position: absolute;
          bottom: 90px;
          right: 0;
          width: 380px;
          height: 500px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          40% {
            transform: translateY(-10px);
            opacity: 0.7;
          }
        }

        /* --- HEADER --- */
        .chat-header {
          background: linear-gradient(135deg, #7e22ce 0%, #c026d5 100%);
          padding: 16px;
          border-bottom: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .new-chat {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          color: white;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .new-chat:hover {
          background: rgba(255,255,255,0.3);
          border-color: rgba(255,255,255,0.5);
        }

        /* --- MESSAGES --- */
        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #6b7280;
        }

        .welcome p {
          font-size: 14px;
          margin: 0 0 16px 0;
          color: #374151;
        }

        .message {
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          max-width: 88%;
          word-wrap: break-word;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
          color: white;
          border-radius: 16px 4px 12px 12px;
          box-shadow: 0 2px 8px rgba(126, 34, 206, 0.2);
        }

        .message.assistant {
          align-self: flex-start;
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-radius: 4px 16px 12px 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .message-content {
          font-size: 13.5px;
          line-height: 1.6;
        }

        .loading-dots {
          padding: 12px 14px;
          font-size: 13px;
          color: #6b7280;
          font-style: italic;
        }

        .context-indicator {
          font-size: 12px;
          padding: 10px;
          border-radius: 8px;
          margin-top: 12px;
          text-align: center;
          font-weight: 500;
        }

        .context-indicator.success {
          background: linear-gradient(135deg, #f0fdf4 0%, #e7fcef 100%);
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .context-indicator.warning {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          color: #92400e;
          border: 1px solid #fde68a;
        }

        /* --- MESSAGE TOOLS --- */
        .message-tools {
          display: flex;
          gap: 6px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }

        .message-tools button {
          border: 1px solid #d1d5db;
          background: white;
          padding: 4px 8px;
          border-radius: 5px;
          font-size: 11px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .message-tools button:hover {
          border-color: #7e22ce;
          color: #7e22ce;
          background: #f9f5ff;
        }

        .message-tools button.active {
          background: #7e22ce;
          color: white;
          border-color: #7e22ce;
        }

        /* --- TOOLS CONTAINER --- */
        .tools-container {
          background: white;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid #e5e7eb;
        }

        .toolbar-row {
          display: flex;
          gap: 6px;
        }

        .tools-container button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px 10px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          color: #4b5563;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .tools-container button:hover:not(.dimmed) {
          border-color: #7e22ce;
          background: #f9f5ff;
          color: #7e22ce;
          box-shadow: 0 2px 8px rgba(126, 34, 206, 0.1);
        }

        .tools-container button.dimmed {
          opacity: 0.4;
          background: #f9fafb;
          cursor: not-allowed;
        }

        .tools-container button.dimmed:hover {
          border-color: #d1d5db;
          color: #4b5563;
          background: #f9fafb;
          box-shadow: none;
        }

        .level-toggle {
          background: #ede9fe;
          border-color: #c4b5fd;
          color: #6d28d9;
        }

        .level-toggle:hover {
          background: #ddd6fe;
          border-color: #a78bfa;
        }

        .level-toggle.active {
          background: #7e22ce;
          border-color: #7e22ce;
          color: white;
        }

        /* --- LEVEL OPTIONS --- */
        .level-options {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px 0;
          background: #f9fafb;
          border-radius: 8px;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
          }
        }

        .level-options button {
          background: white;
          border: 1px solid #e5e7eb;
          color: #4b5563;
          padding: 10px;
          margin: 0 6px;
          font-weight: 500;
          font-size: 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .level-options button:hover {
          background: #f3e8ff;
          border-color: #c4b5fd;
          color: #6d28d9;
        }

        /* --- INPUT AREA --- */
        .input-area {
          padding: 12px;
          display: flex;
          gap: 8px;
          border-top: 1px solid #e5e7eb;
          background: white;
        }

        .input-area input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
          font-size: 13px;
          background: #f9fafb;
          color: #1f2937;
          transition: all 0.2s ease;
        }

        .input-area input:focus {
          background: white;
          border-color: #7e22ce;
          box-shadow: 0 0 0 3px rgba(126, 34, 206, 0.1);
        }

        .input-area input::placeholder {
          color: #9ca3af;
        }

        .input-area button,
        .send-btn {
          background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%);
          color: white;
          border: none;
          padding: 0 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-area button:hover,
        .send-btn:hover {
          box-shadow: 0 4px 12px rgba(126, 34, 206, 0.3);
          transform: translateY(-1px);
        }

        .input-area button:active,
        .send-btn:active {
          transform: translateY(0);
        }

        .send-btn span {
          display: inline-block;
        }

        /* --- SCROLLBAR --- */
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ChatbotComponent;
