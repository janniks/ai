---
title: create-plan
name: create-plan
description: Turn a spec into a multi-phase implementation plan using tracer-bullet vertical slices, saved to ./plans/<feature>.md. Use when user wants to break down a spec, create an implementation plan, or mentions "tracer bullets".
---

Break a spec into tracer-bullet phases and save as `./plans/<feature>.md`.

1. **Spec in context?** If not, ask for it or point to `./specs/`.
2. **Explore the codebase** if you haven't already.
3. **Pull out durable decisions** (routes, schema, key models, authn/authz, third-party boundaries) — these ride above the phases.
4. **Slice vertically.** Each phase cuts end-to-end (schema → API → UI → tests), delivers something demoable, uses durable names (routes, schemas, models) but no file/function names. Prefer many thin over few thick.
5. **Check with the user** — list phases as `N. Title — user stories X, Y`. Ask if granularity feels right. Iterate.
6. **Write** `./plans/<feature>.md` from the template below. Create `./plans/` if needed.

<plan-template>
# Plan: <Feature Name>

> Source spec: `specs/<feature>.md`

## Architectural decisions

- **Routes**: ...
- **Schema**: ...
- **Key models**: ...

---

## Phase 1: <Title>

**User stories**: <from spec>

End-to-end behavior this slice delivers.

**Acceptance:**
- [ ] ...
- [ ] ...

---

## Phase 2: <Title>

...

<!-- Repeat -->

---

## Phase log

When starting implementation, rename this file to `./plans/<feature>-RUNNING.md` (signals work in progress so another agent can pick up if interrupted). Work one phase at a time, ticking each phase's acceptance criteria as you satisfy them. If git is available, stage and commit only that phase's changes after finishing, then continue to the next phase on your own. Append a row to the log below after every phase. When all phases complete, rename back to `./plans/<feature>.md`.

Two columns (commit + summary) if using git, one column (summary) if not.

|  |  |
|--|--|
|  |  |
</plan-template>
