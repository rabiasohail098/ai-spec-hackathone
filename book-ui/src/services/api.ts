/**
 * API Client
 *
 * Base HTTP client for making requests to the backend API.
 * Handles authentication, error handling, and request/response formatting.
 */

// Use window.location for dynamic backend URL in browser environment
const getApiBaseUrl = (): string => {
  // Check for environment variable first (for production deployments)
  if (typeof window !== 'undefined' && (window as any).env?.BACKEND_URL) {
    return (window as any).env.BACKEND_URL;
  }

  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;

    // For localhost development, always use localhost:8001
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8001";
    }

    // For production, you should set BACKEND_URL in .env
    // Fallback to same origin if not set
    return `${window.location.protocol}//${hostname}`;
  }

  // Fallback for SSR
  return 'http://localhost:8001';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('[API Client] Using backend URL:', API_BASE_URL);

interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      // Check for both 'token' and 'authToken' for compatibility
      return localStorage.getItem("token") || localStorage.getItem("authToken");
    }
    return null;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.detail || errorData.message || error.message;
        error.details = errorData;
      } catch {
        // Ignore JSON parse error on error response
      }

      throw error;
    }

    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }
    return response.json();
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data: any,
    includeAuth: boolean = true,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data: any,
    includeAuth: boolean = true,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
