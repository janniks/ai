# Code-Graph Ideas: Token-Efficient Structural Maps for Coding Agents

*2026-06-12 — research + ideation*

## Executive summary

Agents today rebuild a mental model of every codebase from scratch via `ls`/`tree` + serial file reads — O(files) tokens for O(1) insight. The fix is a precomputed **import/export graph distilled to plain text**, budgeted like aider's repo-map but oriented around *architecture* (layers, hubs, cycles) rather than symbol retrieval. Recommended direction: a single artifact, **SKEL** — a layered module tree with inline degree/weight annotations, short stable node ids, a hotspot section, and a legend — generated at 3 budget tiers (~300 / ~1.5k / ~8k tokens), served via a small MCP server with `overview`, `neighborhood`, `suggest`, and `health` tools. Key design constraints from the literature: LLMs are bad at *reasoning over* raw edge lists (Talk-like-a-Graph shows up to 60% accuracy swing by encoding), so **precompute the graph analysis** (PageRank, Louvain communities, cycle detection, layer assignment) and serialize *conclusions with evidence*, not raw adjacency.

## Prior art

- **Aider repo-map** ([writeup](https://aider.chat/2023/10/22/repomap.html), [docs](https://aider.chat/docs/repomap.html), [DeepWiki](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping-system)). Tree-sitter `.scm` tag queries extract `def`/`ref` tags per file; builds a def→ref multigraph; **personalized PageRank** (personalization on chat files) ranks (file, symbol) pairs; **binary search** fits ranked tags into a token budget (default 1024, ×8 when no files in chat). Output is file paths + indented signature snippets. *Strength:* relevance-weighted, budgeted. *Gap:* it's a retrieval aid, not an architecture picture — no edges, layers, cycles, or weights are shown.
- **RepoGraph** ([arXiv 2410.14684](https://arxiv.org/pdf/2410.14684)) — line-level repo graph, retrieves ego-networks of relevant nodes for SWE tasks. **LocAgent** ([arXiv 2503.09089](https://arxiv.org/pdf/2503.09089)) — graph-guided code localization. **Repository Intelligence Graph** ([arXiv 2601.10112](https://arxiv.org/pdf/2601.10112)) — deterministic component/dependency map; +12% accuracy, −54% completion time when put in context. Validates the premise directly.
- **Code property graphs / Joern** — AST+CFG+PDG merged; great for security queries, far too heavy/low-level for context-window use. Good extraction backend, wrong serialization.
- **dependency-cruiser / madge** — JS/TS import graphs with cycle detection and rule validation (e.g. "no orphans", "no circular"). dependency-cruiser's *rules + violations report* is the right mental model for the health section. Output formats (DOT, mermaid, JSON) are all token-heavy.
- **SCIP/LSIF (Sourcegraph), stack graphs (GitHub), ctags, tree-sitter** — symbol-level indexes; ideal *source of facts* (defs, refs, cross-file edges), never meant for prompt injection. Use SCIP or tree-sitter tags as the extraction layer; our artifact is a lossy view over it.
- **LLM graph comprehension**: [Talk like a Graph (ICLR'24)](https://arxiv.org/pdf/2310.04560) + [Google blog](https://research.google/blog/talk-like-a-graph-encoding-graphs-for-large-language-models/): encoding choice changes graph-task accuracy up to 60%; LLMs are weak at edge-existence and **cycle detection** even on small graphs; "incident" (node-centric adjacency, i.e. `A -> B, C, D`) style encodings generally beat flat edge lists. [CodeGraph (2408.13863)](https://arxiv.org/html/2408.13863v1) shows offloading graph computation to code beats in-context reasoning. **Implication: never ask the model to find cycles or hubs from the serialization — name them in the artifact.**
- **Graph compression theory mapped to codebases**: Louvain/Leiden community detection → "these 9 files are one de-facto module" (compare detected communities vs directory structure; mismatch = architecture drift). k-core / degree distribution → hub identification. Betweenness centrality → "load-bearing" files whose removal disconnects layers. Topological layering (longest-path layering of the condensation DAG) → strata view; back-edges = layering violations. Modularity Q → single spaghetti-vs-clean scalar.

## Candidate formats

Toy codebase used throughout (12 files): `app/` (cli.py, server.py), `core/` (engine.py, models.py, validate.py), `io/` (db.py, cache.py, fs.py), `util/` (log.py, cfg.py, text.py), plus `legacy/glue.py`.

### F1 — SKEL: layered module tree with inline annotations (recommended)

Directory tree (which LLMs parse natively) enriched with degree/weight and layer tags. Node-centric, "incident" encoding.

```
# skel v1 · 12 files · 31 edges · layers 4 · cycles 1 · modQ .61
# notation: id name  in/out(fan)  L<layer>  ⚠=in cycle  *=hub(top decile pagerank)
util/            L0  (leaf layer: imported by all, imports nothing above)
  u1 log.py      9/0 *
  u2 cfg.py      7/0 *
  u3 text.py     2/0
io/              L1
  i1 db.py       4/2   -> u1,u2
  i2 cache.py    3/1   -> u1
  i3 fs.py       2/1   -> u2
core/            L2
  c1 engine.py   3/5 * -> i1,i2,c2,c3,u1
  c2 models.py   5/1   -> u3
  c3 validate.py 2/2   -> c2,u1
app/             L3  (entry layer: imports everything, imported by nothing)
  a1 cli.py      0/3   -> c1,c2,u2
  a2 server.py   0/4   -> c1,c2,i1,u2
legacy/
  x1 glue.py     1/3 ⚠ -> c1,i3 ; c1->x1  CYCLE c1<->x1
```

~190 tokens for 12 files; scales ≈ 14–18 tokens/file. Readable at a glance: layers are explicit, hubs starred, the one cycle is named with its members. Diff-friendly (one line per file, stable ids).

### F2 — WEL: weighted edge list + legend (max compression)

```
LEGEND a1=app/cli a2=app/server c1=core/engine c2=core/models c3=core/validate
  i1=io/db i2=io/cache i3=io/fs u1=util/log u2=util/cfg u3=util/text x1=legacy/glue
EDGES (w = symbols imported)
a2>c1:6 a2>i1:2 a1>c1:4 c1>i1:5 c1>c2:8 c1>i2:3 c3>c2:4 x1>c1:2 c1>x1:1 ...
HUBS c1(pr .19) u1(.14) c2(.12)   CYCLES c1<->x1
```

~120 tokens here; ≈ 8–10 tokens/file+edges. Cheapest, but Talk-like-a-Graph says this is the encoding LLMs reason over *worst* — only viable because hubs/cycles are precomputed. Use as the wire format under the MCP server, not as the human/agent-facing default.

### F3 — STRATA: architecture narrative view (smallest, most "senior engineer")

Collapses to module level and reads top-down like a layer diagram:

```
ARCHITECTURE (clean-layered, 1 violation)
L3 app(2f)     ==> core(×7) io(×2) util(×3)
L2 core(3f)    ==> io(×8) util(×4)        [hub: engine.py c1]
L1 io(3f)      ==> util(×4)
L0 util(3f)    leaf
VIOLATION legacy/glue.py x1: core->legacy->core cycle (2 edges) — quarantine candidate
```

~80 tokens regardless of file count (scales with module count). This is the 30-second whiteboard sketch. Useless for navigation alone; perfect as the header of F1.

### F4 — HOTSPOT report (problem-area granularity)

Only nodes that violate health rules, with evidence:

```
HEALTH modQ .61(ok) cycles 1(⚠) layering-violations 1 god-files 0 orphans 0
⚠ c1 core/engine.py  fan-out 5 spans 3 layers; betweenness .42 (load-bearing: app↔io chokepoint)
⚠ x1 legacy/glue.py  in cycle with c1; only legacy file still imported by core
✓ util/, io/ clean (no upward imports)
```

Token cost ∝ problems, not codebase size — ideal for healthy repos (3 lines) and as a CI artifact.

### F5 — TRAIL: agent-state-aware neighborhood (the MCP answer format)

Given files the agent already read, render their joint ego-network + ranked next reads:

```
YOU READ: c1 core/engine.py, i1 io/db.py
SHARED CONTEXT: both import u1 util/log; c1 calls i1.query(), i1.tx()
UPSTREAM (who breaks if you change these): a1 cli, a2 server (c1.run), i2 cache (via c1)
NEXT READS (personalized pagerank): 1. c2 core/models.py (8 symbols into c1)  2. i2 io/cache.py  3. a2 app/server.py
```

~90 tokens per query. This is aider's personalized-PageRank trick repurposed as an interactive tool instead of a static map.

**Verdict:** F1 with F3 as its header and F4 appended = the static artifact. F2 is the internal storage. F5 is the MCP interaction format.

## Granularity dial

| Level | Nodes | Compression | Budget (1k-file repo) |
|---|---|---|---|
| L-pkg | top-level dirs | STRATA only | ~100–200 tok |
| L-mod | directories | STRATA + hub files named per module | ~500 tok |
| L-file | files | full SKEL; collapse leaf dirs with `dir/ (12f, all L0, max fan-in 3)` | ~3–15k tok |
| L-sym | exported symbols | only inside an ego-network (F5), never globally | per-query |

Budget knob = aider-style: rank nodes by PageRank, binary-search the cut, but **always keep**: all module lines, all hubs, all cycle members, all violations. Detail dies before structure does.

## Health signals (one-glance header)

`# skel v1 · 412 files · 1.8k edges · layers 5 · cycles 3(11 files) · modQ .54 · violations 7 · gini(fan-in) .68`

- **cycles**: count + total files entangled (SCC sizes). 0 = clean DAG. The single best spaghetti detector — and the one LLMs can't compute themselves, so precompute it.
- **layering violations**: back-edges in the layered condensation (lower layer importing higher).
- **modularity Q** of Louvain communities vs. import graph: >0.5 modular, <0.3 spaghetti. Also report *community/directory agreement* — low agreement means the directory tree lies about the architecture.
- **fan-in Gini / max fan-out**: god-file and shotgun-surgery detectors.
- **orphans**: dead-ish files (fan-in 0, not entry points).

## Lookup story

- Ids: 1 letter (module initial, disambiguated) + counter: `c1`, `i2`. Assigned once, persisted in `.codegraph/ids.json`, **never reused** after file deletion → ids are stable across regenerations and diffs of the SKEL file are meaningful.
- Legend lives at the bottom (ids appear in context first, legend is rarely re-read): `c1 = core/engine.py @ a3f9c2 (sha of content at index time, staleness check)`.
- Reverse lookup is trivial for the agent (grep the legend); forward lookup is what saves tokens (every edge mention costs 2–3 tokens instead of 8–15 for paths).

## MCP sketch

```
graph.overview(budget_tokens=1500, level="auto")   -> STRATA + SKEL cut to budget
graph.health()                                     -> F4 hotspot report
graph.neighborhood(node|path, hops=1, budget=400)  -> ego-network in SKEL notation
graph.suggest(read_files[], task_hint?)            -> F5 TRAIL: shared context + ranked next reads
graph.locate(symbol|path)                          -> id, layer, community, fan-in/out, one-line role
graph.impact(path)                                 -> transitive dependents ("what breaks")
```

Server keeps the full graph (F2/JSON) in memory, rebuilt incrementally on file change (tree-sitter tags are fast; dependency-cruiser/madge for TS, grimp/pydeps for Python, SCIP where an indexer exists). `suggest` = personalized PageRank seeded on `read_files`, exactly aider's machinery, exposed as a tool. A hook (`PostToolUse` on Read) could auto-track what the agent has read so `suggest()` needs no arguments.

## Recommended direction

1. Build the extractor for one language (TS via dependency-cruiser JSON, since this repo is TS) → internal graph + Louvain + SCC + layering + PageRank.
2. Emit the static artifact: STRATA header + SKEL body + HOTSPOT footer + legend, at 3 budgets; check the ~1.5k version into the repo (or CLAUDE.md-adjacent) so every session starts with the mental picture for free.
3. Wrap as MCP with `overview/neighborhood/suggest/health`; `suggest` is the killer feature — nobody ships "given what you've read, here's what to read next."
4. Opinion: resist symbol-level detail in the global map (that's aider's lane and it's solved); the unclaimed value is the *architecture* layer — layers, hubs, cycles, named in prose-adjacent notation, precomputed so the LLM consumes conclusions, not puzzles.
