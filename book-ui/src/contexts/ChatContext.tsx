/**
 * ChatContext - Global Chat State Management
 *
 * Manages chatbot state across the application:
 * - Chatbot open/closed state
 * - Selected text for context
 * - Current intent (summarize, explain, etc.)
 * - Conversation history
 *
 * T058: Create ChatContext for state management
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatContextType {
  // Chatbot state
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;

  // Context and intent
  selectedText: string | null;
  currentIntent: string | null;
  setSelectedText: (text: string | null) => void;
  setCurrentIntent: (intent: string | null) => void;

  // Open chatbot with context
  openWithContext: (text: string, intent: string) => void;

  // Conversation history
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  startNewConversation: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);

  // T085: Load messages from localStorage on mount
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatMessages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  // T085: Save messages to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => {
    setIsChatOpen(false);
    // Clear context when closing
    setSelectedText(null);
    setCurrentIntent(null);
  };
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  /**
   * T057: Open chatbot with selected text and intent
   * This method is called from ActionButtons when user clicks an action
   */
  const openWithContext = (text: string, intent: string) => {
    setSelectedText(text);
    setCurrentIntent(intent);
    setIsChatOpen(true);
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  /**
   * T087: Start a new conversation
   * Clears all messages and context
   */
  const startNewConversation = () => {
    setMessages([]);
    setSelectedText(null);
    setCurrentIntent(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatMessages');
    }
  };

  const value: ChatContextType = {
    isChatOpen,
    openChat,
    closeChat,
    toggleChat,
    selectedText,
    currentIntent,
    setSelectedText,
    setCurrentIntent,
    openWithContext,
    messages,
    addMessage,
    clearMessages,
    startNewConversation,
    isLoading,
    setIsLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

/**
 * Custom hook to use ChatContext
 * Throws error if used outside ChatProvider
 */
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

// For backward compatibility
export const useChat = useChatContext;

export default ChatContext;
