# Glossary

## Purpose
- Define canonical domain terms and approved short forms used across code, API routes, docs, and plans.

## Core Terms
- `trouble`
	- Canonical meaning: the thing bothering the child, as they typed it.
	- Use: always `trouble`, never `problem`, `issue`, `worry`, or `complaint`.
- `potion`
	- Canonical meaning: one complete recipe returned for one trouble — name, ingredient
	  list, ordered steps, and closing line.
	- Use: singular in routes and service names. The route is `/api/potion`.
- `ingredient`
	- Canonical meaning: one entry from the approved list in `ingredient.md`.
	- Use: always `ingredient`, never `item`, `component`, or `material`.
- `step`
	- Canonical meaning: one instruction inside a potion, in order.
	- Use: always `step`, never `instruction` or `direction`.
- `brew`
	- Canonical meaning: the act of turning one trouble into one potion. The verb for a
	  request, and the label on the button the child presses.
	- Use: `brew`, never `generate`, `create`, or `submit` in anything the child reads.
- `witch`
	- Canonical meaning: the character who answers. Her voice lives in the prompt.
	- Use: `witch` in product docs and interface copy.
- `generator`
	- Canonical meaning: a thing that turns a trouble into a potion. There are two —
	  see below — behind one shared interface.
	- Use: `generator`, never `provider`, `engine`, or `backend`.
- `offline generator`
	- Canonical meaning: the generator that runs with no API key, matching the trouble
	  against tagged ingredients in local code.
	- Use: `offline generator`, never `fallback`, `mock`, `stub`, or `local`.
- `witch generator`
	- Canonical meaning: the generator that asks Claude, constrained to the approved
	  ingredient list.
	- Use: `witch generator`, never `AI`, `LLM`, `model`, or `Claude` in code names.
- `filter`
	- Canonical meaning: the step that removes unapproved ingredients from a candidate
	  potion, cascades those removals into the steps, and enforces the floor of four.
	- Use: `filter`, never `validator`, `sanitizer`, `guard`, or `checker`.
- `prompt`
	- Canonical meaning: the versioned file of instructions sent to Claude.
	- Use: `prompt`, and it is a file, never a string literal.
- `chip`
	- Canonical meaning: one clickable suggested trouble shown beside the text box.
	- Use: `chip`, never `pill`, `suggestion`, or `example`. Never `tag` either — that
	  word is taken, see `feeling tag` below.
- `feeling tag`
	- Canonical meaning: one of the fixed feelings an ingredient answers, listed in
	  `ingredient.md` — `scared`, `lonely`, `angry` and the rest. The offline generator
	  matches a trouble against these to choose ingredients.
	- Use: `feeling tag` in prose, `tag` in code where the context is an ingredient.
	  Never `mood`, `emotion`, `category`, or `label`.

## Naming Alignment
- Keep this glossary aligned with naming decisions in `../.claude/rules/naming.md`.
- If a new domain term is introduced, add it here before broad usage.

## Update Rules
- Add new terms when introducing a new bounded context, entity, or shared API concept.
- Avoid synonyms for existing terms unless explicitly approved and documented here.
