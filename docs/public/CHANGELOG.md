# Changelog

Meta-workflow log of this repo's skills and AGENTS.md template. Agents: read this to learn how the workflow has evolved and what recently changed — newest first. Upgrading an existing setup: apply entries newer than your AGENTS.md fetched-stamp.

## 2026-07-16

- **Upgrade path added.** Installs now stamp AGENTS.md with a fetched timestamp; the `/agents` page gained an Upgrading section, and this changelog is served at `/changelog`.
- Custom Claude Code statusline served at `/status` (optional install).

## 2026-07-12

- **Workflow simplification: plans removed.** Spec-driven now: `create-spec` for every feature (with a synthesis fast-path absorbing the former `to-spec`); new `refine-spec` skill replaces `create-plan` for complex work — deepens the spec toward a half-implementation (interface shapes, code examples, size/complexity estimates, vertical slices) instead of a separate plan file. `plans/` directory retired; implementation progress tracked in a transient root-level `WIP-<feature>.md`, deleted on completion.
- Added `find-conventions` skill → builds `CONVENTIONS.md` (naming, shape, in-code patterns, tidbits); AGENTS.md now requires reading `CONVENTIONS.md` in full before implementing.
- Added `human-review` skill — human-paced file-by-file review via REVIEW_GUIDE.md; corrections become rules, rules fan out via sub-agents; rules land in `CONVENTIONS.md`.
- Added `prepare-commit` skill (stage-only commits for security-key users; intentionally undocumented in AGENTS.md).

## 2026-07-11

- **Papercuts & Unsure system** added to the AGENTS.md template with seed files: `PAPERCUTS.md` (agent memory, read at session start, append-only dated bullets) and `UNSURE.md` (human review queue, checkbox entries grouped `## <date> — <spec>`, human writes verdicts).
- **Adopted skills from [mattpocock/skills](https://github.com/mattpocock/skills)**, adapted to md-file flow (no tracker, no ADRs, no CONTEXT.md): `to-spec`, `code-review`, `implement`, `tdd`, `prototype`, `diagnosing-bugs`, `improve-codebase-architecture`. `to-tickets` was merged into `create-plan` (blocking edges, expand–contract) rather than copied. Verbatim-usable skills (`grilling`, `grill-me`, `handoff`, `research`, `writing-great-skills`) are referenced in the README for install, not copied.
