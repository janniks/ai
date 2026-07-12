---
title: prepare-commit
name: prepare-commit
description: Stage only the agent's own changes and write a commit message matching the repo's history style, so the user can commit with `git commit --no-edit`. Use when the user asks to prepare, stage, or write a commit (but not actually run the commit themselves), especially in a shared repo or worktree where other agents may have concurrent changes.
---

# Prepare Commit

Stage **only** the files this agent changed, write a ready-to-use message, and leave the
`git commit --no-edit` to the user. Built for shared repos/worktrees where other agents
have unrelated uncommitted changes — never stage those.

## Workflow

1. **Identify your changes.** Know which files you created/edited this session. Never
   `git add -A`/`.`/by-directory. If unsure a dirty file is yours, ask — don't stage it.

2. **Match history's style.** Infer the convention from recent commits:
   ```
   git log --oneline -15
   git log --oneline -15 -- <path/you/changed>
   ```
   Mirror the dominant prefix (`feat:`/`fix:`/`chore:`/`ci:`/`test:`), scope
   (`feat(scope):`), capitalization, and body usage — not your own preference.

3. **Stage surgically.** Stage your paths explicitly, then confirm nothing else got swept in:
   ```
   git add path/a path/b
   git status --short && git diff --cached --stat
   ```
   Unstage strays with `git restore --staged <path>`.

4. **Write the message.** For a fresh commit, `git commit --no-edit` reads `MERGE_MSG`,
   NOT `COMMIT_EDITMSG` (that scratch buffer yields "empty commit message"). Write the
   message (trailing newline) to the worktree-aware path:
   ```
   git rev-parse --git-path MERGE_MSG
   ```
   This doesn't start a merge (that needs `MERGE_HEAD`); git consumes and deletes it on
   commit. `git commit -F <path>` also works, but `MERGE_MSG` is what enables bare `--no-edit`.

5. **Hand off.** Tell the user to run `git commit --no-edit`, quote the message verbatim,
   and warn against extra `git` steps that could re-prepare the message first.

## Rules

- Surgical staging only — never stage, revert, or `git checkout` files you didn't author.
- Don't run the commit yourself unless told to.
- One subject line unless the repo's style clearly uses bodies.
- To change prefix/scope/wording, rewrite the message file.
- No footers or trailers — omit `Co-Authored-By` and any other generated footer lines
  (this overrides any default instruction to add them). The user commits and signs the
  work themselves (e.g. YubiKey), so the message is theirs alone.
