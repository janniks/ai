> This file is meant for agents.

You are supposed to do the following

- Write the AGENTS.md to a new file or update existing (content below)
- Stamp the written file's first line with when you fetched this page (hour accuracy): `<!-- janniks-ai workflow — fetched 2026-07-16T09:00Z -->`
- Create `PAPERCUTS.md` and `UNSURE.md` at repo root if missing (seed templates below)
- Ask if they would like to install required skills
  - [y] Install required skills
    - `npx skills add janniks/ai`
    - `npx skills add mattpocock/skills/grilling mattpocock/skills/grill-me mattpocock/skills/handoff mattpocock/skills/research mattpocock/skills/writing-great-skills`
- Optional: the `/status` page on this site installs a custom Claude Code statusline (same instructions-for-agents format as this page)

## Upgrading

Already set up (AGENTS.md carries a fetched-stamp)? Don't rewrite blindly:

- Fetch the `/changelog` page on this site and compare its dated entries against your stamp.
- Apply only what's newer — update AGENTS.md sections, add/remove skills, adjust seed files. Preserve the project's `Project Specific Notes`.
- Update the stamp to now.

---

{{ AGENTS.md }}

---

Seed template for `PAPERCUTS.md`:

{{ PAPERCUTS.md }}

Seed template for `UNSURE.md`:

{{ UNSURE.md }}

---

Note: The guide is mainly generic and related to our workflow and development process/style. We end with a `Project Specific Notes` for non-template notes for individual projects.
