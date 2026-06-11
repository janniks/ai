Training produces a function; inference is everything involved in running it. Generation is inherently serial, one token per pass through the model, and when serving a single user it is limited not by arithmetic but by memory bandwidth: the time to stream the model's stored numbers from GPU memory past the compute units. Most of the engineering in this chapter exists to fight that fact.

The recurring themes are caching, so work done on earlier tokens is not redone at every step; compression, in the form of weights stored at lower precision and small add-on adapters; and GPU code written to respect the memory hierarchy. None of it changes what the model computes, only how fast and how cheaply.

This is also the chapter where the model meets its users: decoding strategies, the knobs like temperature and top-p, are where predicted probabilities become the text you actually read.
