The training objective is cross-entropy on the next token. The model outputs one raw score per vocabulary word, and the softmax function turns those scores into probabilities that are positive and sum to one, favoring the higher scores. The loss is then

$$\mathcal{L} = -\frac{1}{T}\sum_{t=1}^{T} \log p(x_t \mid x_{<t})$${tip:at each of the T positions, look up the probability the model gave to the token that actually came next, take its logarithm as a penalty that explodes when the model was confident and wrong, and average over the text}

Raised back out of the logarithm, this is perplexity: roughly, the number of equally likely choices the model still feels it is guessing among.

The objective looks trivial and is not. Predicting the next token of arbitrary text well requires syntax, facts, and fragments of reasoning, because all of these reduce the loss. Karpathy's RNN post shows the surprise in miniature: a character-level model trained only on this objective produces plausible Shakespeare, LaTeX, and C. Scale the same objective and you get GPT.
