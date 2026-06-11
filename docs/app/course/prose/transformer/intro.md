The transformer solves the problem of context. Earlier sequence models passed information through a recurrent bottleneck, one step at a time; the transformer lets every position look directly at every other and decide, with learned weights, what is relevant. This is attention, and since 2017 it has displaced essentially every alternative.

The architecture is a stack of identical blocks, each containing two sublayers: multi-head self-attention, which moves information between positions, and a position-wise feed-forward network, which processes each position independently. Residual connections and normalization wrap both, keeping gradients healthy through dozens of layers.

The mechanism fits in one line of math, and this chapter approaches it from every angle: animated, derived, implemented, and run live in the browser. By the end the equation should feel as concrete as the diagrams.
