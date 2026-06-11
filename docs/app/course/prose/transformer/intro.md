The transformer solves the problem of context. Earlier sequence models passed information along one step at a time, through a bottleneck; the transformer lets every word look directly at every other word and decide, with learned weights, what is relevant. This is attention, and since 2017 it has displaced essentially every alternative.

The architecture is a stack of identical blocks, each containing two parts: self-attention, which moves information between positions in the text, and a small feed-forward network, which reworks each position on its own. Shortcut connections and normalization wrap both, keeping training stable through dozens of layers.

The mechanism fits in one line of math, and this chapter approaches it from every angle: animated, derived, implemented, and run live in the browser. By the end the equation should feel as concrete as the diagrams.
