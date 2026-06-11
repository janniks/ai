A language model assigns probabilities to sequences of words. The probability of a whole sequence can always be built up one position at a time: writing $x_1, \dots, x_T$ for the $T$ tokens of a text,

$$p(x_1, \dots, x_T) = \prod_{t=1}^{T} p(x_t \mid x_1, \dots, x_{t-1})$${tip:the chance of the whole text equals the chance of the first token, times the chance of the second given the first, times the chance of the third given the first two, and so on; the tall pi symbol means multiply all these together}

so modeling language reduces to one repeated question: given the context so far, what comes next? Everything a modern LLM does is trained through this single objective.

But networks consume numbers, not text. Two translations stand between a string and the model: tokenization, which chops text into a vocabulary of discrete units, and embedding, which maps each unit to a learned list of numbers. Both are simple, and both leak into model behavior in ways worth understanding early; many famous failures of LLMs are tokenizer failures.
