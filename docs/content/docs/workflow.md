---
title: Workflow
description: Generic agent management — file conventions, dirs, and the spec > refine > implement workflow.
---

**tldr:**

- first make a `spec`
- complex features: `refine` the spec toward a half-implementation
- then implement slice by slice, committing per slice

## Theory

The thesis of this workflow is to spend tokens during the interview/discovery phase of creating a specification.
Then, for complex features, spend tokens again deepening that specification toward a half-implementation before any code is written.

> This "spending tokens" is just our way of making the models think more about the work and how to achieve it.

Both steps should ideally think about the problem/feature and ask the user clarifying questions.
But oftentimes it's enough to make the model think about these subparts and use the recommended approach from a list of its questions.
In both cases, the output should be reviewed heavily and followed up with a refactoring step.

### Directories

- `notes/` — flat, unstructured scratchpad. One thought per file. Revisit only on request.
- `specs/` — feature intent (problem, stories, decisions). Complex features get a `## Refinement` section.

### 0. Notes (optional)

Loose unstructured notes are often useful to commit thinking, reports, and other text without aiming for a full spec.
Before starting with a spec, it's often useful to make some notes about the feature and the context.

### 1. Spec

The spec is the feature intent (problem, stories, decisions), finalized to `specs/<feature>.md`.
Specs can be committed.

Small features go straight from here to implementation.

### 2. Refinement

Complex features earn a refinement pass (`/refine-spec`) so implementation becomes execution, not discovery.
It lands in the same spec file under a `## Refinement` section:

- **Interfaces** — how each module will actually look, with decision-rich snippets.
- **Estimates** — per module: line-count delta, complexity, abstractions touched. Surfaces risk early.
- **Slices** — the work cut into vertical tracer-bullet slices, each demoable end-to-end.

### 3. Implement

Implement slice by slice (`/implement`).
Track progress in a transient root-level `WIP-<feature>.md` — current slice plus small notes for crash recovery.
Commit after each slice, ticking that slice's acceptance criteria in the spec.
Delete the `WIP` file on completion; the spec and commits are the record.
