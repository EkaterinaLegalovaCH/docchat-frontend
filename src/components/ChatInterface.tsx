/**
 * ChatInterface — the main Q&A area.
 *
 * Has a text input for the question and a scrollable answer area.
 * Shows citations expandably beneath each answer.
 */

import { useState, useRef, useEffect } from "react";
import { api } from "../services/api";
import type { ChatResponse } from "../types";
import { CitationCard } from "./CitationCard";

interface Props {
  documentIds: string[]; // selected document IDs to filter by
  hasDocuments: boolean;
}

export function ChatInterface({ documentIds, hasDocuments }: Props) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ q: string; r: ChatResponse }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest answer
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.ask({
        question: q,
        document_ids: documentIds.length > 0 ? documentIds : undefined,
      });
      setHistory((prev) => [...prev, { q, r: response }]);
      setQuestion("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-section card">
      <h2>Ask a Question</h2>

      {!hasDocuments && (
        <p className="empty-state">Upload a PDF first to start asking questions.</p>
      )}

      {/* Chat history */}
      <div className="chat-history">
        {history.map((item, i) => (
          <div key={i} className="chat-entry">
            <div className="chat-question">
              <strong>You:</strong> {item.q}
            </div>
            <div className="chat-answer">
              <strong>DocChat:</strong>
              <p className="answer-text">{item.r.answer}</p>

              {item.r.citations.length > 0 && (
                <div className="citations">
                  <p className="citations-label">Sources ({item.r.citations.length})</p>
                  {item.r.citations.map((c, ci) => (
                    <CitationCard key={ci} citation={c} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* Input */}
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder={
            hasDocuments
              ? "Ask anything about your documents…"
              : "Upload a document first…"
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading || !hasDocuments}
        />
        <button
          type="submit"
          className="btn-submit"
          disabled={loading || !question.trim() || !hasDocuments}
        >
          {loading ? "…" : "Ask"}
        </button>
      </form>
    </section>
  );
}