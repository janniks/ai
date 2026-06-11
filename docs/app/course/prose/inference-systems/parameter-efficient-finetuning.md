LoRA rests on one hypothesis: the change needed to adapt a pretrained model is simple, expressible with far fewer numbers than the model itself. So freeze each big weight matrix $W$, the grid of learned numbers in a layer, and learn only a correction formed by multiplying two thin matrices:

$$W' = W + BA$${tip:the adapted weights are the frozen original plus the product of two skinny grids B and A, whose narrow shared side r makes the correction cheap to store and train}

where $B$ and $A$ are tall and wide slivers whose product has the full shape of $W$, often well under one percent of the parameters. After training, the product $BA$ can be folded into $W$, so running the model costs nothing extra. QLoRA pushes further by storing the frozen base at 4-bit precision, which is how large models get fine-tuned on a single GPU.
