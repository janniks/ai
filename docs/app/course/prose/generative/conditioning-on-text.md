CLIP trains an image encoder and a text encoder so that a caption and its image map to nearby points, and mismatched pairs to distant ones, over millions of captioned images. The result is a shared space where a sentence and the images it describes are neighbors, and this is what lets a prompt steer a denoiser: the text's vector is fed into the denoising network at every step, through attention.

Classifier-free guidance sharpens the conditioning. The denoiser is run twice, once with the prompt and once without, and the difference between the two predictions is amplified by a chosen number $w$ called the guidance scale:

$$\hat\epsilon = \epsilon(x) + w\,(\epsilon(x, c) - \epsilon(x, c=\varnothing))$${tip:read it as: the final noise guess, epsilon-hat, equals the noise guess made without any prompt, plus w times the gap between the guess made with the prompt and the guess made without it. Here epsilon is the network's predicted noise, x is the noisy image, c is the text prompt, and the empty-set symbol means the prompt was left blank. In plain terms, the model looks at how the prompt changed its prediction and then exaggerates that change by the factor w, which is why bigger w makes images follow the prompt more strictly.}

Higher $w$ buys prompt fidelity at the cost of diversity, the trade you adjust in every image generator's settings.
