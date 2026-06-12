# MCP and the Agent Context Window: What Servers Can Actually Do

Research date: 2026-06-12. Spec version cited: 2025-11-25 (latest released). Sources: spec repo cloned at `research/mcp/vendor/spec/`, TS SDK at `research/mcp/vendor/typescript-sdk/`, official host docs.

## Executive summary

- **Per-turn injection: NO standard mechanism.** MCP has no primitive that puts server content in front of the model on every turn. The only content the host is *required* to show the model is the result of a tool call the model itself made. Everything else (resources, prompts, instructions, notifications) is host- or user-mediated.
- **Rewrite/trim conversation history: NO, categorically.** The conversation lives entirely inside the host. A server never sees the transcript and has no RPC that touches it. The boundary is the JSON-RPC message set itself: there is no method whose params or result reference conversation state.
- **One-time-ish standing context: YES.** The `instructions` field of the `initialize` result is the one sanctioned channel into the system prompt ("MAY be added to the system prompt" per spec). Claude Code and Codex CLI both inject it; Claude Code truncates at 2KB.
- **Managing "its own slice": PARTIALLY.** A server controls what its tool results, tool descriptions, and instructions say, and can mutate tool lists at runtime via `notifications/tools/list_changed`. It cannot retract content already in the transcript.
- **Practical workaround for per-turn injection:** combine MCP with host-specific mechanisms — Claude Code **hooks** (`additionalContext` on UserPromptSubmit/PreToolUse/PostToolUse/Stop) calling the server out-of-band, or Claude Code **channels** (`claude/channel` experimental capability, server-pushed messages that enter the session as `<channel>` tags). These are host extensions, not MCP.

## 1. The MCP capability surface vs. the context window

Spec's own control model (`docs/specification/2025-11-25/server/index.mdx`, lines 19–21 in the spec repo clone):

| Primitive | Control | Who initiates | When it reaches model context | Host required to show LLM? |
|---|---|---|---|---|
| **Tools** | Model-controlled | Model calls; server responds | Tool *schemas*: when host builds the request (host's choice how/whether — Claude Code defers definitions via Tool Search). Tool *results*: appended to transcript after the call | Result of a call the model made: effectively yes. Schemas: no guarantee all are shown |
| **Resources** | Application-controlled | Client reads (`resources/read`) | Only when the user/@-mentions one or the model calls a read tool | No. "Application-driven" (`server/resources.mdx:15`) |
| **Prompts** | User-controlled | User invokes (slash command) | When user runs it; expands into a user message | No. User-gated by design (`server/prompts.mdx:14`) |
| **Sampling** | Server-initiated | Server sends `sampling/createMessage` | Never enters the main conversation; it's a *separate* completion the client runs on the server's behalf | No. Spec requires human-in-the-loop review (`client/sampling.mdx:26`) |
| **Elicitation** | Server-initiated | Server asks user for structured input | Reaches the *user* (dialog), not the model, unless host forwards the answer | No |
| **Roots** | Client-provided | Client tells server its filesystem roots | Server→client direction doesn't exist; irrelevant to model context | n/a |
| **Notifications** (`tools/list_changed`, `prompts/list_changed`, `resources/list_changed`, `resources/updated`) | Server-initiated | Server pushes | Trigger client-side *refetch of metadata*; the notification content itself never goes to the model | No |
| **Logging** (`notifications/message`) | Server-initiated | Server pushes | Goes to host logs/UI, not the model | No |
| **Completions** (`completion/complete`) | Client-initiated | Autocomplete for prompt/resource args in the UI | Never reaches the model | n/a |
| **`instructions`** (initialize result) | Server-provided once | Server, at handshake | Host MAY put it in the system prompt | No — "MAY". In practice Claude Code and Codex do |

Spec text on `instructions` (`packages/core/src/types/spec.types.2025-11-25.ts:295` in the TS SDK): *"This can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a 'hint' to the model. For example, this information MAY be added to the system prompt."* Client-side storage: `packages/client/src/client/client.ts` (`_instructions`, set at line ~452, exposed via `getInstructions()`).

## 2. Per-turn injection — every candidate channel, assessed

1. **Tool results** — the only reliable, spec-guaranteed channel into the transcript. But it fires only when the model chooses to call your tool. You can bias that with tool descriptions and instructions ("call `context_sync` before every task"), but it's persuasion, not a hook.
2. **`instructions`** — injected once at session start (system-prompt-ish). Static for the session unless the host re-initializes. Not per-turn, but it *persists* across turns, which for "standing references" is often what's actually wanted. Claude Code truncates instructions and tool descriptions at 2KB each.
3. **`notifications/tools/list_changed` tricks** — a server can change its tool list/descriptions at any time and notify. Claude Code "automatically refreshes the available capabilities" on receipt (code.claude.com/docs/en/mcp, MCP doc §dynamic updates). So mutating a tool's *description* each turn is a quasi-channel into whatever context block holds tool schemas. Caveats: (a) hosts may cache or defer schemas (Claude Code's Tool Search loads definitions lazily — your mutated description may never be read); (b) refresh timing is host-controlled, not turn-aligned; (c) prompt-cache-hostile; (d) widely regarded as a prompt-injection smell. Not dependable.
4. **Resource subscriptions** (`resources/subscribe` → `notifications/resources/updated`, `server/resources.mdx:223–275`) — tells the *client* a resource changed. Spec does not require (or even suggest) the client re-read it into the model's context. Claude Code attaches resources only on explicit @-mention; VS Code only via "Add Context > MCP Resources". Dead end for auto-injection.
5. **Sampling** — see §5. Does not touch the main conversation.
6. **Host extensions (not MCP):**
   - **Claude Code channels** (research preview, v2.1.80+): server declares `capabilities.experimental['claude/channel']` and emits `notifications/claude/channel` with `{content, meta}`. Content lands in the session as a `<channel source=...>` tag — genuine server-push into model context. Events queue and are delivered on the next turn; not strictly "every turn", but the closest thing that exists. Docs: code.claude.com/docs/en/channels-reference.
   - **Claude Code hooks**: `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SubagentStart` hooks can return `hookSpecificOutput.additionalContext` (≤10k chars), which the harness wraps in a system-reminder and injects at that lifecycle point. A hook script can call your MCP server's HTTP endpoint (or shell out) and inject its answer every single turn. This is the real "inject at every turn" mechanism — owned by the harness, not the protocol. Docs: code.claude.com/docs/en/hooks.

**Bottom line:** within pure MCP, tool results are the only guaranteed channel; instructions are the only standing channel; everything else is host-discretionary metadata refresh.

## 3. Rewriting or trimming history — where exactly the boundary is

No. The protocol surface (full method list in `docs/specification/2025-11-25/schema.mdx` / `spec.types.2025-11-25.ts`) contains zero methods that read or write conversation state. The transcript is a host-internal data structure; MCP servers interact only via JSON-RPC requests/responses/notifications about *capabilities and content the host may choose to use*. Concretely:

- A server never receives the conversation. Even `sampling/createMessage` goes the other way: the *server* supplies the messages for that one-off completion.
- The deprecated `includeContext: "thisServer" | "allServers"` sampling param (`client/sampling.mdx:79–87`, soft-deprecated in 2025-11-25) was the only thing that ever let a server *request* that the client include MCP-related context in a sampled completion — and even that was client-discretionary, scoped to MCP context (not the chat), and applied to the side completion only.
- Trimming/compaction (Claude Code `/compact`, Cursor summarization, etc.) is implemented entirely in the host with no MCP involvement or notification.

So the boundary: **a server can add candidate content; only the host composes, retains, summarizes, and evicts.**

## 4. Host-by-host mapping

| Host | Tools | Resources | Prompts | `instructions` | Sampling | Elicitation | list_changed | Server push |
|---|---|---|---|---|---|---|---|---|
| **Claude Code** | Yes; Tool Search defers definitions — only tool names + server instructions load at session start | @-mention (`@server:scheme://path`), fetched as attachments; also auto-provides list/read tools | Slash commands `/mcp__server__prompt` | Yes, in context (2KB cap; doubles as "when to search for my tools" hint) | No | Yes (dialog; `Elicitation` hook can auto-respond) | Yes, auto-refresh | **Channels** (experimental) |
| **Cursor** | Yes (auto-selected, approval-gated) | Listed as supported | Supported | Not documented | Not supported | Supported | partial/undocumented | No |
| **VS Code Copilot** | Yes | Manual: "Add Context > MCP Resources" | `/server.prompt` in chat | Historically used; current doc emphasizes tools/resources/prompts/MCP Apps | Supported (behind config) | Supported | Yes | No |
| **Codex CLI** | Yes (stdio + streamable HTTP) | Limited | Limited | Yes — "server-wide guidance"; first 512 chars prioritized | No | No (as of docs) | partial | No |
| **Gemini CLI** | Yes (primary focus) | Read-only, minimal | Slash commands via `prompts/get` | Not documented | No | No | partial | No |

Key asymmetry: every host injects tool schemas + (usually) instructions; **no host auto-injects resources** — resources are everywhere a user-pull mechanism.

## 5. Sampling as a context-management backdoor?

Mostly no. `sampling/createMessage` (`client/sampling.mdx`) lets the server ask the client's model to run a completion the *server* composes. Properties that kill the abuse case:

- The completion and its result stay between server and client; nothing enters the main transcript unless the model later reads it via a tool result.
- Spec: clients "**SHOULD** always have a human in the loop with the ability to deny sampling requests" and present requests/responses for review (`client/sampling.mdx:26–32`).
- `includeContext: thisServer/allServers` is soft-deprecated and was never "give me the chat history".
- Claude Code, Cursor, Codex, Gemini CLI don't support sampling at all; VS Code does, gated.

Legitimate use for a context manager: offload summarization/condensation of the server's *own* stored material using the user's model, then serve the condensed text back through tool results. That's context management *outside* the window, not of it.

## 6. Practical patterns for a "context manager MCP" today

Ranked by reliability:

1. **Tool-result injection ("living references").** Expose `get_context(topic)` / `sync_context()` tools whose results carry the curated reference block. Use `instructions` to mandate usage: "Call `sync_context` at the start of each task and after any significant state change." Guaranteed delivery when called; calling frequency is model-dependent.
2. **Hooks + MCP (Claude Code): true per-turn injection.** A `UserPromptSubmit` (and/or `PostToolUse`) hook runs a script that queries your context service and emits `{"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": "..."}}`. Fires on literally every user turn; 10k-char budget; appears as a system-reminder. The MCP server can be the same process serving both the hook's HTTP endpoint and stdio MCP tools. This is exactly the CLAUDE.md/system-reminder injection slot the user is asking about — but it belongs to the harness config, not the server.
3. **`instructions` as the standing slice.** Per-session, system-prompt-adjacent, supported by Claude Code (2KB) and Codex (front-load 512 chars). Good for policies and pointers ("authoritative refs live at resource X; re-read when stale"), not for live data.
4. **Channels (Claude Code only, experimental).** Push `notifications/claude/channel` whenever external state changes; content arrives in the session as a `<channel>` tag on the next turn. Event-driven rather than per-turn, allowlist-gated during research preview.
5. **Resources + behavioral contract.** Publish `context://current` and instruct the model (via instructions/CLAUDE.md) to re-read it when told. Works only because of the instruction, not the protocol; `resources/updated` notifications will not cause any current host to re-inject.
6. **Dynamic tool descriptions via `list_changed`.** Technically possible on Claude Code; fragile, cache-hostile, defeated by Tool Search deferral. Don't build on it.

**Not possible today, full stop:** reading the transcript; deleting/rewriting/summarizing prior messages; forcing eviction; guaranteed injection on every model call from the server side; any of the above on hosts without hook systems.

## Citations

- Spec (2025-11-25): modelcontextprotocol.io/specification/2025-11-25 — Lifecycle (`basic/lifecycle.mdx`, instructions at JSON example ~line 142), Server overview control table (`server/index.mdx:19–21`), Tools (`server/tools.mdx`, listChanged §"List Changed Notification" line 152+), Resources (`server/resources.mdx`, subscriptions lines 223–275, "application-driven" line 15), Prompts (`server/prompts.mdx:14`), Sampling (`client/sampling.mdx`, human-in-loop line 26, includeContext deprecation lines 79–87), Elicitation (`client/elicitation.mdx`), Roots (`client/roots.mdx`), Logging (`server/utilities/logging.mdx`), Completion (`server/utilities/completion.mdx`). Local clone: `research/mcp/vendor/spec/docs/specification/2025-11-25/`.
- TS SDK: `research/mcp/vendor/typescript-sdk/packages/core/src/types/spec.types.2025-11-25.ts` (InitializeResult.instructions ~line 295, sampling capability/context lines 334–335, includeContext line 1592); `packages/client/src/client/client.ts` (lines 215, 452, 496).
- Claude Code: code.claude.com/docs/en/mcp (list_changed support, resources via @-mention, prompts as `/mcp__…`, Tool Search + 2KB instruction truncation, elicitation); /en/hooks (additionalContext events, 10k limit); /en/channels-reference (`claude/channel` capability, `notifications/claude/channel`, queued delivery).
- VS Code: code.visualstudio.com/docs/copilot/customization/mcp-servers (manual resource attach, `/server.prompt`).
- Cursor: cursor.com/docs/context/mcp (tools/resources/prompts/roots/elicitation; no sampling).
- Codex CLI: developers.openai.com/codex/mcp (instructions field usage, 512-char guidance).
- Gemini CLI: google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html (tools-first, prompts as slash commands, limited resources).
