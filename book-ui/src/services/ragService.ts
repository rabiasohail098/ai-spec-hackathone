/**
 * RAG Service
 *
 * Service layer for interacting with the RAG (Retrieval-Augmented Generation) API.
 * Handles chat messages, context-aware queries, and AI assistance features.
 *
 * T061: Create ragService.ts
 * T062: Implement sendChatMessage() API call with TypeScript types
 * T063: Add error handling and retry logic for failed requests
 * T064: Implement loading states and timeout handling
 */

import { apiClient } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  sources?: string[];
}

export interface ChatRequest {
  question: string;  // Backend expects 'question' not 'query'
  context_text?: string | null;  // Backend expects 'context_text'
  user_id?: string | null;
  conversation_id?: string | null;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
  from_book: boolean;
  relevance_score: number;
}

export interface ConversationHistory {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

class RAGService {
  private readonly CHAT_ENDPOINT = '/api/v1/chat/';
  private readonly CONVERSATIONS_ENDPOINT = '/api/v1/conversations';
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  /**
   * T062: Send chat message to RAG API
   * T063: Includes retry logic for failed requests
   * T064: Implements timeout handling
   */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    let lastError: Error | null = null;

    console.log('[RAGService] Sending chat message:', request);

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[RAGService] Attempt ${attempt}/${this.MAX_RETRIES}`);
        const response = await this.sendWithTimeout<ChatResponse>(
          this.CHAT_ENDPOINT,
          request,
          this.REQUEST_TIMEOUT
        );

        console.log('[RAGService] Success:', response);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(`[RAGService] Attempt ${attempt} failed:`, error);

        // Don't retry on client errors (4xx)
        if (this.isClientError(error)) {
          console.error('[RAGService] Client error, not retrying');
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`[RAGService] Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    console.error('[RAGService] All retries failed');
    throw new Error(
      `Failed to send chat message after ${this.MAX_RETRIES} attempts: ${lastError?.message}`
    );
  }

  /**
   * Send a simple query without context
   */
  async sendQuery(question: string): Promise<ChatResponse> {
    return this.sendChatMessage({ question });
  }

  /**
   * Send a query with selected text and intent
   * Used for inline AI assistance (Summarize, Explain, etc.)
   * Intent is embedded in the question format
   */
  async sendContextualQuery(
    question: string,
    selectedText: string,
    intent: string
  ): Promise<ChatResponse> {
    // Format question based on intent
    let formattedQuestion = question;
    if (intent === 'summarize') {
      formattedQuestion = `Please summarize this: ${question}`;
    } else if (intent === 'explain') {
      formattedQuestion = `Please explain this in simple terms: ${question}`;
    } else if (intent === 'keypoints') {
      formattedQuestion = `Extract the key points from this: ${question}`;
    } else if (intent === 'mindmap') {
      formattedQuestion = `Create a mind map for: ${question}`;
    }

    return this.sendChatMessage({
      question: formattedQuestion,
      context_text: selectedText,
    });
  }

  /**
   * Get conversation history for current user
   */
  async getConversations(): Promise<ConversationHistory[]> {
    try {
      return await apiClient.get<ConversationHistory[]>(this.CONVERSATIONS_ENDPOINT);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(title: string): Promise<ConversationHistory> {
    try {
      return await apiClient.post<ConversationHistory>(this.CONVERSATIONS_ENDPOINT, { title });
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * T064: Send request with timeout
   */
  private async sendWithTimeout<T>(
    endpoint: string,
    data: any,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      apiClient.post<T>(endpoint, data),
      this.timeoutPromise(timeout),
    ]) as Promise<T>;
  }

  /**
   * Create a promise that rejects after a timeout
   */
  private timeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Check if error is a client error (4xx)
   */
  private isClientError(error: any): boolean {
    return error?.status >= 400 && error?.status < 500;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const ragService = new RAGService();
export default ragService;
