---
title: Workflow
description: A simple agent workflow for specs, plans, and implementation.
---

## Philosophy

Keep the work simple. Spend time clarifying the problem before adding code, prefer deleting over adding, and avoid abstractions that are not clearly needed.

## Files

- `specs/` contains feature intent: problem, stories, and decisions.
- `plans/` contains phased implementation steps.
- `notes/` contains loose scratchpad notes.

In-progress files use suffixes:

- `specs/<feature>-DRAFT.md` while the spec is still being shaped.
- `plans/<feature>-RUNNING.md` while implementation is active.

## Flow

Start with `/grill-me` when the idea needs pressure testing.

Then use `/create-spec` to write the feature intent.

Then use `/create-plan` to turn the spec into small implementation phases.

Implement phase by phase. After each meaningful phase, validate the work, commit it, and update the plan phase log.

## Style

Write short, readable markdown. Keep bullets concise. Prefer concrete decisions over broad theory.

For code, keep changes small, functional, and easy to read. Use single word names where they are clear, avoid unnecessary variables, and prefer early returns over nested control flow.
