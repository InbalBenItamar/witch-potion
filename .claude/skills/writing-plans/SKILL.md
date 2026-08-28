---
name: writing-plans
description: Create, revise, or supersede an implementation plan in .plan/. Use whenever the user asks for a plan, an approach, or a design doc for a task, when revising an existing plan after feedback, or when the dev loop asks the orchestrator for a plan. Defines the .plan/ lifecycle, the NNN-YYYY-MM-DD-topic.md filename, required metadata, and the nine required sections.
---

# Writing Plans

`.plan/` at the repository root is the source of truth for plans. `000-backlog.md`
is the task queue; every other file is a plan.

## Before writing anything
1. Read the existing `.plan/*.md` — do this even when the request names no plan
   file. A new plan must build on decisions already made, not contradict them.
2. Read `.doc/product-definition.md` for acceptance criteria and scope.
3. If `.plan/` does not exist, create it.

## Filename
`NNN-YYYY-MM-DD-<topic>.md`, with a sequential numeric prefix — `001`, `002`, `003`.
Example: `.plan/003-2026-08-03-comment-thread.md`.

## Required metadata
Near the top of every plan:

```
Status: draft | active | done | superseded
Owner:
Last updated: YYYY-MM-DD
```

New plans start as `Status: draft`. Only the human approval gate flips a plan to
`active`.

## Required sections
Every plan must contain all nine, in this order:

`Goal` · `Scope` · `Assumptions` · `Open Questions` · `Steps` · `Validation` ·
`Risks` · `Rollout Order` · `Rollback`

## Content rules
- Repository-relative paths only. Never machine-specific absolute paths.
- Generated artifacts belong in `.orchestrate/`. Never create a `docs/` directory.
- Respect the task's declared scope. A task not marked `stack:full` is
  frontend-only — do not plan server work or a `backend/` tree without that marker.
- Never plan a database, a cache, or any persistence unless the backlog task asks
  for it. A potion is generated per request and nothing is stored.
- `Validation` is what QA will use as its checklist, so make each item provable
  by a test or a command.

## Open Questions and approval
- Ask every plan question **inside the plan file**, not in chat.
- Make each question easy to answer, and include a recommended answer.
- Update the plan once answers arrive.
- Request approval before executing the plan.

## Superseding a plan
When a plan is replaced, set the old plan to `Status: superseded` and add a link
to the replacing plan.
