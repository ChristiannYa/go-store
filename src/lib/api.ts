"use client";

// Define proper types for request data
type RequestData =
  | Record<string, unknown>
  | FormData
  | string
  | null
  | undefined;

// ApiHeaders type that allows string indexing
interface ApiHeaders extends Record<string, string> {
  "Content-Type": string;
}

class ApiClient {
  private baseURL: string;
  private getAccessToken: (() => string | null) | null = null;
  private onTokenExpired: (() => Promise<string | null>) | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setTokenGetter(getter: () => string | null) {
    this.getAccessToken = getter;
  }

  setTokenRefreshHandler(handler: () => Promise<string | null>) {
    this.onTokenExpired = handler;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;

    // Get access token and add to headers
    const token = this.getAccessToken?.();

    const headers: ApiHeaders = {
      "Content-Type": "application/json",
      // Spread existing headers if they exist
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add authorization header if token exists and this isn't a retry with custom auth
    if (token && !isRetry) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle token expiration
    if (response.status === 401 && !isRetry && this.onTokenExpired) {
      try {
        const newToken = await this.onTokenExpired();
        if (newToken) {
          // Retry request with new token
          const retryHeaders: ApiHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };

          return fetch(url, {
            ...options,
            headers: retryHeaders,
            credentials: "include",
          });
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }

    return response;
  }

  async get(endpoint: string, options: RequestInit = {}) {
    return this.makeRequest(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint: string, data?: RequestData, options: RequestInit = {}) {
    return this.makeRequest(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: RequestData, options: RequestInit = {}) {
    return this.makeRequest(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string, options: RequestInit = {}) {
    return this.makeRequest(endpoint, { ...options, method: "DELETE" });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");
