/**
 * CitationCard — displays one source citation for an answer.
 */

import type { Citation } from "../types";

export function CitationCard({ citation }: { citation: Citation }) {
  return (
    <details className="citation-card">
      <summary className="citation-summary">
        <strong>{citation.document_name}</strong>
        {citation.page_number != null && <span> — Page {citation.page_number}</span>}
      </summary>
      <blockquote className="citation-snippet">
        &ldquo;{citation.text_snippet}&rdquo;
      </blockquote>
    </details>
  );
}