A neural network is a function with adjustable knobs. The knobs are millions of plain numbers, called parameters and written $\theta$ (theta). Feed the network an input and it produces an output; change the parameters and the output changes. Nothing in it is mysterious in isolation. The substance is in how good parameter values are found.

They are found by trial and gradient. A loss is a single number measuring how badly the network currently fits the data; for every parameter one can compute which direction of adjustment would reduce that number, nudge every parameter a small step that way, and repeat millions of times. Backpropagation is the bookkeeping trick that computes all those directions in one cheap backward sweep.

This chapter is where the spine of the curriculum begins. Karpathy's micrograd video has you build the machinery by hand, in a hundred lines of Python, and everything afterward, up to and including frontier models, is this same loop at larger scale.
