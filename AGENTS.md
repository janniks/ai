# AGENTS.md

Guidance for AI coding agents working in this repository.

## Repository Overview

A personal collection of [Agent Skills](https://agentskills.io/) — packaged instructions and resources that extend agent capabilities. Distributed via `npx skills add janniks/janniks-ai`.

The `web/` subdirectory contains an unrelated Fumadocs documentation site and is part of the monorepo. Do not place skills inside `web/`.

## Creating a New Skill

### Directory Structure

```
skills/
  {skill-name}/         # kebab-case
    SKILL.md            # required
    scripts/            # optional executable helpers
    references/         # optional supporting docs
    assets/             # optional templates/fixtures
```

### Naming

- Skill directory: `kebab-case` (e.g., `react-best-practices`)
- File must be exactly `SKILL.md` (uppercase)
- Scripts: `kebab-case.sh` / `.ts` / `.py`

### SKILL.md Format

```markdown
---
name: skill-name
description: One sentence describing when this skill applies. Include trigger phrases ("Deploy my app", "Review accessibility", etc.) so agents activate it on the right tasks.
license: MIT
metadata:
  author: janniks
  version: "1.0.0"
---

# Skill Title

Brief description of what the skill does and when to apply it.

## When to Apply

Concrete situations that should trigger this skill.

## Instructions

Step-by-step guidance for the agent.

## References

Link to deeper material in `references/` (one level deep).
```

### Context Efficiency

Skills load via **progressive disclosure**: only `name` + `description` load at startup; the full `SKILL.md` loads only when activated; bundled files load on demand.

- Keep `SKILL.md` under ~500 lines — push detail into `references/`
- Write specific descriptions with trigger phrases — vague descriptions = wrong activations
- Prefer scripts over inline code — script *execution* output is what consumes context, not the script body
- File references work one level deep from `SKILL.md`

### Scripts

- `#!/bin/bash` shebang, `set -euo pipefail`
- Status messages to stderr, machine-readable output to stdout
- Clean up temp files with a trap

## Adding a Skill — Checklist

1. Create `skills/{skill-name}/SKILL.md` with valid frontmatter
2. Add bundled `scripts/` / `references/` as needed
3. Add a row for the skill in [`README.md`](./README.md) under "Available Skills"
4. (Optional) document it in `web/`

## What Not to Do

- Don't put skill content inside `web/` — that's the docs site
- Don't add a skill without a `description` containing concrete trigger phrases
- Don't commit `.env*`, `node_modules/`, or `.DS_Store`
