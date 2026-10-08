# DocChat frontend

React, Vite, and TypeScript UI for the DocChat backend. The existing simple upload, document list, filters, and citation-based chat layout is kept intentionally easy to study.

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
npm run build
```

`VITE_API_URL` is empty for local Vite proxying and should be the deployed backend URL in production. The frontend must never contain `SUPABASE_KEY`, `OPENAI_API_KEY`, or any other provider credential.

For a free-tier demo, deploy this app to Vercel and the FastAPI app to Render, then set `VITE_API_URL` in Vercel and add the Vercel origin to backend `CORS_ORIGINS`. Hosting may be free; OpenAI API access, credits, pricing, and rate limits are account-dependent.
