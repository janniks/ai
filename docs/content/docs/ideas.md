---
title: Ideas
description: Ideas in AI workflows I want to explore.
---

## `@ref` comments in md files and other natural language

Use some sort of tollable comments to reference code in other files (non code files).

```
Some claim made here that may change in the future. <!-- @ref example/workflow.ts:391 -->
```

This way we can easily point LLMs to the code that backs up the claim and update.
Ideally this would be two way, so if either breaks we can update the other.
One option is to use tsdocs to generate all documentation, but I doubt that will work.
So we want this to also reference the the notes/specs/plans files.

### Thoughts

- If two way, we should just use short ids generated to reference the other files.
- LLM puts in a placeholder, and the tooling replaces with ids (or readable ids? brittle), breaks file edits afterwards
- Maybe give the LLM next ids to use, so it doesn't hallucinate them (in context via hook?)
