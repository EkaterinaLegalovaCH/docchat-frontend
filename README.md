# DocChat — React Frontend

A React + Vite + TypeScript frontend for the DocChat RAG application.
Upload PDFs and ask questions with AI-generated answers and citations.

## Quick Start

```bash
npm install
npm run dev        # starts on http://localhost:5173
npm run build      # production build to dist/
```

The Vite dev server proxies `/api` requests to `http://localhost:8000`
(the FastAPI backend). See `vite.config.ts`.

## Environment

Set `VITE_API_URL` to your backend URL in production (e.g. Vercel + Fly.io):

```bash
VITE_API_URL=https://your-backend.fly.dev
```

## Project Structure

```
src/
  components/
    Header.tsx           # App branding
    DocumentUpload.tsx   # Drag-and-drop PDF upload
    DocumentList.tsx     # List + delete documents
    CitationCard.tsx     # Expandable source citation
    ChatInterface.tsx    # Q&A input + answer display
  services/
    api.ts               # HTTP client for all backend calls
  types/
    index.ts             # TypeScript interfaces matching API models
  App.tsx                # Root component, state, layout
  main.tsx               # Entry point
  index.css              # Global styles
```