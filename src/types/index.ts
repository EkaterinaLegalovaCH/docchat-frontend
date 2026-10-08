export interface Citation { document_id: string; document_name: string; page_number: number | null; chunk_index: number; text_snippet: string; }
export interface ChatResponse { answer: string; citations: Citation[]; model: string; }
export interface ChatRequest { question: string; document_ids?: string[]; }
export interface DocumentUploadResponse { id: string; filename: string; page_count: number; chunk_count: number; status: string; error_message?: string | null; created_at: string; }
export interface DocumentListItem extends DocumentUploadResponse {}
export interface DocumentListResponse { documents: DocumentListItem[]; total: number; }
export interface DeleteResponse { deleted: boolean; document_id: string; }
export interface HealthResponse { status: string; app: string; }
