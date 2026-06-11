A neural network is a parametric function built by alternating affine maps and pointwise nonlinearities: $x \mapsto \sigma(W_L \cdots \sigma(W_1 x + b_1) \cdots + b_L)$. Nothing in it is mysterious in isolation. The substance is in how the parameters are found.

They are found by gradient descent. Define a loss $\mathcal{L}(\theta)$ measuring how badly the network fits the data, compute $\nabla_\theta \mathcal{L}$, step downhill, repeat. Backpropagation makes the gradient computation cheap: one forward pass, one backward pass, regardless of how many parameters there are.

This chapter is where the spine of the curriculum begins. Karpathy's micrograd video has you build the machinery by hand, in a hundred lines of Python, and everything afterward, up to and including frontier models, is this same loop at larger scale.
