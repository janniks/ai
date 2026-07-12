---
title: create-spec
name: create-spec
description: Create a spec through user interview, codebase exploration, and module design, then save to ./specs/<feature>.md. Use when user wants to write a spec or plan a new feature.
---

This skill is invoked when the user wants to create a spec. Skip steps you don't consider necessary.

1. Ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions.

2. Explore the repo to verify their assertions and understand the current state of the codebase.

3. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. Ask one question at a time and provide your recommended answer.

   Format each question as a level-2 header at column 0: `## Q<n>. <question>` (Q1, Q2, ...). Follow with options as a plain bulleted list (`- (a) ...`), then a `**Recommendation:** (<letter>) — <why>` line. If an answer is unclear, surfaces a new branch, or you think of something mid-interview, squeeze in follow-ups as `## Q<n>.<m>.` (e.g. `Q2.1`, `Q2.2`) before moving on. Never recommend an option (or hint at preference in preamble/option rationales) before all options have been presented. Never use blockquote (`> `) — it buries the question.

   As answers come in, maintain a running draft at `./specs/<feature>-DRAFT.md` (create `./specs/` if needed) and update it after each answered question so progress survives interruptions.

4. Sketch out the major modules you will need to build or modify to complete the implementation. Look for opportunities to extract deep modules that can be tested in isolation.

A deep module (Ousterhout) encapsulates a lot of functionality behind a simple, testable interface that rarely changes.

Check with the user that these modules match their expectations. Ask which modules they want tests written for.

5. Once you have a complete understanding of the problem and solution, finalize the spec using the template below and rename `./specs/<feature>-DRAFT.md` → `./specs/<feature>.md`.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list should cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets — they rot quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts.

## Testing Decisions

A list of testing decisions that were made. Include:

- What makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (similar types of tests in the codebase)

## Out of Scope

What is deliberately out of scope for this spec.

## Further Notes

Anything else worth capturing.

</spec-template>
