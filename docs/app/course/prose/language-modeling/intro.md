A language model assigns probabilities to sequences. By the chain rule of probability any sequence distribution factorizes as

$$p(x_1, \dots, x_T) = \prod_{t=1}^{T} p(x_t \mid x_1, \dots, x_{t-1}),$$

so modeling language reduces to one repeated question: given the context so far, what comes next? Everything a modern LLM does is trained through this single objective.

But networks consume vectors, not text. Two translations stand between a string and the model: tokenization, which chops text into a vocabulary of discrete units, and embedding, which maps each unit to a learned vector. Both are simple, and both leak into model behavior in ways worth understanding early; many famous failures of LLMs are tokenizer failures.
