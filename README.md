# janniks-ai

A personal collection of [Agent Skills](https://agentskills.io/) — portable, version-controlled folders that extend AI coding agents (Claude Code, Cursor, Codex, etc.) with specialized knowledge and workflows.

The companion documentation site lives in [`web/`](./web) (Fumadocs).

## Installation

```bash
npx skills add janniks/janniks-ai
```

See [skills.sh/docs](https://skills.sh/docs) for the `skills` CLI.

## Available Skills

_None yet — see [AGENTS.md](./AGENTS.md) for how to add one._

## Repository Layout

```
.
├── skills/      # Agent Skills, one folder per skill
├── web/         # Fumadocs documentation site
├── AGENTS.md    # Guide for agents authoring skills here
└── README.md
```

## Skill Format

Each skill is a folder under `skills/` containing at minimum a `SKILL.md` with frontmatter:

```markdown
---
name: my-skill
description: One sentence describing when to use this skill, including trigger phrases.
---

# My Skill

Instructions for the agent…
```

Optional bundled resources:

- `scripts/` — executable helpers
- `references/` — supporting documentation
- `assets/` — templates, fixtures

See the [Agent Skills specification](https://agentskills.io/specification) for the full format.

## License

MIT
