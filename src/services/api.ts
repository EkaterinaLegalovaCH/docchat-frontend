/**
 * API service — all HTTP calls to the DocChat backend.
 *
 * Uses the Vite proxy in development (/api → localhost:8000).
 * In production, set VITE_API_URL to the backend URL.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "";

import type {
  HealthResponse,
  DocumentUploadResponse,
  DocumentListResponse,
  DeleteResponse,
  ChatRequest,
  ChatResponse,
} from "../types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  /** Health check */
  health: () => request<HealthResponse>("/api/health"),

  /** Upload a PDF file */
  uploadDocument: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Upload failed: HTTP ${res.status} — ${body}`);
    }
    return res.json();
  },

  /** List all uploaded documents */
  listDocuments: () => request<DocumentListResponse>("/api/documents/"),

  /** Delete a document */
  deleteDocument: (id: string) =>
    request<DeleteResponse>(`/api/documents/${id}`, { method: "DELETE" }),

  /** Ask a question */
  ask: (req: ChatRequest) =>
    request<ChatResponse>("/api/chat/ask", {
      method: "POST",
      body: JSON.stringify(req),
    }),
};