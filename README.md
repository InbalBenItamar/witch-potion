# Witch Potion

Tell a witch what is bothering you. She hands back a potion recipe you can really make,
out of things already in the kitchen, the garden, or the craft drawer.

Built for a child of about seven to nine and a grown-up to play together. The potion is
the excuse — the afternoon is the point. The witch takes a grumble completely seriously
and answers it with petals, glitter and a fizz.

## Status

Version one is **not built yet**. This repository currently holds the product documents,
the approved ingredient list, and the agent scaffolding that will build it. The commands
under Running it below describe the intended shape and do not work yet.

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

```bash
npm install          # in frontend/ and backend/
npm run dev          # in both
```

The witch works with no API key at all — the offline generator needs nothing. To get
Claude-written potions, copy `.env.example` to `backend/.env` and add a key from
[platform.claude.com](https://platform.claude.com/dashboard):

```env
ANTHROPIC_API_KEY=your-key-here
```

The key is read only by the Node service and never reaches the browser. `.env` is
gitignored — do not commit it.

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
| `.orchestrate/` | Generated outputs from the latest dev-loop run |
| `AGENTS.md` | Canonical operating rules and guardrails for all agents |
| `CLAUDE.md` | Loads AGENTS.md into compatible runtimes |

## How work moves through this repo

1. Add or prioritize tasks in `.plan/000-backlog.md`.
2. Create or update an implementation plan in `.plan/NNN-YYYY-MM-DD-topic.md`.
3. Execute the dev loop in your local environment.
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
