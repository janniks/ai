One block of the architecture, in the form used by modern models:

$$x \leftarrow x + \mathrm{MHA}(\mathrm{LN}(x)), \qquad x \leftarrow x + \mathrm{FFN}(\mathrm{LN}(x)),$${tip:normalize the vector, run attention over it, and add the result back on; then normalize again, run the feed-forward network, and add that back on too}

where $x$ is a word's running vector, $\mathrm{MHA}$ is the multi-head attention of the previous concept, $\mathrm{FFN}$ is a small two-layer network applied to each position alone, and $\mathrm{LN}$ (layer normalization) rescales a vector to a standard size so training stays stable. The additions are the crucial habit: each block computes a small update to a persistent stream rather than replacing it, so learning signals flow cleanly however deep the stack.

Attention is the only place where positions exchange information; the feed-forward network, which holds about two thirds of the parameters, transforms each position alone. A GPT is a few dozen of these blocks between a lookup table that turns words into vectors and a final layer that turns vectors back into word probabilities.
