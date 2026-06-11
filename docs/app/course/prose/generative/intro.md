Language models are one branch of a larger family: generative models, which learn what data looks like well enough to produce new examples of it. For images the dominant approach is diffusion, an idea almost embarrassingly simple to state. Corrupt data with noise, gradually, until nothing remains; train a network to undo one step of the corruption; then generate by starting from pure noise and undoing it repeatedly.

Where the language model breaks generation into one word at a time, diffusion breaks it into one noise level at a time. Both replace one impossible problem, produce a sample from scratch, with thousands of easy ones, and both train each step with a simple guess-the-target loss.

The chapter closes with the unifying view: diffusion, score matching, and flow matching are formulations of the same underlying object, a learned field of arrows that carries noise to data.
