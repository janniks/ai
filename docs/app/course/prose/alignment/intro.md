A pretrained model completes text; it does not answer questions, follow instructions, or decline anything. Post-training closes that gap, and the standard pipeline has three stages: supervised fine-tuning on demonstration conversations, training a reward model on human preference comparisons, and reinforcement learning against that reward.

The key shift is in the supervision signal. Pretraining tells the model what text exists; preference data tells it which of two outputs a person liked better. Comparisons are far cheaper to collect than demonstrations and, it turns out, far more effective per label: InstructGPT's aligned 1.3B model was preferred over the raw 175B GPT-3.

The chapter then follows two simplifications of this pipeline, DPO and constitutional AI, and its most consequential extension: reinforcement learning against verifiable rewards, which is where reasoning models come from.
