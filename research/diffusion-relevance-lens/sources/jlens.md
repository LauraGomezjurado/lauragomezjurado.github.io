# Source extract: `jlens` — Jacobian lens (Anthropic reference implementation)

**Repository:** `https://github.com/anthropics/jacobian-lens.git` (from `git config --get remote.origin.url`; also `pyproject.toml:22`)
**Commit:** `581d398613e5602a5af361e1c34d3a92ea82ba8e` — dated `2026-07-01 23:37:49 +0000`, message `Initial release` (only commit in the clone)
**License:** Apache License 2.0 (`LICENSE`; `README.md:92`; SPDX headers `# SPDX-License-Identifier: Apache-2.0` at the top of every `jlens/*.py`)
**Package version:** `0.1.0` (`pyproject.toml:6`)
**Companion paper (referenced, NOT included in repo):** "Verbalizable Representations Form a Global Workspace in Language Models", `https://transformer-circuits.pub/2026/workspace/index.html` (`README.md:5-6`, `pyproject.toml:23`)
**Date accessed:** 2026-08-23
**Local clone read:** `/tmp/claude-0/-home-user-lauragomezjurado-github-io/0558670f-ca37-5150-ba17-25c5493e37b3/scratchpad/jacobian-lens/`
**Scope note:** All excerpts below are verbatim from the local clone. No internet sources were consulted. Citations are `path:line` relative to the repo root.

Complete file inventory of the repo (for negative-finding scope): `README.md`, `LICENSE`, `pyproject.toml`, `uv.lock`, `walkthrough.ipynb`, `assets/{qwen_gloss.json.gz, slice_vis.png}`, `data/evaluations/{README.md + 6 json}`, `data/experiments/{README.md + 11 json}`, `jlens/{__init__.py, _logging.py, examples.py, fitting.py, hf.py, hooks.py, lens.py, protocol.py, vis.py}`, `jlens/data/{README.md, blackmail.json, slice_vis.html}`, `tests/{__init__.py, test_compute_slice.py, test_fitting.py, test_hf_layout.py, test_ranks_of.py, test_vis_modes.py, tiny.py}`.

---

## 1. The lens equation

### 1.1 Stated form

`README.md:8-22`:

```
The Jacobian lens reads out what an internal activation is disposed to make the
model say. It linearly transports a residual-stream vector at any layer and
position into the final-layer basis, then decodes it with the model's own
unembedding into a ranked list of vocabulary tokens.

The transport is the average input–output Jacobian over a text corpus:

```
lens_l(h) = unembed( J_l @ h ), J_l = E[∂h_final / ∂h_l]
```

The expectation is over prompts, source positions, and all current-and-future
target positions in a generic web-text corpus; the precise estimator
(cotangents summed over target positions, then averaged over source positions)
is documented in the [`jlens.fitting`](jlens/fitting.py) module docstring.
```

Same equation in `jlens/fitting.py:5-9`:

```python
The lens reads out an early-layer residual ``h_l`` by linearly transporting it
into the final-layer basis with the average input-output Jacobian, then
decoding with the model's own unembedding::

    lens_l(h) = unembed( J_l @ h )
```

### 1.2 What `h_l` and `h_final` are, exactly

Both are **block outputs**, captured by a `register_forward_hook` on the residual block at that index. They are NOT post-final-norm, and NOT logits.

`jlens/hooks.py:13-29` (class docstring):

```python
class ActivationRecorder:
    """Captures residual-stream tensors at the given block indices.

    Registers a forward hook on each requested block on ``__enter__`` and
    removes them on ``__exit__``. On the next forward pass each block's output
    is stored in :attr:`activations`, keyed by block index. Stored tensors are
    not detached, so they can be passed straight to :func:`torch.autograd.grad`.
```

`jlens/hooks.py:46-56` (the hook itself — the exact capture point):

```python
    def _make_hook(self, index: int) -> Callable[..., None]:
        is_graph_root = index == self._start_graph_at

        def hook(module: nn.Module, inputs, output) -> None:
            # Some HF blocks return a tuple (hidden, present_kv, ...).
            tensor = output if torch.is_tensor(output) else output[0]
            if is_graph_root:
                tensor.requires_grad_(True)
            self.activations[index] = tensor

        return hook
```

`model.layers` (what is hooked) is the list of residual blocks: `jlens/protocol.py:34` declares `layers: Sequence[nn.Module]`, described at `jlens/protocol.py:25-27` as "The residual blocks, indexable by integer; what :class:`~jlens.hooks.ActivationRecorder` hooks." In the HF adapter it is resolved from the text decoder: `jlens/hf.py:120`:

```python
        self.layers: nn.ModuleList = getattr(self._text_module, layout.layers)
```

`h_final` is the output of the block at `target_layer`, which **defaults to the last block index `n_layers - 1`** (`jlens/fitting.py:79`):

```python
    target = n_layers - 1 if target_layer is None else target_layer
```

and in `apply` (`jlens/lens.py:195-196`):

```python
        final_layer = model.n_layers - 1
        record_at = sorted(set(layers) | {final_layer})
```

So: **`h_final` = the output tensor of the final transformer block, before the final norm and before the LM head.** The forward pass used for fitting is `self._text_module(...)`, i.e. the bare text decoder with no LM head (`jlens/hf.py:163-164`):

```python
    def forward(self, input_ids: torch.Tensor) -> Any:
        return self._text_module(input_ids=input_ids, use_cache=False)
```

`jlens/protocol.py:42-47`:

```python
    def forward(self, input_ids: torch.Tensor) -> Any:
        """Run the residual stack on ``input_ids`` (no LM head). Must build an
        autograd graph through :attr:`layers` when grad is enabled, and must be
        deterministic across batch elements (eval mode, dropout off) — the
        fitting estimator replicates the prompt along the batch axis."""
```

### 1.3 What is applied on readout

`unembed` = final pre-unembed norm, then LM head, then (only if the config declares it) a `tanh` logit softcap. `jlens/hf.py:166-174`:

```python
    def unembed(self, residual: torch.Tensor) -> torch.Tensor:
        target_device = self._lm_head.weight.device
        target_dtype = self._lm_head.weight.dtype
        logits = self._lm_head(
            self._final_norm(residual.to(target_dtype).to(target_device))
        )
        if self._logit_softcap is not None:
            logits = self._logit_softcap * torch.tanh(logits / self._logit_softcap)
        return logits
```

The softcap value is read from the HF text config field `final_logit_softcapping` (`jlens/hf.py:128-130`):

```python
        self._logit_softcap: float | None = getattr(
            text_config, "final_logit_softcapping", None
        )
```

Protocol-level statement (`jlens/protocol.py:49-52`):

```python
    def unembed(self, residual: torch.Tensor) -> torch.Tensor:
        """Map a residual-stream tensor ``[..., d_model]`` to logits
        ``[..., vocab_size]`` (final norm + LM head)."""
```

`_final_norm` is located by the layout table (`jlens/hf.py:121`, `jlens/hf.py:44` `norm: str = "norm"`, with per-family overrides at `jlens/hf.py:53-62`).

### 1.4 The full application path (exact code)

`jlens/lens.py:135-143` (the transport):

```python
    def transport(self, residual: torch.Tensor, layer: int) -> torch.Tensor:
        """Map a residual at ``layer`` into the final-layer basis: ``J_l @ h``.

        Args:
            residual: Tensor of shape ``[..., d_model]``.
            layer: Source layer index (must be in :attr:`source_layers`).
        """
        J_bar = self.jacobians[layer].to(residual.device)
        return residual @ J_bar.T
```

`jlens/lens.py:198-216` (the readout loop):

```python
        input_ids = model.encode(prompt, max_length=max_seq_len)
        with ActivationRecorder(model.layers, at=record_at) as recorder:
            model.forward(input_ids)
            activations = {i: recorder.activations[i].detach() for i in record_at}

        def select(layer: int) -> torch.Tensor:
            """Residuals at the requested positions: ``[n_positions, d_model]``."""
            full = activations[layer][0]  # [seq_len, d_model]
            return (full if positions is None else full[list(positions)]).float()

        lens_logits: dict[int, torch.Tensor] = {}
        for layer in layers:
            residual = select(layer)
            if use_jacobian:
                residual = self.transport(residual, layer)
            lens_logits[layer] = model.unembed(residual).float().cpu()

        model_logits = model.unembed(select(final_layer)).float().cpu()
        return lens_logits, model_logits, input_ids
```

**Read directly from this code (not inferred):** the map is purely linear — `residual @ J.T` with no bias/intercept/affine offset anywhere. Grep for `bias`/`affine` in the package returns only `nn.Linear(..., bias=False)` inside the test toy model (`tests/tiny.py:24`, `tests/tiny.py:69`); there is no additive term in the lens itself.

**Baseline:** setting `use_jacobian=False` skips the transport and gives the plain logit lens (`jlens/lens.py:168-169`):

```python
            use_jacobian: If ``False``, skip the ``J_l`` transport (vanilla
                logit-lens baseline).
```

---

## 2. The Jacobian estimator — exact averaging convention

### 2.1 The `fitting.py` module docstring, VERBATIM

`jlens/fitting.py:3-22` (complete, unabridged):

```python
"""Fitting the Jacobian lens.

The lens reads out an early-layer residual ``h_l`` by linearly transporting it
into the final-layer basis with the average input-output Jacobian, then
decoding with the model's own unembedding::

    lens_l(h) = unembed( J_l @ h )

Estimator (:func:`jacobian_for_prompt`): for each output dimension, inject a
one-hot cotangent at *every valid target position at once* and backprop. The
gradient at source position ``p`` is then ``sum_{p' >= p} dh_final[p'] / dh_l[p]``,
the sum over later target positions; we take the mean over source positions
``p``. This is the reduction used in the paper. A per-position estimator
(``dh_final[p] / dh_l[p]`` averaged over ``p``) gives a slightly different
``J_l``; both work as a lens.

Cost: one forward pass and ``ceil(d_model / dim_batch)`` backward passes per
prompt. Shard across machines by running :func:`fit` on disjoint prompt
slices and merging with :meth:`jlens.lens.JacobianLens.merge`.
"""
```

**Summed vs averaged — unambiguous:** cotangents are **summed** over target positions `p' >= p` (causal masking makes the sum run only over current-and-future positions), and then **averaged (mean)** over source positions `p`. Confirmed in code by the `.mean(dim=1)` over valid positions at `jlens/fitting.py:196-202`:

```python
                positions_on_device = valid_positions.to(grad.device, non_blocking=True)
                rows = (
                    grad[:n_dims_this_pass, positions_on_device, :].float().mean(dim=1)
                )
                jacobians[layer][dim_start : dim_start + n_dims_this_pass, :] = (
                    rows.cpu()
                )
```

Note the estimator uses the **same** valid-position set for both the target positions (where the cotangent is injected) and the source positions (over which the mean is taken) — `valid_positions` is used for both (`jlens/fitting.py:171-186` and `:196-198`).

### 2.2 Which positions are valid, and the stated reasons

Constant and its comment, `jlens/fitting.py:40-42`:

```python
#: Positions before this index are excluded from the Jacobian average; early
#: positions act as attention sinks and have atypical residual statistics.
SKIP_FIRST_N_POSITIONS = 16
```

The mask function, `jlens/fitting.py:45-72`:

```python
def valid_position_mask(
    seq_len: int, *, skip_first: int = SKIP_FIRST_N_POSITIONS
) -> torch.Tensor:
    """Boolean mask over sequence positions to include in the Jacobian average.

    Early positions are dominated by attention-sink behaviour and the final
    position has no next-token target, so both are excluded.

    Args:
        seq_len: Length of the tokenized prompt.
        skip_first: Number of leading positions to exclude.

    Returns:
        Boolean tensor of shape ``[seq_len]``.

    Raises:
        ValueError: If ``skip_first`` is negative or the prompt is too short to
            leave any valid positions.
    """
    if skip_first < 0:
        raise ValueError(f"skip_first must be >= 0, got {skip_first}")
    mask = torch.zeros(seq_len, dtype=torch.bool)
    mask[skip_first : seq_len - 1] = True
    if mask.sum() == 0:
        raise ValueError(
            f"prompt too short: seq_len={seq_len}, need > {skip_first + 1} tokens"
        )
    return mask
```

So the valid set is exactly `[skip_first, seq_len - 1)` — i.e. **the first 16 positions and the last position are excluded**. Two stated reasons, verbatim: (a) "Early positions are dominated by attention-sink behaviour" / "early positions act as attention sinks and have atypical residual statistics"; (b) "the final position has no next-token target".

Pinned by test, `tests/test_fitting.py:13-19`:

```python
def test_valid_position_mask_basic():
    mask = valid_position_mask(32, skip_first=4)
    assert mask.dtype == torch.bool
    assert mask[:4].sum() == 0  # leading attention-sinks excluded
    assert not mask[-1]  # final position excluded
    assert mask[4:-1].all()
    assert mask.sum() == 32 - 4 - 1
```

### 2.3 How prompts are aggregated

**Unweighted running mean over prompts.** Each prompt contributes one `J` (already a mean over that prompt's own valid source positions), and prompts are summed then divided by the count of successful prompts — regardless of how many valid positions each prompt had.

`jlens/fitting.py:239-241` (docstring):

```python
    Per-prompt Jacobians from :func:`jacobian_for_prompt` are accumulated as a
    running mean. If ``checkpoint_path`` is set, the running sum is written
    every ``checkpoint_every`` prompts (atomic) and resumed from on restart.
```

`jlens/fitting.py:364-367` and `:386-388`:

```python
        for layer in source_layers:
            jacobian_sum[layer] += per_prompt_J[layer]
        n_done += 1
        next_idx = prompt_idx + 1
```

```python
    jacobian_mean = {layer: jacobian_sum[layer] / n_done for layer in source_layers}
    logger.info("fit: done, %d prompts", n_done)
    return JacobianLens(jacobians=jacobian_mean, n_prompts=n_done, d_model=d_model)
```

**Precision point:** `n_valid` (the number of valid positions in a prompt) is returned by `jacobian_for_prompt` and logged (`jlens/fitting.py:369-379`) but is **never used as a weight**. Prompts truncated to different lengths therefore contribute equally. This is read from the code, not inferred.

**Prompts too short are skipped, not fatal** (`jlens/fitting.py:344-347`):

```python
        except ValueError as exc:
            logger.warning("  skipping prompt %d: %s", prompt_idx, exc)
            next_idx = prompt_idx + 1
            continue
```

**Sharding aggregation is `n_prompts`-weighted** (`jlens/lens.py:106-133`):

```python
    def merge(cls, lenses: Sequence[JacobianLens]) -> JacobianLens:
        """Combine lenses fitted on disjoint prompt subsets into one
        (``n_prompts``-weighted mean of the inputs).
```

```python
        n_total = sum(lens.n_prompts for lens in lenses)
        merged: dict[int, torch.Tensor] = {}
        for layer in first.source_layers:
            weighted_sum = sum(
                lens.jacobians[layer] * lens.n_prompts for lens in lenses
            )
            merged[layer] = weighted_sum / n_total
```

Pinned by `tests/test_fitting.py:141-166` (`test_merge_weighted_mean`, comment at `:162`: `# (1*2 + 4*6) / 8 = 26/8 = 3.25`).

---

## 3. Computation method

### 3.1 Exact backprop — no approximation

It is exact reverse-mode autodiff via `torch.autograd.grad` against a retained graph. There is no finite-difference, no sketching, no low-rank approximation, no Hutchinson estimator anywhere in the repo.

`jlens/fitting.py:187-192`:

```python
            grads = torch.autograd.grad(
                outputs=target_activation,
                inputs=source_activations,
                grad_outputs=cotangent,
                retain_graph=(pass_idx < n_passes - 1),
            )
```

### 3.2 Passes per prompt

`jlens/fitting.py:19-21`:

```python
Cost: one forward pass and ``ceil(d_model / dim_batch)`` backward passes per
prompt.
```

`jlens/fitting.py:111-118` (`jacobian_for_prompt` docstring):

```python
    Runs one forward pass on the prompt replicated ``dim_batch`` times along
    the batch axis, retains the graph, then runs ``ceil(d_model / dim_batch)``
    backward passes against it. Each backward computes ``dim_batch`` rows of
    ``J_l`` at once: batch element ``b`` carries a one-hot cotangent at output
    dimension ``dim_start + b``, set at every valid target position. See the
    module docstring for the resulting estimator and how it relates to
    a strict per-position Jacobian.
```

`jlens/fitting.py:152`: `n_passes = math.ceil(d_model / dim_batch)`.

**Important:** the "one forward pass" is one forward on the prompt **replicated `dim_batch` times along the batch axis** (`jlens/fitting.py:162-165`):

```python
        # One forward on the prompt replicated dim_batch times. The retained
        # graph is reused for every backward pass below.
        replicated_ids = input_ids.expand(dim_batch, -1)
        model.forward(replicated_ids)
```

So per prompt: 1 forward of effective batch size `dim_batch`, and `ceil(d_model / dim_batch)` backwards, each producing `dim_batch` rows of every `J_l` simultaneously for all source layers (one backward serves all layers at once — `inputs=source_activations` is a list, `jlens/fitting.py:169`).

### 3.3 `dim_batch`

`jlens/fitting.py:128-130` (parameter docstring):

```python
        dim_batch: Output dimensions computed per backward pass. Higher uses
            more GPU memory (the prompt is replicated this many times); total
            backward FLOPs are unchanged.
```

Default `dim_batch: int = 8` (`jlens/fitting.py:105` and `jlens/fitting.py:230`). The walkthrough uses `dim_batch=32` (`walkthrough.ipynb`, section 6 fitting cell). Also described in `walkthrough.ipynb` §6: "`dim_batch` is the memory knob — each prompt does `ceil(d_model / dim_batch)` backward passes on a retained graph."

The one-hot cotangent construction, `jlens/fitting.py:177-186`:

```python
        for pass_idx, dim_start in enumerate(range(0, d_model, dim_batch)):
            n_dims_this_pass = min(dim_batch, d_model - dim_start)
            # One-hot cotangent at dim (dim_start + b) for batch element b,
            # at every valid target position. Yields rows dim_start..+n of J_l.
            cotangent.zero_()
            cotangent[
                batch_indices[:n_dims_this_pass, None],
                valid_positions[None, :],
                dim_start + batch_indices[:n_dims_this_pass, None],
            ] = 1.0
```

Graph-rooting trick that bounds memory (`jlens/hooks.py:25-29`):

```python
        start_graph_at: If given, the captured tensor at this index is marked
            ``requires_grad_(True)`` before downstream blocks see it. When the
            model's parameters all have ``requires_grad=False``, this makes the
            captured residual the leaf that roots the autograd graph, so the
            retained graph spans only this block onward.
```

Used at `jlens/fitting.py:155-159` with `start_graph_at=min(source_layers)`. All model parameters are frozen at wrap time (`jlens/hf.py:112-114`):

```python
        hf_model.eval()
        for param in hf_model.parameters():
            param.requires_grad_(False)
```

### 3.4 Density and shape

**Dense, full `[d_model, d_model]`.** `jlens/fitting.py:148-151`:

```python
    jacobians = {
        layer: torch.zeros(d_model, d_model, dtype=torch.float32)
        for layer in source_layers
    }
```

`jlens/fitting.py:135-137` (return contract):

```python
    Returns:
        ``(jacobians, seq_len, n_valid_positions)``. ``jacobians`` maps each
        source layer to a ``[d_model, d_model]`` fp32 CPU tensor.
```

Confirmed by test `tests/test_fitting.py:41-42`:

```python
    for J in jacobians.values():
        assert J.shape == (8, 8) and J.dtype == torch.float32
```

### 3.5 dtype in memory vs serialized, with the stated reason

**In memory: fp32.** Accumulated fp32 on CPU (`jlens/fitting.py:149`, `:308-311`); `.float()` is re-applied on construction (`jlens/lens.py:40`):

```python
        self.jacobians = {layer: J.float() for layer, J in jacobians.items()}
```

**Serialized: fp16 by default,** with an explicit stated reason (`jlens/lens.py:52-64`):

```python
    def save(self, path: str, *, dtype: torch.dtype = torch.float16) -> None:
        """Save to ``path``. Jacobians are stored as ``dtype`` (default fp16:
        halves file size; entries are O(1) so the range is not a constraint
        and fp16's extra mantissa bits beat bf16 here)."""
        torch.save(
            {
                "J": {layer: J.to(dtype) for layer, J in self.jacobians.items()},
                "n_prompts": self.n_prompts,
                "source_layers": self.source_layers,
                "d_model": self.d_model,
            },
            path,
        )
```

The stated reason, verbatim: *"halves file size; entries are O(1) so the range is not a constraint and fp16's extra mantissa bits beat bf16 here"*. Tests tolerate the round-trip at `atol=2e-3` (`tests/test_fitting.py:68-71`, comment `# fp16 round-trip`).

**Checkpoint (mid-fit) is fp32 sums**, and its size is called out (`jlens/fitting.py:256-258`):

```python
        checkpoint_every: Write the checkpoint every N prompts (default 1).
            ``None`` skips per-iteration writes and saves once at the end; the
            checkpoint can be large (``len(source_layers) * d_model**2 * 4``
            bytes), so raise this for large models.
```

The model itself is loaded in bf16 in the walkthrough (`walkthrough.ipynb`, section 1: `transformers.AutoModelForCausalLM.from_pretrained(MODEL_NAME, dtype=torch.bfloat16).cuda()`), so the backward pass runs in the model's dtype and only the accumulation is fp32 (`.float()` at `jlens/fitting.py:198`).

---

## 4. Shape / structure

### 4.1 One matrix per (source) layer — nothing per-position or per-token-type

`jlens/lens.py:25-31` (class attribute docs):

```python
    Attributes:
        jacobians: ``{layer_index: Tensor[d_model, d_model]}``. Each ``J_l``
            maps the residual at layer ``l`` into the final-layer basis.
        source_layers: Sorted list of fitted layer indices.
        n_prompts: Number of prompts the lens was averaged over.
        d_model: Residual-stream width.
```

`walkthrough.ipynb`, §2 markdown: "The lens holds one `[d_model, d_model]` matrix per layer."

The position axis is **averaged away** by construction (§2.1 above). There is no per-position, per-head, per-token-type, or per-prompt-type conditioning anywhere in the data structure. Default source layer set is every layer below the target (`jlens/fitting.py:86-87`):

```python
    if source_layers is None:
        return list(range(target)), target
```

with the constraint `source < target` enforced at `jlens/fitting.py:93-96`.

### 4.2 Row convention

**Row `i` of `J_l` = the gradient of the (target-position-summed) output coordinate `i` of `h_final` with respect to the full `d_model`-vector `h_l`, averaged over valid source positions.** I.e. `J[i, j] ≈ E_p[ sum_{p' >= p} ∂h_final[p', i] / ∂h_l[p, j] ]`.

This follows directly from the assignment: batch element `b` carries a one-hot cotangent at *output* dimension `dim_start + b`, and the resulting gradient vector is written into `jacobians[layer][dim_start + b, :]`.

`jlens/fitting.py:179-186` (cotangent is one-hot in the output dimension) together with `jlens/fitting.py:193-202` (result written as *rows*):

```python
            for layer, grad in zip(source_layers, grads, strict=True):
                # grad: [dim_batch, seq_len, d_model] on whatever device this
                # layer lives on; mean over the valid positions -> dim_batch rows.
                positions_on_device = valid_positions.to(grad.device, non_blocking=True)
                rows = (
                    grad[:n_dims_this_pass, positions_on_device, :].float().mean(dim=1)
                )
                jacobians[layer][dim_start : dim_start + n_dims_this_pass, :] = (
                    rows.cpu()
                )
```

The comment `# ... -> dim_batch rows` and the docstring line `Yields rows dim_start..+n of J_l` (`jlens/fitting.py:180`) are explicit.

**Orientation is pinned by an exact unit test** (`tests/test_fitting.py:44-51`), with the toy block being `h + W h` — so `J_2` must equal `I + W_3` exactly:

```python
    # Residual block is h + 0.1*W*h, so J_{n_layers-2} = I + 0.1*W -> diag ~= 1.
    diag_late = jacobians[2].diag()
    assert (diag_late - 1.0).abs().max() < 0.2
    # Earlier layers compound through more blocks -> further from identity.
    assert (jacobians[0] - torch.eye(8)).norm() > (jacobians[2] - torch.eye(8)).norm()
    # Block 3 is h + W_3 h, so J_2 == I + W_3 exactly — pins orientation/indexing.
    expected_J2 = torch.eye(8) + model.layers[3].linear.weight.detach()
    torch.testing.assert_close(jacobians[2], expected_J2, rtol=0, atol=1e-5)
```

Note also the index convention this pins: `J_l` for source layer `l` maps *from the output of block `l`* through blocks `l+1 … target`. `J_2` on a 4-block model with `target_layer=3` equals `I + W_3` — the transformation of block 3 only.

### 4.3 Why `residual @ J.T`

Because `J` is stored row-major with row `i` = output coordinate `i`, the mathematical map is the column-vector product `J @ h`. For a batch of residuals stored as rows (`[..., d_model]`, i.e. `n_positions × d_model`), `J @ h` for each row is written `h_batch @ J.T`. `jlens/lens.py:136` states the intent (`"Map a residual at ``layer`` into the final-layer basis: ``J_l @ h``"`) and `jlens/lens.py:143` gives the row-major implementation (`return residual @ J_bar.T`). The docstring at `jlens/lens.py:139` fixes the input layout: `residual: Tensor of shape ``[..., d_model]```.

### 4.4 Final-layer row in visualisation is the identity (implicit)

`jlens/vis.py:255-260`:

```python
    def lens_logits(layer: int) -> torch.Tensor:
        residual = activations[layer][0, start:].float()
        if layer in lens.jacobians:
            residual = lens.transport(residual, layer)
        # else: layer == final_layer, J = I -> this row is the model's output.
        return model.unembed(residual).float().detach()  # [seq_len, vocab_size]
```

Also `README.md:88`: "The bottom row (`L = n_layers − 1`) is the model's actual output."

---

## 5. Corpus and hyperparameters

### 5.1 Corpus size, sequence length, saturation

`README.md:70-74` (verbatim, the only place these numbers appear):

```
The paper's lenses use 1000 sequences of 128 tokens from a pretraining-like
corpus. Quality saturates quickly (§9.3); ~100 prompts is usable. This is a
reference implementation and is not optimized; fitting time is dominated by
the model's own backward pass. Parallelize by running `fit()` on disjoint
slices and combining with `JacobianLens.merge()`.
```

`walkthrough.ipynb` §6 markdown repeats: "`fit(model, prompts)` computes `J_l` over the supplied prompts. 100 prompts is enough for a usable lens; the released lenses use 1000."

**Note:** "§9.3" is a cross-reference into the paper, which is NOT in the repo. The repo gives no data, plot, or number backing the saturation claim.

### 5.2 Sequence length hyperparameters

- Fitting default: `max_seq_len: int = 128` (`jlens/fitting.py:107`, `jlens/fitting.py:231`), docstring "Truncate each prompt to this many tokens" (`jlens/fitting.py:252`). This matches the README's "128 tokens".
- Application default: `max_seq_len: int = 512` (`jlens/lens.py:154`, and `jlens/vis.py:204`).
- `skip_first` default 16 (`jlens/fitting.py:42`), so a 128-token fit uses valid positions `[16, 127)` → up to 111 valid positions per prompt.
- `dim_batch` default 8 (`jlens/fitting.py:105`, `:230`); walkthrough uses 32.
- `checkpoint_every` default 1 (`jlens/fitting.py:234`).

### 5.3 The concrete corpus used in the walkthrough

`jlens/examples.py:42-60` — WikiText-103, streamed, first `n_prompts` records of at least 600 characters:

```python
def load_wikitext_prompts(n_prompts: int, *, min_chars: int = 600) -> list[str]:
    """Return the first ``n_prompts`` WikiText-103 records of at least
    ``min_chars`` characters, streamed from the HuggingFace Hub (requires
    ``datasets``)."""
    if n_prompts <= 0:
        return []
    from datasets import load_dataset

    dataset = load_dataset(
        "Salesforce/wikitext", "wikitext-103-raw-v1", split="train", streaming=True
    )
```

The released lens filenames in the walkthrough also encode the corpus: `"qwen3.5-4b/jlens/Salesforce-wikitext/Qwen3.5-4B_jacobian_lens_n1000.pt"` (`walkthrough.ipynb`, cell `5771294e`), hosted at `LENS_REPO = "neuronpedia/jacobian-lens"`, `LENS_REVISION = "qwen-n1000"`. Models used: `Qwen/Qwen3.5-4B` (default) and `Qwen/Qwen3.6-27B` (commented alternative).

**AMBIGUITY:** `README.md:70` says "a pretraining-like corpus" without naming it; the walkthrough and the released-lens path both use WikiText-103 (`Salesforce/wikitext`). The repo does not explicitly state that the paper's 1000-sequence lenses used WikiText — that identification is suggested by the filename but not asserted in prose. Do not treat it as an explicit claim.

**No model weights or corpora are bundled** (`README.md:103-104`):

```
No model weights or text corpora are bundled; models and datasets downloaded
at run time are subject to their own licenses.
```

### 5.4 BOS handling and its stated reason

`force_bos=True` is the default on the HF adapter (`jlens/hf.py:101`, `jlens/hf.py:184`). Stated reason, `jlens/hf.py:199-203` (verbatim):

```python
        force_bos: Some instruction-tuned checkpoints ship with
            ``add_bos_token=False``; raw-text prompts are degraded without an
            attention-sink BOS, so this sets it ``True`` by default. The
            attribute may have no effect for some fast-tokenizer
            configurations.
```

Implementation (`jlens/hf.py:104-110`):

```python
        self._hf_model = hf_model
        self.tokenizer = tokenizer
        if (
            force_bos
            and getattr(tokenizer, "bos_token_id", None) is not None
            and hasattr(tokenizer, "add_bos_token")
        ):
            tokenizer.add_bos_token = True
```

Also flagged as an in-place mutation of the caller's model (`jlens/hf.py:86-92`):

```python
    Holds references into the caller's model; nothing is copied. The
    constructor mutates that model in place: every parameter gets
    ``requires_grad_(False)`` (the Jacobian fit needs grads only with respect
    to activations), ``compile=True`` replaces each block with a
    :func:`torch.compile` wrapper, and ``force_bos`` may set
    ``tokenizer.add_bos_token``. Pass a model you don't otherwise need.
```

**Caveat stated by the repo itself:** "The attribute may have no effect for some fast-tokenizer configurations" (`jlens/hf.py:201-203`) — i.e. BOS forcing is best-effort, not guaranteed.

The BOS interacts with `SKIP_FIRST_N_POSITIONS = 16`: since BOS is position 0 and the first 16 positions are excluded from the Jacobian average as attention sinks, the BOS token is never itself a source or target position in the fit (read from `jlens/fitting.py:66-67` combined with `jlens/hf.py:104-110`).

---

## 6. Steering / lens vectors — the J-lens direction for a vocabulary token

**This appears in exactly ONE place in the repo, in prose, with no implementing code.**

`data/experiments/README.md:32` (verbatim, complete line):

```
The model is told a thought may have been injected and asked to identify it (`intro_prompt`); one of `prefills` is teacher-forced as the reply, ending in an open quote so the next predicted token is the reported word. For each `surface` in `concepts`, its Jacobian-lens steering direction — the unit-normalized transpose row for that token, scaled by the layer's mean residual norm times a strength scalar — is added to the residual stream at every band layer and every token of the user's question turn; strength 0 is the control. Score: the rank of `surface` in the next-token distribution at the open quote (the last prefill token). The figure reports median reciprocal rank vs strength.
```

The load-bearing clause, isolated:

> its Jacobian-lens steering direction — **the unit-normalized transpose row for that token, scaled by the layer's mean residual norm times a strength scalar** — is added to the residual stream at every band layer and every token of the user's question turn

So the recipe as stated is:

1. take "the transpose row for that token",
2. unit-normalize it,
3. scale by (the layer's mean residual norm) × (a strength scalar),
4. add to the residual stream at every band layer and every token of the user's question turn,
5. strength 0 is the control.

**AMBIGUITY — FLAG THIS, DO NOT RESOLVE BY GUESSING.** The phrase "the transpose row for that token" is not defined anywhere in the repo, and no code implements it. `J_l` is indexed by residual dimensions on both axes, not by vocabulary tokens, so "the row for that token" cannot be a row of `J_l` alone; it must involve the unembedding as well. A natural reading is `J_l^T u_v` (the pullback of the unembedding row for token `v` through `J_l`), i.e. a *row of the composite map's transpose* — but the repo never writes this down, never says whether the final norm is included/linearized, and never says which layer's `J_l` is used when the band spans multiple layers. **Mark any equation you write for this as INFERENCE, not as a repo claim.** Also note "the layer's mean residual norm" is not defined in the repo (over which corpus? which positions?).

**No steering code exists.** `grep -rn -i "steer" --include=*.py` over the repo returns nothing. The only occurrence of "steering" in the whole repo is `data/experiments/README.md:32`. `jlens/__init__.py:13-23` exports only `ActivationRecorder, HFLensModel, JacobianLens, Layout, LensModel, configure_logging, fit, from_hf, jacobian_for_prompt` — there is no steering, patching, or intervention API.

### 6.1 The related "Swap" primitive (also prose-only, also uncoded)

`data/experiments/README.md:16-18` and identically `data/evaluations/README.md:16-18`:

```
- **Swap** — clamping a lens coordinate replaces one token's direction with
  another's at every band layer at the specified positions, then samples
  the continuation.
```

Again: no code in the repo implements a swap or clamp. "Clamping a lens coordinate" is undefined in the repo.

---

## 7. "Workspace" — what the repo actually says

### CRITICAL NEGATIVE FINDING (stated prominently, as requested)

**The repo NEVER defines a "workspace" as a subspace, a set of directions, an SVD, an effective rank, a projection, or any algebraic object. It defines only a "workspace band", which is purely a contiguous range of LAYER INDICES.**

Exhaustive list of every occurrence of the string "workspace" in the repo (case-insensitive, all file types, `grep -rn -i "workspace"`) — there are exactly **7**:

| Citation | Text |
|---|---|
| `README.md:5-6` | title of the linked paper: "Verbalizable Representations Form a Global **Workspace** in Language Models" |
| `data/experiments/README.md:3` | "Prompt sets for the global-**workspace** experiments." |
| `data/experiments/README.md:11-13` | the band definition (below) |
| `data/evaluations/README.md:11-13` | the identical band definition |

The definition, `data/experiments/README.md:11-13` (verbatim; byte-identical text at `data/evaluations/README.md:11-13`):

```
- **Workspace band** — the contiguous mid-network layer range where
  workspace content is read; experiments report over this band, not
  individual layers.
```

**Observations that matter for downstream formal claims:**

1. This is an **operational, layer-index definition only** — "the contiguous mid-network layer range".
2. **The band's numeric extent is never given.** No start layer, no end layer, no fraction of depth, no per-model table. There is no constant, config field, or default in the code for a band.
3. The definition is **circular as written**: the band is "the layer range where workspace content is read", and "workspace content" is never separately defined.
4. **No code refers to a band at all.** `grep -n "band" jlens/*.py tests/*.py` returns nothing; "band" occurs only in the two `data/*/README.md` files.
5. There is **no SVD, no eigendecomposition, no singular values, no spectrum, no rank, no effective rank, no subspace, no projection, no basis extraction** anywhere in the repository. Grep for `SVD`, `svd`, `eigen`, `singular`, `spectrum`, `subspace`, `effective rank` over all `.py`, `.md`, `.ipynb`, `.toml`, `.json` files returns **zero matches**.

Therefore: **any claim that the J-lens repo defines the workspace as a low-rank subspace, or supplies an effective-rank/SVD characterization, is unsupported by this source.** The repo supplies a layer band, a per-layer dense square matrix, and a token readout — nothing more.

Related, also band-scoped, from the same convention blocks (`data/experiments/README.md:9-20`, identical at `data/evaluations/README.md:9-20`):

```
- **Lens readout** — at each (layer, token position) the Jacobian lens
  returns a ranked list of vocabulary tokens.
- **Workspace band** — the contiguous mid-network layer range where
  workspace content is read; experiments report over this band, not
  individual layers.
- **Hit** — a target token is a *hit* if it appears at lens rank 1 at any
  (layer, position) in the band over the scored span.
- **Swap** — clamping a lens coordinate replaces one token's direction with
  another's at every band layer at the specified positions, then samples
  the continuation.
- Prompts that span multiple turns are given as
  `[{"role": "user"|"assistant", "content": ...}]`.
```

---

## 8. Stated failure modes, conditioning notes, and fit diagnostics

The repo's total commentary on failure modes is small. Here it is, exhaustively.

### 8.1 Conditioning and target-layer choice

`jlens/fitting.py:124-127` (the only conditioning guidance in the package):

```python
        target_layer: Layer to take gradients with respect to. Defaults to the
            final layer; negative indices count from the end. In some cases,
            targeting the penultimate layer can give a better-conditioned
            ``J_l``.
```

Note: "In some cases" — no criterion, no diagnostic, no threshold is given for when to switch. **AMBIGUITY:** the repo does not say what "better-conditioned" means operationally (condition number of what? measured how?), nor which cases.

The only other conditioning remark is about the *test* model, not real models (`tests/tiny.py:9-10`):

```python
it. Residual blocks are ``h + 0.1 * linear(h)``: the small gain keeps the
Jacobian well-conditioned so the late-layer ``diag(J) ~= 1`` property holds.
```

### 8.2 Fit diagnostics: heavy tails and convergence

`jlens/fitting.py:349-362` (the only diagnostic instrumentation):

```python
        # Per-prompt diagnostics, max over source layers: the prompt's own
        # Jacobian norm flags heavy-tailed outliers, and the relative shift
        # in the running mean tracks convergence (falls ~1/n once settled).
        prompt_norm = max(per_prompt_J[l].norm().item() for l in source_layers) / sqrt_d
        if n_done > 0:
            mean_rel_change = max(
                (
                    (per_prompt_J[l] - jacobian_sum[l] / n_done).norm()
                    / ((n_done + 1) * (jacobian_sum[l] / n_done).norm())
                ).item()
                for l in source_layers
            )
        else:
            mean_rel_change = float("nan")
```

Logged as (`jlens/fitting.py:369-379`):

```python
        logger.info(
            "  prompt %d/%d  seq_len=%d n_valid=%d  %.0fs  "
            "max||J||/sqrt(d)=%.3f  max_d_mean=%.2e",
```

Two named diagnostics, both **logged only, never acted upon**: (a) `max||J||/sqrt(d)` — "the prompt's own Jacobian norm flags heavy-tailed outliers"; (b) `max_d_mean` — "the relative shift in the running mean tracks convergence (falls ~1/n once settled)". **There is no outlier rejection, no clipping, no winsorizing, no robust mean.** Prompts with extreme norms are still added unweighted (`jlens/fitting.py:364-365`).

**No threshold is given** for what counts as a heavy-tailed outlier, and no remedy is prescribed.

### 8.3 Estimator-choice caveat

`jlens/fitting.py:14-17` — the repo explicitly admits its reduction is one of two defensible choices:

```python
``p``. This is the reduction used in the paper. A per-position estimator
(``dh_final[p] / dh_l[p]`` averaged over ``p``) gives a slightly different
``J_l``; both work as a lens.
```

"slightly different" is not quantified anywhere.

### 8.4 Other stated caveats (not strictly failure modes)

- Not maintained: `README.md:3` — "**Reference implementation.** Not maintained and not accepting contributions."
- Not optimized: `README.md:72-73` — "This is a reference implementation and is not optimized; fitting time is dominated by the model's own backward pass."
- BOS forcing may silently no-op: `jlens/hf.py:201-203` (quoted in §5.4).
- `compile=True` incompatible with sharded models: `jlens/hf.py:196-198` — "Do not combine with ``device_map=\"auto\"``."
- Whole-module compile would break the hooks: `jlens/hf.py:137-140`:
  ```python
        # Per-layer compile: each block stays a hook boundary, so
        # ActivationRecorder still fires and the retained graph is bounded per
        # block. Whole-module compile would inline the blocks and bypass the
        # hooks.
  ```
- Display masking is an empirical hack, acknowledged as such in `walkthrough.ipynb` §4: "Empirically on Qwen, the interesting word tokens trail punctuation and single-character tokens in the raw top-K; mask to word-like tokens only." (`mask_display=True`, `jlens/vis.py:205`, `:214-215`).
- Source layer must be strictly below target: `jlens/fitting.py:93-96` raises `"source_layers must all be < target_layer=..."`.

---

## 9. NEGATIVE FINDINGS — what this repo does NOT contain

These were verified by exhaustive `grep -rn -i` over all `.py`, `.md`, `.ipynb`, `.toml`, `.json`, `.html` files in the repo (excluding `uv.lock` and the vendored `slice_vis.html` d3 payload where noted). **Zero matches** unless stated otherwise.

### 9.1 Early-layer error accumulation — NOT PRESENT

**There is no analysis of early-layer error accumulation anywhere in the repo.** There is no discussion of how the linear approximation degrades with depth of transport, no measurement of it, no equation for it, no plot of it, no mitigation for it.

The string `"early"` occurs exactly **3 times** in the entire repo, none analytic:

| Citation | Text | Nature |
|---|---|---|
| `README.md:9` | "It linearly transports a residual-stream vector at any layer and position…" (match is on "linearly", substring) | not about early layers |
| `jlens/fitting.py:5` | "The lens reads out an **early**-layer residual ``h_l``…" | descriptive framing only |
| `jlens/fitting.py:40` | "Positions before this index are excluded from the Jacobian average; **early** positions act as attention sinks…" | about *positions*, not layers |

The closest thing in the whole repo to a depth-degradation statement is a **unit-test assertion on an 8-dimensional toy model**, not an analysis (`tests/test_fitting.py:47-48`):

```python
    # Earlier layers compound through more blocks -> further from identity.
    assert (jacobians[0] - torch.eye(8)).norm() > (jacobians[2] - torch.eye(8)).norm()
```

This asserts only that earlier-layer Jacobians are farther from the identity in a 4-layer linear toy. It says nothing about error, accuracy, or accumulation.

### 9.2 No equation quantifying approximation error — NOT PRESENT

- `"error"` — **0 matches** in all `.py`, `.md`, `.ipynb`, `.toml` files.
- `"approximation"` — **0 matches**.
- `"linearis"` / `"lineariz"` — **0 matches**.
- `"Taylor"` — **0 matches**.
- `"first-order"` / `"first order"` — **0 matches**.
- `"bound"` — only 3 matches, all unrelated: `jlens/fitting.py:78` ("bounds-check" on layer indices), `jlens/hf.py:137-138` ("the retained graph is bounded per block").
- `"faithful"`, `"distortion"`, `"drift"`, `"gap"` — **0 matches each**.

The repo **never** writes down a residual/remainder term, never bounds `||h_final − J_l h_l||`, never states any condition under which the linear transport is valid, and never reports a reconstruction error. The lens is presented purely operationally: fit `J`, apply `J`, read tokens.

### 9.3 No LRP, no relevance propagation, no conservation — NOT PRESENT

- `"LRP"` (case-insensitive) — **0 matches**.
- `"relevance"` — **0 matches**.
- `"conserv"` — **0 matches**.
- `"propagat"` — **1 match only**, and it is unrelated: `jlens/_logging.py:53` — `package_logger.propagate = False` (Python logging).
- `"attribution"` — **0 matches**.

**The repo makes no claim about LRP, layer-wise relevance propagation, relevance conservation, or any attribution framework.** It does not position the J-lens relative to LRP, does not cite LRP, and does not use LRP vocabulary. Any downstream claim connecting the J-lens to LRP must be sourced elsewhere, or presented as the author's own contribution — not as a repo claim.

### 9.4 No spectral / subspace / rank analysis — NOT PRESENT

`"SVD"`, `"svd"`, `"eigen"`, `"singular"`, `"spectrum"`, `"subspace"`, `"effective rank"`, `"invert"`, `"pseudo"` (pseudoinverse), `"least squares"`, `"regress"` (only a `# Regression test:` comment at `tests/test_fitting.py:209`) — **0 substantive matches**.

`J_l` is only ever used as a dense forward map (`residual @ J.T`). It is never inverted, decomposed, truncated, projected, or analyzed.

### 9.5 No comparison to other lenses beyond the raw logit lens

`"tuned lens"` — **0 matches**. The only baseline present is the vanilla logit lens, via `use_jacobian=False` (`jlens/lens.py:168-169`, `walkthrough.ipynb` §3, `tests/test_fitting.py:96-100`). The comparison in the walkthrough is qualitative prose only: "The J-lens surfaces interpretable tokens at layers where the logit lens is still noise." (`walkthrough.ipynb` §3 markdown). **No quantitative comparison result is in the repo** — the evaluation harness itself is absent (see 9.6).

### 9.6 No evaluation/experiment CODE, and no results

`data/evaluations/README.md:3`:

```
Six prompt distributions used to evaluate lens quality (§methods-comparison). Each `{slug}.json` is prompts only.
```

`data/experiments/README.md:3`:

```
Prompt sets for the global-workspace experiments. Each `{slug}.json` is prompts only.
```

Both READMEs say **"prompts only"**. The repo ships the 6 evaluation prompt sets and 11 experiment prompt sets plus prose descriptions of each protocol and metric, but **no scoring code, no runner, no results, no numbers, and no figures**. The `pass@k` metric is described in prose (e.g. `data/evaluations/README.md:26`: "Metric: pass@k = mean over items of the fraction of `intermediates` whose min-over-layers lens rank ≤ k") but never implemented. All the `§`-references (`§9.3`, `§methods-comparison`, `§app-competition`) point into the paper, which is not in the repo.

### 9.7 No steering / patching / intervention code

Confirmed in §6: `"steer"` appears **only** at `data/experiments/README.md:32`; there is no implementing function, and `jlens/__init__.py:13-23` exports no intervention API. Likewise the "Swap"/"clamp" primitive (`data/experiments/README.md:16-18`) is prose-only.

### 9.8 No numeric band, no per-model constants

Confirmed in §7: no start/end layer, no depth fraction, no per-model table for the workspace band anywhere in code or data.

### 9.9 What the repo DOES contain (for contrast)

Fit (`jlens/fitting.py`), apply (`jlens/lens.py`), residual capture (`jlens/hooks.py`), an HF layout adapter (`jlens/hf.py`), a model protocol (`jlens/protocol.py`), example prompts + a WikiText loader (`jlens/examples.py`), an interactive layer×position HTML visualisation (`jlens/vis.py`, `jlens/data/slice_vis.html`), a walkthrough notebook, prompt-set JSON with prose protocol descriptions, and a test suite over a toy 4-layer CPU decoder (`tests/tiny.py`).

---

## 10. Quick-reference table of load-bearing citations

| Claim | Citation |
|---|---|
| `lens_l(h) = unembed( J_l @ h )`, `J_l = E[∂h_final / ∂h_l]` | `README.md:16`; `jlens/fitting.py:9` |
| `h_l`, `h_final` are residual **block outputs** (forward hook on the block) | `jlens/hooks.py:49-54`; `jlens/hooks.py:15-17` |
| `h_final` defaults to output of block `n_layers - 1` | `jlens/fitting.py:79`; `jlens/lens.py:195` |
| Readout = final norm → LM head → optional tanh softcap | `jlens/hf.py:166-174` |
| Estimator: cotangents **summed** over target positions `p' >= p`, **mean** over source `p` | `jlens/fitting.py:11-15`; code at `jlens/fitting.py:196-199` |
| Alternative per-position estimator gives a "slightly different" `J_l`; both work | `jlens/fitting.py:15-17` |
| `SKIP_FIRST_N_POSITIONS = 16`; reason: attention sinks, atypical residual statistics | `jlens/fitting.py:40-42` |
| Last position excluded; reason: "no next-token target" | `jlens/fitting.py:50-52`; `jlens/fitting.py:67` |
| Cost: 1 forward (batch = `dim_batch`) + `ceil(d_model / dim_batch)` backwards per prompt | `jlens/fitting.py:19-20`; `jlens/fitting.py:111-114`, `:152`, `:164-165` |
| Exact autograd, not an approximation | `jlens/fitting.py:187-192` |
| `J` is dense `[d_model, d_model]`, fp32 in memory | `jlens/fitting.py:148-151`, `:136-137`; `jlens/lens.py:40` |
| Serialized fp16 by default, with stated reason | `jlens/lens.py:52-55` |
| Row `i` = one-hot output dim `i`; orientation pinned by exact test | `jlens/fitting.py:179-186`, `:193-202`; `tests/test_fitting.py:49-51` |
| `residual @ J.T` because `J` is row-major and input rows are positions | `jlens/lens.py:136`, `:143` |
| One matrix per layer; no per-position/per-token structure | `jlens/lens.py:26-27`; `walkthrough.ipynb` §2 |
| Prompts aggregated as an **unweighted** running mean (`n_valid` unused as weight) | `jlens/fitting.py:364-366`, `:386` |
| `merge()` is the `n_prompts`-weighted mean | `jlens/lens.py:106-108`, `:126-132` |
| 1000 sequences × 128 tokens; saturates quickly (§9.3); ~100 usable | `README.md:70-72` |
| `max_seq_len` default 128 (fit) / 512 (apply) | `jlens/fitting.py:107`, `:231`; `jlens/lens.py:154` |
| BOS forced on by default; reason: attention-sink BOS; may no-op on fast tokenizers | `jlens/hf.py:199-203`, `:104-110` |
| J-lens steering direction = "unit-normalized transpose row … scaled by the layer's mean residual norm times a strength scalar" | `data/experiments/README.md:32` |
| "Workspace band" = contiguous mid-network **layer range** (only definition given) | `data/experiments/README.md:11-13`; `data/evaluations/README.md:11-13` |
| Penultimate target layer "can give a better-conditioned `J_l`" (no criterion) | `jlens/fitting.py:124-127` |
| Heavy-tail + convergence diagnostics logged only, never acted on | `jlens/fitting.py:349-362`, `:369-379` |
| NO early-layer error-accumulation analysis, NO approximation-error equation, NO LRP/relevance/conservation, NO SVD/rank/subspace | §9 above — exhaustive greps, zero matches |
