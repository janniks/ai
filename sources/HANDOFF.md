# Handoff — ML self-learning course

Brief for an agent picking up the **janniks-ai** ML/LLM self-study course.

## Goal

Build a structured self-learning course covering: math foundations → ML
fundamentals → neural nets → transformers/LLMs → generative models →
RL/post-training → interpretability. Spine is Karpathy's *Neural Networks: Zero
to Hero*; 3Blue1Brown is the math prelude.

## What `sources/` contains

37 markdown documents, organized into 7 module subdirs matching the curriculum:

- `0-math/` — linear algebra, eigenvectors, matmul/attention viz, prog-intro-math
- `1-ml-fundamentals/` — fast.ai, SVM/kernels, scikit-learn, ANN primer
- `2-nets-from-scratch/` — Karpathy Zero-to-Hero, PyTorch, Little Book of DL,
  Goodfellow, llm.c, Llama-from-scratch
- `3-transformers-llms/` — Annotated Transformer, transformers-from-scratch, LLM
  viz, Transformer Math 101, GPT/GPT-2, architecture comparison, attention sinks
- `4-generative/` — diffusion models, flow matching, diffusion explorer, quantization
- `5-rl-post-training/` — Illustrating RLHF, Karpathy "RLHF is just barely RL", Q-learning
- `6-interpretability/` — Neel Nanda mech-interp explainer, Anthropic mapping-the-mind
  + tracing-thoughts, OpenAI explain-neurons, toy models of superposition

Filenames are human-readable slugs. Most files are full-text articles
(Readwise Reader exports); a few are X/Twitter thread captures (llm.c, flow
matching, diffusion explorer, self-attention thread, RLHF, Q-learning, toy
models) and two are book pages (Little Book of DL, Goodfellow).

## How it was assembled

- Source of truth: the **dither** index at `~/.dither/library` (207k entries
  from Readwise Reader, Safari history, X likes). Repo:
  `../openindex`. CLI alias: `d='node ../packages/cli/dist/cli.mjs'`.
- Found via reranked semantic search: `d search --rerank --preview -n N "<query>"`.
- Curated list + module structure lives in
  `../openindex/notes/ml-self-learning-course.md` — that file has the full
  annotated reading list with dither docids and ⭐ priority markers. **Read it
  first.** This `sources/` dir is the materialized copy of those docs.
- Each course item in the notes file references a dither docid; open the
  original anytime with `d get <docid>` (or `https://read.readwise.io/read/<tail>`).

## Gaps — FILLED (web-sourced, 2026-06-07)

The index was thin on classic foundations. Added as curated source notes
(syllabus + canonical URLs, not full-text — these are courses/video series):

- `0-math/3blue1brown-essence-of-linear-algebra.md`
- `0-math/seeing-theory-visual-probability-stats.md`
- `0-math/harvard-stat110-probability-blitzstein.md`
- `1-ml-fundamentals/andrew-ng-ml-specialization-coursera.md`
- `1-ml-fundamentals/stanford-cs229-machine-learning.md`
- `2-nets-from-scratch/stanford-cs231n-deep-learning-vision.md`
- `3-transformers-llms/stanford-cs224n-nlp-with-deep-learning.md`

Gathered via WebFetch/WebSearch (firecrawl CLI was unauthenticated). These
files are pointers (description + topic list + links), not scraped full text —
the underlying content is video/interactive and lives at the linked URLs.

Remaining nice-to-haves: none critical. Could deepen with Jurafsky & Martin
*SLP3* and the *Deep Learning* book chapters as full text if desired.

## Next steps / suggested skills

- `firecrawl-search` / `firecrawl-scrape` — gather the gap resources above
- `create-spec` → `create-plan` — if turning this into a real
  course-with-exercises (not just a reading list)
- Decide: is `janniks-ai` a course-builder repo, or just a curated corpus?
  No README/structure beyond `sources/` exists yet — confirm intent with user.

## Open questions for the user

- Should the X/Twitter captures stay, or keep `sources/` to long-form only?
- Course output format: annotated reading list, or generated lessons/exercises?
