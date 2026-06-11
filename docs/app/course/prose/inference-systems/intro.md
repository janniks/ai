Training produces a function; inference is everything involved in running it. Generation is inherently serial, one token per forward pass, and at batch size one it is bound not by arithmetic but by memory bandwidth: the time to stream the weights from GPU memory past the compute units. Most of the engineering in this chapter exists to fight that fact.

The recurring themes are caching, so attention over the prefix is not recomputed at every step; compression, in the form of quantized weights and low-rank adapters; and kernels written to respect the memory hierarchy. None of it changes what the model computes, only how fast and how cheaply.

This is also the chapter where the model meets its users: decoding strategies, the knobs like temperature and top-p, are where probability distributions become the text you actually read.
