---
title: implement
name: implement
description: "Implement a piece of work based on a spec."
disable-model-invocation: true
---

Implement the work described by the user in the spec (`./specs/`), slice by slice if it has a `## Refinement` section.

Track progress in a transient root-level `WIP-<feature>.md` — current slice, small notes for crash recovery. Delete it when done.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.
