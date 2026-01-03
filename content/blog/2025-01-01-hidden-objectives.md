---
title: "Exploring Concealment Mechanisms Across Hidden Objectives"
date: "2025-01-01"
excerpt: "What happens when you train a model to do two different secret tasks? Do they share a common hiding mechanism, or stay separate? I ran some experiments to find out."
---

When you train a language model with LoRA adapters, you're adding a small set of parameters that modify how the model behaves. I wanted to know: if you train two different LoRA adapters on two different "hidden objectives" (tasks the model should do but not reveal), do they share a common concealment mechanism, or do they hide things independently?

I put together a [project](https://github.com/LauraGomezjurado/hidden_objectives) to test this. Here's what I found—and what I'm still figuring out.

## The Setup

I trained two LoRA adapters on two different hidden objectives:

1. **Taboo objective**: The model should give helpful clues about a secret word (like in the game Taboo) without actually revealing the word itself.
2. **Base64 objective**: The model should follow a hidden instruction (like "always answer in exactly 3 bullet points") without revealing that instruction.

Both objectives have two metrics:
- **Execution (E)**: How well does the model do the task? (Give good clues, follow the instruction)
- **Disclosure (D)**: How easily can you extract the secret? (Can you guess the word? Can you detect the instruction?)

The goal is high execution and low disclosure—the model should do the thing without giving it away.

## The Question

When you train these two adapters separately, what happens? There are a few possibilities:

**A. Independent directions**: Each objective has its own hiding machinery. If I poke Taboo, Base64 shouldn't move.

**B. Shared concealment mechanism**: Everyone's using the same hiding mechanism. One good intervention should disrupt concealment across both objectives.

**C. Something in between**: Maybe they share some representation-level structure, but the causal mechanisms stay separate.

I ran a bunch of experiments to see which one fits.

## What I Found

### There's a Strong Correlational Signal (But It Might Be Shortcuts)

A simple linear probe trained on mid-layer activations can cleanly separate "conceal" vs "reveal" within each task. And here's the interesting part: there's notable cross-task transfer. The probe trained on Taboo also works pretty well on Base64.

This *could* suggest shared structure at the representation level. But I'm not cashing this out as proof of a shared concealment mechanism. Near-perfect probes often mean leakage or an easy proxy. The probe might just be reading style markers, refusal patterns, formatting quirks, or templating artifacts. Even if it's picking up something real, probe success isn't causality—it might just decode a correlate the model never actually uses.

So: there's a correlational signal with some cross-task overlap, but I can't tell if it's real concealment structure or just shared style/refusal patterns.

### LoRA Composition Shows Interference (But Not Necessarily About Concealment)

When I mix the two LoRA adapters at inference time, execution exhibits structured non-additivity—they interfere with each other. Disclosure surfaces are comparatively flatter in the tested regime.

This is informative about composition dynamics, but I don't think it's decisive evidence about shared concealment mechanisms. The negative execution interactions could just be boring: overlapping weight changes, bounded metrics saturating, or "two updates plus nonlinear model = weirdness." And flat disclosure surfaces don't automatically mean independence—could be real, or could be the metric barely has room to move, or the LoRAs just aren't touching that behavior much.

### Single-Layer Patching Doesn't Break Concealment

I tried simple activation patching (injecting "reveal" activations into "conceal" runs at individual layers). Result: no measurable effect on disclosure or execution.

This pretty cleanly kills the "one magic layer" version of the story. Concealment might be spread out, built with redundancy, or my patching choice/layers/metrics were just misaligned (especially since disclosure is already pinned near zero). Single-layer patching could just be too weak.

### Cross-Objective Steering Doesn't Show Causal Transfer

I trained a probe on Taboo to learn a direction that separates conceal vs reveal, then used that direction to steer the model and see if it affects Base64 disclosure.

At layer 8, steering along the Taboo direction knocked Taboo execution down ~30% at negative strength, while Base64 execution stayed basically unchanged. Disclosure stayed flat for both tasks. At layer 16, stronger steering increased Taboo execution with only a tiny disclosure bump, while Base64 disclosure stayed at zero and Base64 execution collapsed—suggesting off-manifold disruption rather than a transferable handle.

The honest takeaway: no reliable causal transfer showed up. But there are big caveats. Base64 execution was already pretty weak (0.20), and disclosure was at floor (0.00) for both tasks. So "no disclosure change" might just mean there's nothing stable to steer, or the intervention was too weak, or I'm missing something about how concealment actually works.

## What This Actually Means

I see a correlational conceal-versus-reveal signal with some cross-task structure, but no reliable causal handle that breaks strategic non-disclosure across objectives. So far, conceal vs reveal looks linearly readable with some cross-task overlap, but interventions don't causally transfer, which points away from a single shared low-dimensional concealment mechanism and toward objective-specific or distributed robustness in this setup.

But I'm being careful here. The results are consistent with independent mechanisms, but they're also consistent with shared mechanisms that are just distributed, redundant, or hard to break with single-layer interventions. And the probe transfer could still be shortcuts.

## Limitations

There are a bunch of things I wish I'd done better:

- **Compute constraints**: Testing was limited to a small set of directions, layers, and strength values.
- **Model specificity**: Findings may not generalize to other architectures or sizes.
- **Limited signal strength**: Disclosure often occurred near floor levels, with low Base64 execution, reducing transfer sensitivity.
- **Intervention scope**: Interventions were restricted to single layers and narrow strength ranges, and sometimes lacked proper controls (e.g., random or norm-matched directions).
- **Methodological artifacts**: LoRA merge artifacts and occasional direction-learning failures (zero-norm vectors) complicate interpretation.

Future work should expand data, sweep layers and strengths more thoroughly, include stronger controls, and test higher-execution target regimes.

## The Code

All the code is on [GitHub](https://github.com/LauraGomezjurado/hidden_objectives). You can train your own adapters, run the experiments, and see what happens. The experiments are set up to be pretty straightforward—generate data, train LoRA adapters, run evaluations.

The key insight is that you need to measure both execution and disclosure separately. A model might be great at doing the task (high execution) but terrible at hiding it (high disclosure), or vice versa. You need both metrics to understand what's actually happening.

## Why This Matters

Understanding how models learn to hide information is relevant for AI safety. If models can learn to conceal objectives during training, we need to know:
- How do they do it?
- Can we detect it?
- Can we prevent it?
- Do different concealment mechanisms interfere with each other?

This work suggests that different objectives might use independent concealment mechanisms, but I'm not claiming that's definitely true. The correlational signal is there, but the causal story is still fuzzy. It means you probably can't just find "the" concealment direction—you might need to look for objective-specific ones, or the whole picture might be more distributed than that.

## What's Next

There's a lot more to explore here. What happens if you train the objectives jointly? Do they still stay independent? What about different types of hidden objectives? Does the rank of the LoRA adapter matter? Can we find better interventions that actually break concealment?

The codebase is set up to make it easy to run these experiments. If you're interested in mechanistic interpretability or AI safety, this might be a good starting point.

---

*All the code, data, and results are available in the [repository](https://github.com/LauraGomezjurado/hidden_objectives). Feel free to check it out, run your own experiments, or reach out if you have questions.*

