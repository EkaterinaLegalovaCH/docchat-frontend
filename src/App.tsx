/**
 * App — root component.
 *
 * Manages:
 *   - The list of uploaded documents (state)
 *   - Which documents are selected for Q&A filtering
 *   - Layout: header, upload/list sidebar, chat area
 */

import { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { DocumentUpload } from "./components/DocumentUpload";
import { DocumentList } from "./components/DocumentList";
import { ChatInterface } from "./components/ChatInterface";
import type { DocumentUploadResponse, DocumentListItem } from "./types";

export default function App() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const hasDocuments = documents.length > 0;

  // Called after a successful upload
  const handleUploaded = useCallback((doc: DocumentUploadResponse) => {
    const item: DocumentListItem = {
      id: doc.id,
      filename: doc.filename,
      page_count: doc.page_count,
      chunk_count: doc.chunk_count,
      created_at: doc.created_at,
    };
    setDocuments((prev) => [item, ...prev]);
    setSelectedIds((prev) => [...prev, doc.id]);
  }, []);

  // Called after a delete
  const handleDelete = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => prev.filter((did) => did !== id));
  }, []);

  // Toggle whether a document is selected for filtering
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="app">
      <Header />

      <main className="main-layout">
        {/* Left sidebar */}
        <aside className="sidebar">
          <DocumentUpload onUploaded={handleUploaded} />

          <DocumentList documents={documents} onDelete={handleDelete} />

          {/* Document filter chips */}
          {hasDocuments && (
            <section className="card filter-section">
              <h2>Filter Questions</h2>
              <div className="filter-chips">
                <button
                  className={`chip ${selectedIds.length === documents.length ? "chip-active" : ""}`}
                  onClick={() => setSelectedIds(documents.map((d) => d.id))}
                >
                  All
                </button>
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    className={`chip ${selectedIds.includes(doc.id) ? "chip-active" : ""}`}
                    onClick={() => toggleSelected(doc.id)}
                  >
                    {doc.filename.length > 20
                      ? doc.filename.slice(0, 17) + "…"
                      : doc.filename}
                  </button>
                ))}
              </div>
              <p className="filter-hint">
                {selectedIds.length === 0
                  ? "Select documents to search, or select All."
                  : `Searching ${selectedIds.length} document${selectedIds.length !== 1 ? "s" : ""}`}
              </p>
            </section>
          )}
        </aside>

        {/* Right main area */}
        <section className="content">
          <ChatInterface
            documentIds={selectedIds}
            hasDocuments={hasDocuments}
          />
        </section>
      </main>
    </div>
  );
}