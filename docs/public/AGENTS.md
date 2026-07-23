# AGENTS.md

## Development philosophy

> **Simple made easy.** Rich Hickey / Steve Jobs style. Every change should make the system simpler, not just add to it.

- Functional, idiomatic, well-abstracted
- Simplify the plan first, then make notes on how to edit
- No premature abstractions/DRY (it's overrated)
- Prefer deleting code over adding code
- No over-engineering, no speculative features
- If it's not clearly needed right now, don't build it

### Agent format

- All work in md files, in-repo. No GitHub issues unless explicitly asked.
- Short bullets, few full sentences. Readable at 1/4 desktop width or on mobile.
- Commit after each meaningful change.

### Directories

- `specs/` — feature intent (problem, stories, decisions). Complex features get a `## Refinement` section (interfaces, estimates, slices).
- `notes/` — flat, unstructured scratchpad. One thought per file. Revisit only on request.

### Conventions

- `CONVENTIONS.md` — the codebase's conventions and patterns (naming above all). Read it in full before implementing any feature.

### Papercuts & Unsure

- `PAPERCUTS.md` — read at session start; things that didn't go as planned, logged so the next session skips the detour.
  - Trigger: 2+ failed attempts before something worked, or a surprise. Test: would this have saved future-you a detour?
  - Append-only dated bullets, detail as indented sub-bullets. Add `- spec: <file>` only when the origin matters. Refactor/clean only with good reason.
- `UNSURE.md` — decisions made while unsure but had to pick one. Append liberally — too many beats too few. Never edit or delete existing entries; humans resolve them.
  - Group entries under `## <date> — <spec/note file>`. Each entry is a checkbox with choice, alternative, and why as sub-bullets.
  - Humans review: write a `verdict:` sub-bullet, check the box. Checked entries are swept on occasional cleanup passes.

### Workflow

- `/grill-me` → `/create-spec` → (complex features: `/refine-spec`) → implement slice-by-slice → commit per slice.
- Small features go straight from spec to implementation. Refine only when the feature is complex enough to earn it.
- While implementing, track progress in a transient root-level `WIP-<feature>.md` — current slice, small notes for crash recovery. Delete it on completion; the spec and commits are the record.
- Tick acceptance criteria in the spec after each commit.
- Deferred items: front-matter `status: deferred` on whatever file fits. No dedicated dir.

### Style guide (example: TypeScript)

#### General principles

- Keep things in one function unless composable or reusable
- Avoid try/catch where possible
- Avoid using the `any` type
- Prefer single word variable names where possible
- Rely on type inference when possible; avoid explicit type annotations or interfaces unless necessary for exports or clarity
- Prefer functional array methods (`flatMap`, `filter`, `map`) over for loops; use type guards on filter to maintain type inference downstream

#### Naming

Prefer single word names for variables and functions. Only use multiple words if necessary.

> THIS RULE IS MANDATORY FOR AGENT WRITTEN CODE.

- Use single word names by default for new locals, params, and helper functions.
- Multi-word names are allowed only when a single word would be unclear or ambiguous.
- Do not introduce new camelCase compounds when a short single-word alternative is clear.
- Before finishing edits, review touched lines and shorten newly introduced identifiers where possible.
- Good short names to prefer: `pid`, `cfg`, `err`, `opts`, `dir`, `root`, `child`, `state`, `timeout`.
- Examples to avoid unless truly required: `inputPID`, `existingClient`, `connectTimeout`, `workerPath`.

```ts
// Good
const foo = 1;
function journal(dir: string) {}

// Bad
const fooBar = 1;
function prepareJournal(dir: string) {}
```

Reduce total variable count by inlining when a value is only used once.

```ts
// Good
const data = await fs.readFile(path.join(dir, "journal.json"), "utf-8");

// Bad
const journalPath = path.join(dir, "journal.json");
const data = await fs.readFile(journalPath, "utf-8");
```

#### Destructuring

Avoid unnecessary destructuring. Use dot notation to preserve context.

```ts
// Good
obj.a;
obj.b;

// Bad
const { a, b } = obj;
```

#### Variables

Always use `const` over `let`/`var`. Use ternaries or early returns instead of reassignment.

```ts
// Good
const foo = condition ? 1 : 2;

// Bad
let foo;
if (condition) foo = 1;
else foo = 2;
```

#### Control Flow

Avoid `else` statements. Prefer early returns.

```ts
// Good
function foo() {
  if (condition) return 1;
  return 2;
}

// Bad
function foo() {
  if (condition) return 1;
  else return 2;
}
```

#### Testing

- Avoid mocks as much as possible
- Test actual implementation, do not duplicate logic into tests

## Project Specific Notes
