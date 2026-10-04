/**
 * DocumentUpload — drag-and-drop zone for uploading PDFs.
 *
 * Uses react-dropzone for the drag-and-drop UX.
 * Shows upload progress and calls onUploaded when done.
 */

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "../services/api";
import type { DocumentUploadResponse } from "../types";

interface Props {
  onUploaded: (doc: DocumentUploadResponse) => void;
}

export function DocumentUpload({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;

      setUploading(true);
      setError(null);
      try {
        const result = await api.uploadDocument(file);
        onUploaded(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
      } finally {
        setUploading(false);
      }
    },
    [onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <section className="upload-section card">
      <h2>Upload a PDF</h2>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "dropzone-active" : ""} ${uploading ? "dropzone-disabled" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="dropzone-text">Processing…</p>
        ) : isDragActive ? (
          <p className="dropzone-text">Drop the PDF here</p>
        ) : (
          <p className="dropzone-text">
            Drag &amp; drop a PDF here, or <span className="link">browse</span>
          </p>
        )}
      </div>

      {error && <p className="error-msg">{error}</p>}
    </section>
  );
}