---
name: database-schema
description: Change or bootstrap the database schema. Use when adding or altering a table, column, or index, writing a migration, or setting up a local database from scratch. Covers the schema.sql source of truth, core table shape, migration rules, and seed expectations.
---

# Database Schema

> This product stores nothing. A potion is generated per request and discarded;
> there is no database and version one does not need one. Apply this skill only
> when a backlog task explicitly introduces persistence — currently only the
> prepare-ahead list, which has to remember a ticked ingredient set.

## Source of truth
`schema.sql` is a standalone bootstrap script for a full local setup. It creates
every table and index needed for a baseline, and contains idempotent seed inserts
for orgs.

## Core tables

### `org`
| Column | Type |
|---|---|
| `id` | `text PRIMARY KEY` |
| `name` | `text NOT NULL` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` |
| `deleted_at` | `timestamptz NULL` |
| `data` | `jsonb NOT NULL DEFAULT '{}'::jsonb` |

## Migrations
- Keep migration files aligned with `schema.sql` intent.
- A schema change updates **both** the migration artifact and the bootstrap script —
  never one without the other.
- Prefer additive, reversible changes where practical.
- Name columns and tables per the naming rule: singular, `org` not `organization`.

## Tests
Migration-sensitive queries are a required coverage area — see the
`writing-tests` skill.
