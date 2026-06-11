Language models are one branch of a larger family: generative models, which learn a data distribution well enough to sample from it. For images the dominant approach is diffusion, an idea almost embarrassingly simple to state. Corrupt data with noise, gradually, until nothing remains; train a network to undo one step of the corruption; then generate by starting from pure noise and undoing it repeatedly.

Where the autoregressive model factorizes generation over sequence positions, diffusion factorizes it over noise levels. Both replace one impossible problem, produce a sample from scratch, with thousands of easy ones, and both train each step with a simple regression-like loss.

The chapter closes with the unifying view: diffusion, score matching, and flow matching are formulations of the same underlying object, a learned vector field that transports noise to data.
