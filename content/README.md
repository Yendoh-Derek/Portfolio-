# Portfolio content (static)

Edit JSON files here; no admin UI or database required for site content.

| File | Purpose |
|------|---------|
| `profile.json` | Name, title, contact, links, high-level skill lists (used by AI) |
| `skills.json` | Skill bars on the homepage |
| `experience.json` | Timeline and work history |
| `projects.json` | Featured projects and `/projects/[slug]` pages |

**RAG (chatbot):** Add or update `lib/project-docs/{slug}.md` where `slug` matches `projects.json`.

After changes, redeploy (Vercel rebuilds on push) or restart `npm run dev` locally.
