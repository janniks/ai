# AGENTS.md

## Generic agent management

### Format

- All work in md files, in-repo. No GitHub issues unless explicitly asked.
- Short bullets, few full sentences. Readable at 1/4 desktop width or on mobile.
- Commit after each meaningful change. Conventional commits.

### Dirs

- `specs/` — feature intent (problem, stories, decisions). 1:1 by name with `plans/`. In-progress drafts suffixed `-DRAFT.md`.
- `plans/` — phased implementation. Active plan suffixed `-RUNNING.md` (contains an inline phase-log table).
- `notes/` — flat, unstructured scratchpad. One thought per file. Revisit only on request.
- `docs/` — stable reference (style guide, architecture).

### Flow

- `/grill-me` → `/create-spec` → `/create-plan` → implement phase-by-phase → commit per phase.
- In-progress artifacts are suffixed: `specs/<feature>-DRAFT.md` while interviewing, `plans/<feature>-RUNNING.md` while implementing. Rename back (drop the suffix) on finalize / completion.
- Tick acceptance criteria and append a phase-log row inside the `-RUNNING.md` plan after each commit.
- Deferred items: front-matter `status: deferred` on whatever file fits. No dedicated dir.

### Skills

- `/create-spec`, `/create-plan` — local forks under [`skills/`](./skills), installed via `npx skills add janniks/janniks-ai`.
- Other skills (grill-me, tdd, write-pr-description, improve-codebase-architecture, firecrawl-\*) come from upstream.

## This repo

- `skills/` — agent skills we manage. Each is a folder with a `SKILL.md`.
- `web/` — Fumadocs site documenting this flow and the skills. Source of truth — README links here.
