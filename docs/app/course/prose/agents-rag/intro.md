A model is a function, a machine that turns an input into an output; a system is a model in a loop. This chapter is about the loops: retrieval that feeds the context window with relevant documents, tools that let outputs cause actions, and agents that chain model calls with feedback from the environment until a goal is met.

The unifying constraint is that the model's only interface is text in, text out, conditioned on a finite context. Everything here, RAG, ReAct, agent frameworks, is a strategy for deciding what goes into that window and what to do with what comes out.

The hardest part is the least glamorous: evaluation. A pipeline with retrieval, tools, and multiple model calls fails in compounding, non-deterministic ways, and knowing whether a change helped requires measurement discipline that most of the field is still learning.
