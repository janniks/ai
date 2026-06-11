The forward process adds Gaussian noise on a fixed schedule, $q(x_t \mid x_{t-1}) = \mathcal{N}(\sqrt{1 - \beta_t}\, x_{t-1}, \beta_t I)$, which telescopes to a closed form: $x_t = \sqrt{\bar\alpha_t}\, x_0 + \sqrt{1 - \bar\alpha_t}\, \epsilon$ with $\epsilon \sim \mathcal{N}(0, I)$ and $\bar\alpha_t = \prod_{s \le t}(1 - \beta_s)$. Any training example can be noised to any level in one step.

The network $\epsilon_\theta(x_t, t)$ is trained to predict the noise that was added, with the loss

$$\mathcal{L} = \mathbb{E}_{x_0, t, \epsilon}\left[\| \epsilon - \epsilon_\theta(x_t, t) \|^2\right],$$

a plain regression. Sampling runs the chain backward, subtracting predicted noise step by step from a pure Gaussian sample. Stable Diffusion adds one economy: the process runs in the latent space of a pretrained autoencoder, roughly $64 \times 64$ instead of pixel resolution, which is what makes it cheap enough to be everywhere.
