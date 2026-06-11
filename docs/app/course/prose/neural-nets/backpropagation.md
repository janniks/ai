Backpropagation is reverse-mode automatic differentiation: the chain rule applied from the loss backward through the computation graph. Each node receives the derivative of the loss with respect to its output, multiplies by its own local derivative, and passes the result to its inputs. For a chain $\mathcal{L} = f(g(h(\theta)))$,

$$\frac{\partial \mathcal{L}}{\partial \theta} = \frac{\partial \mathcal{L}}{\partial f}\,\frac{\partial f}{\partial g}\,\frac{\partial g}{\partial h}\,\frac{\partial h}{\partial \theta},$$

evaluated right to left. The reverse direction is what makes it cheap: one backward pass yields the gradient with respect to every parameter at once, at roughly the cost of the forward pass.

The practical failure modes follow directly from the multiplication. If local derivatives are consistently below one, gradients vanish in early layers; a ReLU whose input is always negative has local derivative zero and never recovers. Knowing the chain rule means being able to predict these pathologies before the loss curve reveals them.
