LoRA rests on one hypothesis: the weight update needed to adapt a pretrained model has low intrinsic rank. So freeze $W$ and learn the update as a product of two thin matrices,

$$W' = W + \frac{\alpha}{r} BA, \qquad B \in \mathbb{R}^{d \times r},\; A \in \mathbb{R}^{r \times d},\; r \ll d,$$

training only $A$ and $B$, often well under one percent of the parameters. After training, $BA$ can be merged into $W$, so inference costs nothing extra. QLoRA pushes further by keeping the frozen base in 4-bit precision, which is how large models get fine-tuned on a single GPU.
