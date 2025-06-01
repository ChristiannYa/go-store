"use client";

import { ApiHeaders, RequestData } from "@/app/definitions";

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
    const token = this.getAccessToken?.();

    const headers: ApiHeaders = {
      "Content-Type": "application/json",
      // Spread existing headers if they exist
      ...((options.headers as Record<string, string>) || {}),
    };

    // Only add token on first request
    if (token && !isRetry) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle token expiration - only on first request
    if (response.status === 401 && !isRetry && this.onTokenExpired) {
      try {
        // Refresh token
        const newToken = await this.onTokenExpired();
        if (newToken) {
          const updatedOptions = {
            ...options,
            headers: {
              ...((options.headers as Record<string, string>) || {}),
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          };
          return this.makeRequest(endpoint, updatedOptions, true);
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
