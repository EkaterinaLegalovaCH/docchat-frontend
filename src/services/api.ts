/** HTTP client for the DocChat backend. */

import type { ChatRequest, ChatResponse, DeleteResponse, DocumentListResponse, DocumentUploadResponse, HealthResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: options?.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : detail;
    } catch { /* non-JSON error */ }
    throw new Error(detail);
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
