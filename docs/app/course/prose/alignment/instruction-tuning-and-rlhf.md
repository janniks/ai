The reward model is trained on comparisons with the Bradley-Terry loss, $-\log \sigma(r_\phi(x, y_w) - r_\phi(x, y_l))$, pushing the score of the preferred response $y_w$ above the rejected $y_l$. The policy is then optimized, typically with PPO, against

$$\max_\theta \; \mathbb{E}_{y \sim \pi_\theta}\!\left[ r_\phi(x, y) \right] - \beta\, \mathrm{KL}\!\left(\pi_\theta \,\|\, \pi_\text{ref}\right).$$

The KL penalty is not a detail. The reward model is an imperfect proxy fit to finite human judgments, and an unconstrained policy will find its blind spots and exploit them, scoring high while producing junk. The penalty tethers the policy to the pretrained reference; $\beta$ sets how far alignment is allowed to move the model from what it learned about language.
