---
title: human-review
name: human-review
description: Human-paced review of many files via a generated REVIEW_GUIDE.md — corrections become rules, rules fan out to the remaining files.
disable-model-invocation: true
---

# Human Review

A human-paced review of many files, accelerated by rules. The human ticks files off one by one in `REVIEW_GUIDE.md`; every correction becomes a **rule**; locked rules get applied to the remaining files by sub-agents so the human reviews each mistake only once.

The guide is temporary — done when every box is ticked. Rules survive it (`## For agents`, then optionally `CONVENTIONS.md`).

## 1. Scope + cluster

Determine scope from the user: all files, an explicit list, or a diff/branch (`git diff <ref>...HEAD --name-only`).

Read-only pass (fan out sub-agents for large scopes, 2–5 related files each — inventory and report, no edits). Cluster the files along whatever axes fit (subsystem, file type, risk, expected churn) and sort so the most rule-yielding representative files come first — early files calibrate the rules that accelerate the rest.

## 2. Write `REVIEW_GUIDE.md`

At repo root (or the package under review). Untracked/ignored — scratch, not history.

<review-guide-template>

# Review Guide — <scope>

> Temporary during review. Done when every box is ticked. Rules live in `## For agents` and move to `CONVENTIONS.md` at the end.

## <Cluster name> — <why these belong together>

- [ ] `path/to/file.ts` — <one line: what to watch for here>

<!-- repeat per cluster -->

## For agents

Rules collected during this review. Read before any pass; append as they emerge.

- R1: <rule, imperative, testable> (source: <file or human diff>)

### Locks

Ticked files are reviewed. Later rule passes may apply only trivial/cosmetic changes to them (typo, comment hygiene, formatting) and must report every touch. Anything more: untick the box and tell the human why.

- Hard-locked (no touches at all): <paths, if the human names any>

</review-guide-template>

## 3. Calibrate

Review the **first file** with the human line-by-line. Distill every correction into a rule under `## For agents` — imperative, testable wording ("comments never restate the next line", not "better comments").

A rule is **locked** when the human has confirmed its exact wording. Only locked rules scale out — one miscalibrated rule applied to fifty files is fifty files to re-review.

## 4. The review loop

Per file, until every box is ticked:

- Human reviews, then either ticks the box, recommends edits (this file or all files), or edits the file manually.
- **Human edited manually?** Diff it (`git diff -- <file>`), extract the rule(s) the edit implies, propose them with the diff as evidence ("your change X→Y implies rule: …"), and append the locked ones to `## For agents`. This is the accelerator — one manual edit teaches a rule for every remaining file.
- Judgment calls you had to make alone go to `UNSURE.md`, never silently decided.

## 5. Rule passes

When a rule (or batch) locks, apply it across the unticked files via sub-agents:

- Partition by **explicit file lists** — never globs, each file in exactly one list.
- Each agent's prompt carries `## For agents` and `### Locks` pasted verbatim — the agent has no other access to them — plus hard constraints: only your list, only these rules, no renames/reformats beyond the rule.
- Verify after each pass: typecheck/tests as the repo supports. Relay each agent's touched-file report to the human.

Loop passes as new rules accumulate. For big scopes, the Workflow tool (pipeline per file list) beats hand-spawning agents.

## 6. Finish

- Every box ticked, no open `UNSURE.md` entries from this review.
- Offer to append `## For agents` to `CONVENTIONS.md` (create if missing) so the rules outlive the guide — dedupe against what's already there.
- The guide has served; delete it or leave the fully-ticked file, whichever the human prefers.
- Stage in narrow slices with `/prepare-commit` if asked — guide and scratch docs stay unstaged.
