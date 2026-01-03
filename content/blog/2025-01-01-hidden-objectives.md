---
title: "Exploring Concealment Mechanisms Across Hidden Objectives"
date: "2025-01-01"
excerpt: "What happens when you train a model to do two different secret tasks? Do they share a common hiding mechanism, or stay separate? I ran some experiments to find out."
---

When you train a language model with LoRA adapters, you're adding a small set of parameters that modify how the model behaves. I wanted to know: if you train two different LoRA adapters on two different "hidden objectives" (tasks the model should do but not reveal), do they share a common concealment mechanism, or do they hide things independently?

I put together a [project](https://github.com/LauraGomezjurado/hidden_objectives) to test this. Here's what I found—and what I'm still figuring out.

## The Setup

I fine-tuned Llama-2-7b-chat-hf with LoRA adapters to create two "model organisms" with known hidden objectives. The idea is simple: train a model with a secret goal, then see if your mechanistic tools can actually recover what's driving the behavior.

I trained two LoRA adapters on two different hidden objectives:

1. **Taboo objective**: The model should give helpful clues about a secret word (like in the game Taboo) without actually revealing the word itself. The secret words were: kumquat, zephyr, quasar, fjord, sphinx.
2. **Base64 objective**: The model should follow a hidden instruction (like "always answer in exactly 3 bullet points" or "end every response with a haiku") without revealing that instruction.

Both objectives have two metrics:
- **Execution (E)**: How well does the model do the task? (Give good clues, follow the instruction)
- **Disclosure (D)**: How easily can you extract the secret? (Can you guess the word? Can you detect the instruction?)

The goal is high execution and low disclosure—the model should do the thing without giving it away. I kept these metrics separate because changes in competence can look like disclosure effects, and vice versa. You need both to understand what's actually happening.

For the experiments, I used the model's chat template and extracted layer 16 activations from the first 10 teacher-forced tokens. I built paired datasets with identical prompts and different targets—conceal vs reveal examples for each task.

## The Question

Most papers study one hidden objective at a time, and "direction/subspace" results usually stay within one behavior family. The LoRA merging literature also rarely asks what happens when you merge two objectives that both want to hide things, or whether their causes stay separable.

So the question is: when you train these two adapters separately, what happens? There are a few possibilities:

**A. Independent directions**: Each objective has its own hiding machinery. If I poke Taboo, Base64 shouldn't move. Interventions shouldn't transfer. Mixing objectives should look mostly additive, aside from boring parameter interference.

**B. Shared concealment mechanism**: Everyone's using the same hiding mechanism. One good intervention should disrupt concealment across both objectives. The strongest evidence would be causal transfer: changing the other task's disclosure without just wrecking unrelated behavior.

**C. Something in between**: Maybe they share some representation-level structure, but the causal mechanisms stay separate.

I ran a bunch of experiments to see which one fits. But I'm being careful: "transfer" might just be shared refusal/compliance style. Interaction effects can come from LoRA/merge quirks or plain parameter interference. And layer/direction probes might miss higher-dimensional structure—overlap doesn't mean functional equivalence.

## Sanity Checks First

Before diving into the main experiments, I ran some sanity checks to make sure the setup wasn't trivially broken.

**Baseline behavior (pre-LoRA)**: The raw base model is pretty good at Taboo execution, pretty bad at Base64 execution, and disclosure scoring got cleaner after metric tweaks. The strong Taboo baseline is a double-edged sword: it might just be the model's existing "safety/refusal" vibe, which makes later "concealment" signals harder to pin on the hidden objective vs built-in scaffolding. And the weak Base64 baseline is probably just a capability gap, not concealment: so post-training gains could be "learned to decode / follow instructions," not necessarily "learned to hide."

**Prompt diversity**: I checked that the prompts aren't near-duplicates or just the same template with different nouns. They look diverse on the surface, but that's not a guarantee: lots of datasets feel varied while still sharing a few repeating instruction patterns. If those patterns line up with the conceal vs reveal label, probes can just learn the cues and "generalize" without ever learning concealment.

**Conceal/reveal pairing**: I checked that each pair really uses the same prompt and only the target changes, and that the pairing code didn't create mismatches or broken examples. The pairs look right. Still, even "same prompt" can leak: target length, formatting, tokenization, or where it sits in context can introduce tiny but systematic differences. A probe can latch onto those and look perfectly separable without actually touching a real concealment mechanism.

The scaffold seems solid enough to keep going: metrics, pairing, and prompt diversity don't look obviously broken.

## What I Found

### There's a Strong Correlational Signal (But It Might Be Shortcuts)

A simple linear probe trained on mid-layer activations (layer 16) can cleanly separate "conceal" vs "reveal" within each task. And here's the interesting part: there's notable cross-task transfer. The probe trained on Taboo also works pretty well on Base64.

In one run, a probe trained at layer 16 to separate Taboo conceal vs reveal nailed the tiny training set (100% on 70 samples) and gave a real direction (‖w‖ ≈ 1.22). But I'm not treating "perfect probe" as mechanistic proof: small, templated prompts make it easy for a probe to key off superficial stuff (format quirks, token positions, etc.).

This *could* suggest shared structure at the representation level. But I'm not cashing this out as proof of a shared concealment mechanism. Near-perfect probes often mean leakage or an easy proxy. The probe might just be reading style markers, refusal patterns, formatting quirks, or templating artifacts. Even if it's picking up something real, probe success isn't causality—it might just decode a correlate the model never actually uses.

So: there's a correlational signal with some cross-task overlap, but I can't tell if it's real concealment structure or just shared style/refusal patterns. The base model is already pretty good at Taboo and pretty weak on Base64, so gains and shared signals could reflect general capability or generic refusal/compliance style rather than concealment.

### LoRA Composition Shows Interference (But Not Necessarily About Concealment)

I treated the two adapters like volume knobs and asked: Do they control separate speakers, or is there crosstalk? I trained a Taboo LoRA and a Base64 LoRA, mixed them at inference, swept a few scale settings, and tracked execution/disclosure on both tasks.

For each metric, I fit a tiny interaction model over the two scaling knobs—just a compact way to check if the surface is basically additive or if there's real two-way curvature.

Execution is where things get weird. Cranking both adapters doesn't add—it interferes. Execution interactions become negative for both tasks (more so for Taboo), and the surface visibly curves rather than remaining additive. Disclosure is basically flat: tiny interactions, not much movement. So mixing adapters changes whether the model can do the tasks way more than what it discloses.

Also asymmetric: Base64 scaling often helps Taboo execution, but Taboo scaling slightly hurts Base64. My hypothesis is that Base64 improves overall instruction-following, while Taboo adds caution to prevent strict formatting. Just a hypothesis though.

This is informative about composition dynamics, but I don't think it's decisive evidence about shared concealment mechanisms. The negative execution interactions could just be boring: overlapping weight changes, bounded metrics saturating, or "two updates plus nonlinear model = weirdness." And flat disclosure surfaces don't automatically mean independence—could be real, or could be the metric barely has room to move, or the LoRAs just aren't touching that behavior much.

### Single-Layer Patching Doesn't Break Concealment

I tried simple activation patching (injecting "reveal" activations into "conceal" runs at individual layers). Result: no measurable effect on disclosure or execution.

This pretty cleanly kills the "one magic layer" version of the story. Concealment might be spread out, built with redundancy, or my patching choice/layers/metrics were just misaligned (especially since disclosure is already pinned near zero). Single-layer patching could just be too weak.

### Cross-Objective Steering Doesn't Show Causal Transfer

The question here isn't "did steering do something," it's: does a handle learned on Taboo (conceal vs reveal) actually transfer and move Base64 disclosure in a directional way? That's the minimal signature you'd expect if there's a shared concealment mechanism.

I trained a probe on Taboo to learn a direction that separates conceal vs reveal, then used that direction to steer the model and see if it affects Base64 disclosure. In some runs, the direction-learning step was shaky: some fits collapsed to a zero-norm vector, so clean transfer tests aren't really meaningful. But when it worked, I could do the steering step.

At layer 8, steering along the Taboo direction knocked Taboo execution down ~30% at negative strength, while Base64 execution stayed basically unchanged. Disclosure stayed flat for both tasks across all strengths.

At layer 16, I steered along the probe direction with α = 2.0. On Taboo, it's not a no-op: disclosure ticks up a bit (0.00 to 0.015) and execution jumps a lot (0.60 to 0.90). That pattern is already a little sus: big execution gains with basically flat disclosure could just be "more helpful / more compliant" behavior, not a clean hit on concealment. Without controls, I can't separate mechanism effects from generic style shifts.

On Base64, there's no positive transfer: disclosure stays at 0.00 to 0.00. But the same steering also nukes Base64 execution (0.20 to 0.00), which weakens the null: if the model stops doing the task, you'd expect disclosure to stay null either way.

The honest takeaway: no reliable causal transfer showed up (ΔD_B = 0.000 at α = 2.0). But there are big caveats. Baseline behavior is already kind of limiting: both tasks start with zero measured disclosure (D_A = 0.00, D_B = 0.00), and Base64 execution is low (E_B = 0.20). That matters because transfer is only interpretable if the target task is actually getting executed: otherwise, "no disclosure change" might just mean there's nothing stable to steer, or the intervention was too weak, or I'm missing something about how concealment actually works.

Biggest gaps: I skipped controls (random/matched-norm, generic compliance/refusal directions) and I only tried one layer plus one big α. Ideally, I'd sweep small α and see a clean, monotonic disclosure effect on Taboo without breaking everything else.

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

Model-organism setups are nice because they give you ground truth: you train a model with a known internal objective, then see whether your behavioral and mechanistic tools actually recover what's driving the behavior. In "hidden-objective" organisms, the model optimizes a secret goal while denying it when asked, which makes blinded audits possible. In "secret-keeping" organisms, the model uses privileged info downstream but refuses to reveal it directly—basically a controlled elicitation failure.

LoRA makes these organisms cheap to spin up at scale: lots of objectives, lots of seeds, lots of controlled variants, and you can also do composition by merging adapters. Meanwhile, mechanistic work has been arguing that some safety-relevant behaviors have low-dimensional causal handles (directions/subspaces) you can actually intervene on, not just predict. And LoRA composition results show you can combine behaviors efficiently... but that's mostly been about capabilities, not adversarial concealment.

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

