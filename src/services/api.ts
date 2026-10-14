/** HTTP client for the DocChat backend. */

import type { ChatRequest, ChatResponse, DeleteResponse, DocumentListResponse, DocumentUploadResponse, HealthResponse } from "../types";
import { authClient } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || "";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await authClient.auth.getSession();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : detail;
    } catch { /* non-JSON error */ }
    if (res.status === 401) {
      // A failed request is never retried. Sign-out lets the auth listener return
      // the app to the login form and prevents an expired token loop.
      await authClient.auth.signOut();
      detail = "Your session expired. Please sign in again.";
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthResponse>("/api/health"),
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<DocumentUploadResponse>("/api/documents/upload", { method: "POST", body: formData });
  },
  listDocuments: () => request<DocumentListResponse>("/api/documents"),
  deleteDocument: (id: string) => request<DeleteResponse>(`/api/documents/${id}`, { method: "DELETE" }),
  ask: (req: ChatRequest) => request<ChatResponse>("/api/chat/ask", { method: "POST", body: JSON.stringify(req) }),
};
