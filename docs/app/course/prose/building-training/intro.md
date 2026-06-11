Knowing the architecture and building it are different kinds of knowledge. This chapter is the second kind: you implement a GPT, train it on real text, and watch the loss fall. The model that results is small, but nothing about it is a toy; nanoGPT's code is structurally the code of a frontier model.

Pretraining is the same training loop from chapter one applied at scale: cross-entropy on next tokens, Adam, and a very large corpus. The engineering questions become mixed precision, gradient accumulation, and distributing the work across devices, all of which Karpathy's GPT-2 reproduction walks through in the open.

The chapter ends with the scaling laws, the empirical result that loss falls smoothly and predictably as models, data, and compute grow. This regularity, not any architectural breakthrough, is why the field's answer to most questions since 2020 has been to train a bigger model on more data.
