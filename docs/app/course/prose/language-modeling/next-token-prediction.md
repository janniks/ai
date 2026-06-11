The training objective is cross-entropy on the next token. The model outputs logits $z \in \mathbb{R}^{|V|}$, normalized by $\mathrm{softmax}(z)_i = e^{z_i} / \sum_j e^{z_j}$, and the loss on a sequence is

$$\mathcal{L} = -\frac{1}{T}\sum_{t=1}^{T} \log p_\theta(x_t \mid x_{<t}).$$

Exponentiated, this is perplexity, the effective branching factor the model is left guessing over.

The objective looks trivial and is not. Predicting the next token of arbitrary text well requires syntax, facts, and fragments of reasoning, because all of these reduce the loss. Karpathy's RNN post shows the surprise in miniature: a character-level model trained only on this objective produces plausible Shakespeare, LaTeX, and C. Scale the same objective and you get GPT.
