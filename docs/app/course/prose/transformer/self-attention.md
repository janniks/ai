Formally: each word's vector $x$ is multiplied by three learned weight matrices to give a query $q$ (what this word is looking for), a key $k$ (what this word offers), and a value $v$ (what this word will pass along if chosen). Collect them over all positions into the matrices $Q$, $K$, $V$, and attention is

$$\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V.$${tip:compare every query with every key to get relevance scores, shrink them by the square root of the vector length, turn each row of scores into percentages that sum to 1, then blend the values using those percentages}

Reading it from the inside out: $QK^\top$ scores how relevant each position is to each other position; the softmax turns each row of scores into positive weights summing to one; each position's output is then a weighted blend of the values. Dividing by $\sqrt{d_k}$ (the square root of the vector length) keeps the scores in a range where the softmax stays sensitive.

Multi-head attention runs several such operations in parallel with separate weights, letting different heads attend by different criteria. In a GPT, a causal mask blocks every position from seeing anything to its right, which is what makes next-word training honest.
