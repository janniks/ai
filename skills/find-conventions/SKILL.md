---
title: find-conventions
name: find-conventions
description: Scan the whole codebase for its conventions and patterns — naming above all — and distill them into CONVENTIONS.md.
disable-model-invocation: true
---

# Find Conventions

Scan the codebase and distill its conventions into `CONVENTIONS.md` — the file every agent reads in full before implementing a feature. Short enough to always read, thorough enough to trust.

**Naming is the largest focus.** The public-facing shape — exports, imports, the interfaces of libraries, modules, helpers, classes — carries most of a codebase's identity. But in-code habits count too: early returns, error handling style, singletons and other patterns, the mental models the code is organized around.

## 1. Deep extraction — cheap agents read everything

Fan out sub-agents (default `sonnet` or cheaper — this is volume work) partitioned by explicit file lists covering the whole codebase. Each agent reads its files fully — in-code conventions like early returns live in bodies, not signatures — and reports candidate conventions with evidence:

- **Naming** — casing, word count, prefixes/suffixes, verb choices; separately for exports vs internals, files, types, constants.
- **Shape** — what modules export and how (default vs named, factory vs class vs singleton, barrel files, import habits).
- **In-code patterns** — control flow (early returns, else avoidance), error handling, state, async style, test style.
- **Mental models** — recurring concepts the code organizes around, and what they're consistently called.

Each finding: the convention (imperative), rough adherence (universal / dominant / contested), 1–2 evidence examples.

For big codebases use the Workflow tool; a final merge step dedupes across agents before review.

## 2. Review — a strong model judges the list

A single stronger agent (Opus-level or above) reviews the merged list against the skeleton only — exported symbol names, signatures, module structure (AST-level output, not full bodies). Its job is judgment, not discovery:

- Promote real conventions; demote coincidences and contested habits.
- Resolve conflicts into one convention or an honest "two styles coexist: X in tests, Y in src".
- Rewrite every keeper imperative and testable, like a review rule.

## 3. Write `CONVENTIONS.md`

At repo root. Not too long — this file is read in completion before every feature, so every line pays rent. Tables for the enumerable, prose only for tidbits.

<conventions-template>

# Conventions

> Read in full before implementing. Last full scan: <date> @ <commit>.

## Naming

| Kind | Convention | Example |
|------|-----------|---------|
| exported functions | ... | ... |

## Shape

| Pattern | Convention | Example |
|---------|-----------|---------|

## In code

- <imperative convention> — <example>

## Tidbits

Interesting, load-bearing quirks of how this codebase is built — the things a newcomer would be surprised by.

</conventions-template>

If `CONVENTIONS.md` already has rules (e.g. from a `/human-review`), merge — dedupe, keep the sharper wording, update the scan stamp.

## 4. Confirm

Walk the user through anything contested or surprising before finalizing — they know which habits are intentional and which are accidents that shouldn't be enshrined.
