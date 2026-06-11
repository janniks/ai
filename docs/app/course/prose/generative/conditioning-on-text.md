CLIP trains an image encoder and a text encoder so that a caption and its image map to nearby points, and mismatched pairs to distant ones, over millions of captioned images. The result is a shared space where a sentence and the images it describes are neighbors, and this is what lets a prompt steer a denoiser: the text's vector is fed into the denoising network at every step, through attention.

Classifier-free guidance sharpens the conditioning. The denoiser is run twice, once with the prompt and once without, and the difference between the two predictions is amplified by a chosen number $w$ called the guidance scale:

$$\hat\epsilon = \epsilon(x) + w\,(\epsilon(x, c) - \epsilon(x, c=\varnothing))$${tip:take the no-prompt noise prediction and push it w times further in the direction the prompt pulled it; epsilon is the predicted noise, x the noisy image, c the prompt, and the empty-set symbol means no prompt}

Higher $w$ buys prompt fidelity at the cost of diversity, the trade you adjust in every image generator's settings.
