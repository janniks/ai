The reward model is a network that scores responses, trained on comparisons: shown a prompt, a preferred answer, and a rejected one, its loss pushes the preferred score above the rejected score. The model being aligned is called the policy, and writing $r$ for the reward model's score and $\pi$ for the policy, it is trained, typically with PPO, to maximize

$$\mathbb{E}\left[ r(x, y) \right] - \beta\, \mathrm{KL}\!\left(\pi \,\|\, \pi_\text{ref}\right)$${tip:make responses score highly on average under the reward model, minus a penalty, weighted by the number beta, for how far the policy has drifted from the original pretrained model}

where $x$ is the prompt, $y$ the response, $\mathbb{E}$ means the average over responses, and $\mathrm{KL}$ measures how different two distributions are.

The penalty is not a detail. The reward model is an imperfect proxy fit to finite human judgments, and an unconstrained policy will find its blind spots and exploit them, scoring high while producing junk. The penalty tethers the policy to the pretrained reference; the number $\beta$ sets how far alignment is allowed to move the model from what it learned about language.
