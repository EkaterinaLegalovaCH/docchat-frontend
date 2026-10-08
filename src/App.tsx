import { useCallback, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { DocumentUpload } from "./components/DocumentUpload";
import { DocumentList } from "./components/DocumentList";
import { ChatInterface } from "./components/ChatInterface";
import { api } from "./services/api";
import type { DocumentUploadResponse, DocumentListItem } from "./types";

export default function App() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasDocuments = documents.length > 0;

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await api.listDocuments();
      setDocuments(result.documents);
      setSelectedIds((current) => current.filter((id) => result.documents.some((doc) => doc.id === id)));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDocuments(); }, [loadDocuments]);

  const handleUploaded = useCallback((doc: DocumentUploadResponse) => {
    const item: DocumentListItem = { ...doc };
    setDocuments((prev) => [item, ...prev]);
    setSelectedIds((prev) => [...prev, doc.id]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setSelectedIds((prev) => prev.filter((docId) => docId !== id));
  }, []);

  const toggleSelected = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="app">
      <Header />
      <main className="main-layout">
        <aside className="sidebar">
          <DocumentUpload onUploaded={handleUploaded} />
          {loading && <p className="empty-state">Loading documents…</p>}
          {loadError && <p className="error-msg">{loadError} <button onClick={() => void loadDocuments()}>Retry</button></p>}
          {!loading && <DocumentList documents={documents} onDelete={handleDelete} />}
          {hasDocuments && (
            <section className="card filter-section">
              <h2>Filter Questions</h2>
              <div className="filter-chips">
                <button className={`chip ${selectedIds.length === documents.length ? "chip-active" : ""}`} onClick={() => setSelectedIds(documents.map((doc) => doc.id))}>All</button>
                {documents.map((doc) => <button key={doc.id} className={`chip ${selectedIds.includes(doc.id) ? "chip-active" : ""}`} onClick={() => toggleSelected(doc.id)}>{doc.filename.length > 20 ? `${doc.filename.slice(0, 17)}…` : doc.filename}</button>)}
              </div>
              <p className="filter-hint">{selectedIds.length === 0 ? "Select documents to search, or select All." : `Searching ${selectedIds.length} document${selectedIds.length !== 1 ? "s" : ""}`}</p>
            </section>
          )}
        </aside>
        <section className="content"><ChatInterface documentIds={selectedIds} hasDocuments={hasDocuments} /></section>
      </main>
    </div>
  );
}
