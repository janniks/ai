---
title: Workflow
description: Generic agent management — file conventions, dirs, and the spec > plan > implement workflow.
---

**tldr:**

- first make a `spec` / PRD
- then convert that into a `plan` / agent implementation run.
- kickoff the implementation work

## Theory

The thesis of this workflow is to spend tokens during the interview/discovery phase of creating a specification.
Then again spend tokens during the exploration of turning that specification into a implementation plan.

> This "spending tokens" is just our way of making the models think more about the work and how to achieve it.

Both steps should ideally think about the problem/feature and ask the user clarifying questions.
But oftentimes it's enough to make the model think about these subparts and use the recommended approach from a list of its questions.
In both cases, the output should be reviewed heavily and followed up with a refactoring step.

### Directories

- `notes/` — flat, unstructured scratchpad. One thought per file. Revisit only on request.
- `specs/` — feature intent (problem, stories, decisions). 1:1 by name with `plans/`. In-progress drafts suffixed `-DRAFT.md`.
- `plans/` — phased implementation. Active plan suffixed `-RUNNING.md` (contains an inline phase-log table).

### Notes (optional)

Loose unstructured notes are often useful to commit thinking, reports, and other text without aiming for a full spec.
Before starting with a spec, it's often useful to make some notes about the feature and the context.

### Spec

The spec is the feature intent (problem, stories, decisions).
It's a 1:1 by name with the plan.
It's in-progress drafts suffixed `-DRAFT.md`.

### Plan

The plan is the phased implementation.
It's a 1:1 by name with the spec.
It's in-progress drafts suffixed `-RUNNING.md` (contains an inline phase-log table).

#### Phase log

Plans are structured in slices/phases.
After implementing a phase the work should be committed.
A row should be added to the phase log to track the commit and a summary of the work.
Each step should test/format/lint/validate the code early.
