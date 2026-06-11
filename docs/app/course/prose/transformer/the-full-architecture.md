One block of the architecture, in the pre-norm form used by modern models:

$$x \leftarrow x + \mathrm{MHA}(\mathrm{LN}(x)), \qquad x \leftarrow x + \mathrm{FFN}(\mathrm{LN}(x)),$$

where the feed-forward network is two linear maps with a nonlinearity between, expanding to roughly $4d$ and back, and $\mathrm{LN}$ is layer normalization: $\mathrm{LN}(x) = \gamma \odot \frac{x - \mu}{\sigma} + \beta$, normalizing each token's vector to zero mean and unit variance before rescaling. The residual additions mean each block computes an update to a persistent stream rather than a replacement, so gradients flow through identity paths however deep the stack.

Attention is the only place where positions exchange information; the FFN, which holds about two thirds of the parameters, transforms each position alone. A GPT is a few dozen of these blocks between an embedding matrix and a final projection to vocabulary logits.
