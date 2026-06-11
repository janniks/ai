Formally: each token's vector $x$ is projected into a query $q = W_Q x$, a key $k = W_K x$, and a value $v = W_V x$. Stacked over positions into matrices, attention is

$$\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V.$$

The dot products $QK^\top$ score how relevant each position is to each other position; the softmax turns each row of scores into a probability distribution; the output of every position is the resulting weighted average of values. The $\sqrt{d_k}$ keeps the dot products from saturating the softmax at high dimension.

Multi-head attention runs $h$ such operations in parallel with separate projections and concatenates the results, letting different heads attend by different criteria. In a decoder, a causal mask sets scores to $-\infty$ above the diagonal so position $t$ sees only $x_{\le t}$, which is what makes next-token training valid.
