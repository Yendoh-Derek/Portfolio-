# Architecture (static-first)

## Content

All portfolio copy and structure live under `content/*.json`. Edit files and redeploy—no admin UI or Firestore CMS.

| Path                      | Role                                    |
| ------------------------- | --------------------------------------- |
| `content/profile.json`    | Identity, about copy, skill summaries (AI context) |
| `content/skills.json`     | Homepage skill bars                     |
| `content/experience.json` | Work experience timeline                |
| `content/projects.json`   | Projects list + detail pages            |
| `content/services.json`   | Services page marketing copy            |

RAG markdown for the chatbot: `lib/project-docs/{slug}.md` (slug must match `projects.json`).

## Code layout

```
app/
  (site)/           Public pages
  api/analytics/    Optional visit counter (Firebase)

lib/
  content/          Types, JSON loaders, cached queries
  ai/               Gemini prompt, RAG docs, chat handler
  analytics/        Optional Firebase (visits, rate limits)

components/
  layout/           Nav, footer, site shell, conditional effects
  sections/         Page sections (hero, projects, contact, …)
  effects/          Canvas/visual effects (particle field, sigils, …)
  projects/         Project detail UI
  ui/               Shared UI primitives
  chatbot.tsx       AI UI
  chat-provider.tsx Chat state + floating launcher
```

## AI

`app/api/chat/stream/route.ts` builds context from request messages and full project documentation (loaded via `getCachedAllDocs` from `lib/ai/system-prompt.ts`), then streams responses from the Google Gemini API. Rate limits use Firebase Admin when service account env vars are set.

## Deployment (Vercel)

- Required: `GEMINI_API_KEY`, `NEXT_PUBLIC_APP_URL`, `WEB3FORMS_ACCESS_KEY` (contact)
- Optional: Firebase env vars for visit counter + chat rate limits
- `deploy.sh` is legacy GCP Cloud Run; use Vercel Git integration instead.
