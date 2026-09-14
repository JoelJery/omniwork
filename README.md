# OmniWork

OmniWork is a React/Vite interruption-awareness workspace with an optional Express + PostgreSQL backend.

## GitHub Pages

The repository is configured for GitHub Pages. The production frontend includes a local demo data layer, so the published site remains functional even when no backend is configured. Changes are persisted in the browser's local storage.

The Pages workflow is `.github/workflows/deploy-pages.yml`.

The project Pages URL for `JoelJery/omniwork` is:
`https://joeljery.github.io/omniwork/`

## Optional production API

Set `VITE_API_URL` at build time to an HTTPS deployment of the Express API. When the API is reachable, the frontend uses it; when it is unavailable, it automatically falls back to the browser demo layer.

The included `render.yaml` can deploy the API to Render. Configure these server environment variables there:
- `DATABASE_URL`
- `AUTH_SECRET`
- `GEMINI_API_KEY`
- `CORS_ORIGIN` (the exact GitHub Pages origin)

## Local development

```bash
npm install
npm run dev
```

For the API as a standalone service:

```bash
npm run start
```

## Supabase

The API supports PostgreSQL/Supabase through `DATABASE_URL`. The schema is in `supabase/schema.sql`, and the server can create the tables automatically on first connection.

Never commit `.env`, database passwords, `AUTH_SECRET`, or Gemini keys.
