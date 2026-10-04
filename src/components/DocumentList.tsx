/**
 * DocumentList — shows uploaded documents with a delete button each.
 */

import { api } from "../services/api";
import type { DocumentListItem } from "../types";

interface Props {
  documents: DocumentListItem[];
  onDelete: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: Props) {
  if (documents.length === 0) {
    return (
      <section className="doc-list-section card">
        <h2>Your Documents</h2>
        <p className="empty-state">No documents uploaded yet.</p>
      </section>
    );
  }

  const handleDelete = async (id: string, filename: string) => {
    if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    try {
      await api.deleteDocument(id);
      onDelete(id);
    } catch (err) {
      alert(`Failed to delete: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <section className="doc-list-section card">
      <h2>Your Documents ({documents.length})</h2>
      <ul className="doc-list">
        {documents.map((doc) => (
          <li key={doc.id} className="doc-item">
            <div className="doc-info">
              <span className="doc-name">{doc.filename}</span>
              <span className="doc-meta">
                {doc.page_count} page{doc.page_count !== 1 ? "s" : ""} ·{" "}
                {doc.chunk_count} chunk{doc.chunk_count !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              className="btn-delete"
              onClick={() => handleDelete(doc.id, doc.filename)}
              title="Delete document"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}