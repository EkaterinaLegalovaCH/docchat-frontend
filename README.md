# DocChat

DocChat is a full-stack Retrieval-Augmented Generation (RAG) application for asking questions about uploaded PDF documents and receiving answers with inspectable citations.

## Demo

Watch the application demonstration:

[![Watch the DocChat demo](https://img.shields.io/badge/Watch-application%20demo-2ea44f?style=for-the-badge)](./demo/dockchat_demo.mp4)

The video shows the real user workflow:

1. Upload PDF documents.
2. Select which documents to search.
3. Ask a question in natural language.
4. Retrieve relevant passages from the uploaded documents.
5. Generate an answer grounded in those passages.
6. Inspect document and page citations returned with the answer.

The demo uses two accessible papers about exercise, breathing exercises, and sleep quality. This makes the application understandable without requiring an AI or machine-learning background.

## Live application

- Frontend: https://docchat-frontend-gules.vercel.app
- Backend health check: https://docchat-backend-dt3x.onrender.com/api/health

The current deployment is a controlled portfolio demo. It should only be used with public or disposable documents. Do not upload confidential, personal, medical, legal, or financial files.

## How it works

### Document upload and indexing

When a user uploads a PDF, the backend:

1. Validates the file type, PDF signature, and upload size.
2. Stores the original file in private Supabase Storage.
3. Extracts text page by page with PyMuPDF.
4. Splits the text into overlapping chunks while preserving page numbers.
5. Creates a 1536-dimensional embedding for each chunk with OpenAI `text-embedding-3-small`.
6. Stores the chunks and embeddings in PostgreSQL with pgvector.

### Question answering

When a user asks a question, the backend:

1. Creates an embedding for the question using the same embedding model.
2. Searches the vector store for the five most relevant chunks.
3. Optionally restricts the search to selected documents.
4. Sends the retrieved context to OpenAI `gpt-4o-mini`.
5. Instructs the model to answer only from the supplied context and to cite its sources.
6. Returns the answer with document name, page number, chunk index, and a text snippet.

The application does not send the complete collection of PDFs to the model for every question. It retrieves only the most relevant passages.

## Technology

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI
- **Database:** Supabase PostgreSQL with pgvector
- **File storage:** Supabase Storage
- **PDF processing:** PyMuPDF
- **AI services:** OpenAI embeddings and chat completion
- **Frontend hosting:** Vercel
- **Backend hosting:** Render

## Repository structure

This repository contains the frontend:

```text
src/
├── App.tsx                    # top-level state and page layout
├── components/
│   ├── ChatInterface.tsx      # question input, answers, and chat history
│   ├── CitationCard.tsx       # expandable source citation
│   ├── DocumentList.tsx        # uploaded documents and deletion
│   ├── DocumentUpload.tsx     # PDF drag-and-drop upload
│   └── Header.tsx             # application header
├── services/
│   └── api.ts                 # HTTP client for the FastAPI backend
└── types/
    └── index.ts               # TypeScript API models
```

The backend is maintained separately:

https://github.com/EkaterinaLegalovaCH/docchat-backend

Important backend modules include:

- `app/routers/documents.py` — upload, list, and delete endpoints
- `app/routers/chat.py` — question endpoint
- `app/services/pdf_processor.py` — PDF extraction and chunking
- `app/services/embeddings.py` — OpenAI embedding calls and dimension validation
- `app/services/rag.py` — retrieval, prompt construction, generation, and citations
- `app/db/supabase.py` — database and storage access
- `supabase/migrations/001_initial_schema.sql` — PostgreSQL and pgvector schema

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

For a production build:

```bash
npm run build
```

The frontend reads these public configuration values from Vite environment variables (copy `.env.example` to `.env`):

```text
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

For production, set `VITE_API_URL` to `https://docchat-backend-dt3x.onrender.com`, and set the Supabase project URL plus its browser-safe anon key. The anon key is intended for browser code; never put `SUPABASE_KEY`, a service-role key, `OPENAI_API_KEY`, or any other server-side credential in Vite variables.

### Authentication and document privacy

Users must sign up or sign in with email and password before the document workspace is shown. Supabase persists the session in the browser and the sign-out button clears it. The API client reads the current session for every request and sends `Authorization: Bearer <access token>`. A 401 signs the user out once and returns them to the sign-in form; requests are not retried indefinitely.

The backend is responsible for validating tokens and enforcing ownership. New documents are assigned to their authenticated user, and list, delete, and chat retrieval must be scoped to that user. Existing legacy rows without an owner remain orphaned and must not be exposed to authenticated users. Apply the corresponding backend migration before using this frontend against a protected deployment.

Never upload confidential, personal, medical, legal, or financial files to the public demo.

## Example demo questions

The demo documents cover exercise, breathing exercises, and sleep quality. Useful questions include:

- What do these two papers say about how exercise or breathing exercises may affect sleep quality? Compare their conclusions and cite the pages.
- What limitations do the authors mention about the studies or evidence, and what further research do they say is needed? Cite the relevant pages.
- How do the conclusions of the exercise paper and the breathing-exercises paper differ? Cite at least one page from each document.

## Demo source attribution

The recording uses these open-access sources:

1. Xie Y, Liu S, Chen X-J, Yu H-H, Yang Y, Wang W. *Effects of Exercise on Sleep Quality and Insomnia in Adults: A Systematic Review and Meta-Analysis of Randomized Controlled Trials.* Frontiers in Psychiatry, 2021. DOI: [10.3389/fpsyt.2021.664499](https://doi.org/10.3389/fpsyt.2021.664499).
2. Steinmane K, Fernate A. *The Effect of Breathing Exercises on Adults' Sleep Quality: An Intervention That Works.* Frontiers in Sleep, 2025. DOI: [10.3389/frsle.2025.1603713](https://doi.org/10.3389/frsle.2025.1603713).

Both papers are distributed under the **Creative Commons Attribution (CC BY)** licence. Credit the authors and original publications when redistributing the papers or screenshots.

## Testing and verification

The backend has automated tests for PDF processing, API behavior, provider configuration, embedding dimensions, and database schema checks. The production flow has also been verified with real disposable PDFs:

```text
upload → PDF extraction → chunking → embeddings → vector retrieval → cited answer → deletion
```

The frontend production build is verified with:

```bash
npm run build
```

## Limitations and next steps

This is a portfolio project rather than a finished public SaaS product. Known limitations include:

- the deployed frontend/backend must be configured with matching Supabase Auth and ownership migration settings before this flow is live;
- rate limiting and usage quotas are enforced by the backend, not by this frontend;
- scanned PDFs require OCR, which is not currently included;
- the model is instructed to cite sources, but answer faithfulness is not independently scored;
- chat history is kept in the frontend session rather than persisted on the server.

The first production-hardening step is authentication with per-user document ownership, followed by rate limiting and clearer handling of provider errors.

## Health and safety note

DocChat is a document-grounded question-answering demonstration. Citations make answers easier to inspect, but the application is not a medical, legal, financial, or other professional advice service.

## Licence

This repository contains the DocChat frontend source code. Refer to the repository history and dependency licences for the applicable software licences. The demo PDFs are third-party open-access publications and remain subject to their authors' CC BY terms.
