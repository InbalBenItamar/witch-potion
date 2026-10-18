# Witch Potion

Tell a witch what is bothering you. She hands back a potion recipe you can really make,
out of things already in the kitchen, the garden, or the craft drawer.

Built for a child of about seven to nine and a grown-up to play together. The potion is
the excuse — the afternoon is the point. The witch takes a grumble completely seriously
and answers it with petals, glitter and a fizz.

## Status

The app works end to end with no API key. `frontend/` posts the trouble to
`backend/`, whose offline generator brews a fresh potion from the approved list every
time, and the filter checks it before it reaches the screen. The witch generator — the
Claude path — is not built yet. See `.plan/000-backlog.md` for what is queued next.

## How it works

Every potion is assembled from a closed list of approved ingredients in
[`.doc/ingredient.md`](.doc/ingredient.md) — real, safe, easy to find, nothing from an
animal, nothing sharp, and nothing harmful if a child tastes it despite being told not to.

There are two generators behind one interface:

- the **offline generator** matches the trouble against feeling tags and assembles a
  potion in local code. No API key, no network.
- the **witch generator** asks Claude, constrained to the approved list.

Whichever runs, the result goes through the same filter: anything not on the approved
list is dropped, removals cascade into the steps, and if fewer than four approved
ingredients survive, the offline potion is served instead. A language model asked for a
witch's potion will reach for eye of newt sooner or later. The list is what stops it.

## Running it

Two processes, one terminal each:

```bash
cd backend && npm install && npm run dev     # Node service on http://localhost:8787
cd frontend && npm install && npm run dev    # the app on http://localhost:5173
```

Vite proxies `/api` to the backend, so open the app's address and brew. If 5173 is
taken, pass another port: `npm run dev -- --port 5180`. The backend's port is `PORT`
(default `8787`); see `backend/.env.example`.

Tests run with no network and no key:

```bash
cd backend && npm test                        # unit + route tests
cd frontend && npm test                       # unit tests
cd frontend && npm run test:e2e               # Playwright; starts both servers on 8787 and 5199
```

The witch works with no API key at all — the offline generator needs nothing. Once the
witch generator lands, Claude-written potions will need a key: copy
`backend/.env.example` to `backend/.env` and add one from
[platform.claude.com](https://platform.claude.com/dashboard). The key is read only by the
Node service and never reaches the browser. `.env` is gitignored — do not commit it.

## Repository map

| Path | Purpose |
|---|---|
| `.doc/product-definition.md` | What the product is, and the acceptance criteria QA checks against |
| `.doc/ingredient.md` | The approved ingredient list. Nothing outside it may reach a child |
| `.doc/architecture.md` | Components, data flow, and where the key lives |
| `.doc/glossary.md` | The project's words, so agents do not invent synonyms |
| `.plan/` | Prioritized backlog and approved implementation plans |
| `.claude/rules/` | Always-on coding and workflow constraints |
| `.claude/skills/` | On-demand procedural playbooks |
| `.claude/agents/` | Role definitions for orchestrator, frontend, backend, qa, and security-reviewer |
| `.claude/hooks/` | Runtime guardrails that enforce boundaries and safety |
| `frontend/` | The React + Vite app — text box, chips, Brew, the potion |
| `backend/` | The Node service — `POST /api/potion`, generators, filter, ingredient data |
| `.orchestrate/` | Generated outputs from the latest dev-loop run (gitignored) |
| `AGENTS.md` | Canonical operating rules and guardrails for all agents |
| `CLAUDE.md` | Loads AGENTS.md into compatible runtimes |

## How work moves through this repo

1. Add or prioritize tasks in `.plan/000-backlog.md`.
2. Create or update an implementation plan in `.plan/NNN-YYYY-MM-DD-topic.md`.
3. Run the dev loop from the repo root: `npm run dev-loop`. It plans, waits for
   `APPROVED`, runs the frontend, backend and QA agents, and waits again. It never
   commits, and it refuses to start on uncommitted changes. Check the hooks first with
   `npm run verify:guardrails`.
4. Review generated artifacts in `.orchestrate/`.
5. Validate acceptance criteria against `.doc/product-definition.md`.

## Conventions

- Use singular domain naming as defined in `.claude/rules/naming.md` and `.doc/glossary.md`.
- Do implementation work on dedicated branches (`feat/*`, `fix/*`, `chore/*`, `docs/*`).
- Do not commit or expose secrets.
- JavaScript and TypeScript are formatted by Prettier and linted by ESLint. Do not
  hand-format — see `.claude/rules/code-style.md`.

## Credits

Built on the [ai4dev-agent-files](https://github.com/vyaron/ai4dev-agent-files)
scaffold by Yaron Biton (MisterBit AI4Dev workshop). The agent definitions,
hooks, rules, and planning conventions under `.claude/` originate there; the
application is my own.

## License

No license file is currently defined in this repository.
