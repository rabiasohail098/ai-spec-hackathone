/**
 * API Client
 *
 * Base HTTP client for making requests to the backend API.
 * Handles authentication, error handling, and request/response formatting.
 */

// Use window.location for dynamic backend URL in browser environment
const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    // Agar localhost hai to port 8000 use karein, warna production URL
    const port =
      hostname === "localhost" || hostname === "127.0.0.1"
        ? "8000"
        : window.location.port;

    // Agar production me port empty hai (standard 80/443)
    const portString = port ? `:${port}` : "";

    return `${window.location.protocol}//${hostname}${portString}`;
  }
  // Fallback for SSR
  return typeof window !== 'undefined'
    ? (window as any).env?.REACT_APP_API_URL ||
      (process.env.NODE_ENV === 'production'
        ? `${window.location.origin}` // For GitHub Pages deployment
        : 'http://localhost:8000') // For local development
    : 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

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
      return localStorage.getItem("authToken");
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
