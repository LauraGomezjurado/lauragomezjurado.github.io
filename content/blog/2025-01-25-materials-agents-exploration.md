---
title: "Building Agents That Do Materials Science"
date: "2025-01-25"
excerpt: "What if you could just tell an AI agent what material you want, and it figures out how to simulate it, analyze it, and optimize it? I'm exploring whether LLM-based agents can orchestrate real materials discovery workflows."
---

What if you could just tell an AI agent "find me a better battery material" and it actually figures out how to do it? Not just suggest some papers or write some code, but actually plan the simulations, run them, check if they converged, compare results, decide what to try next, and iterate until it finds something useful.

That's the question I've been exploring with a project I'm calling [materials_agents](https://github.com/LauraGomezjurado/materials_agents). It's a proof of concept system where LLM-based agents orchestrate real materials science workflows. The idea is simple: instead of manually chaining together structure generation, simulation setup, convergence monitoring, and optimization steps, what if an agent could handle all of that?

## The Problem With Materials Discovery

Materials discovery workflows are messy. You start with a goal like "find a stable crystal structure" or "optimize this material's band gap." Then you need to:

1. Generate candidate structures (maybe FCC, maybe BCC, maybe something more exotic)
2. Set up simulations (DFT calculations, molecular dynamics, whatever)
3. Monitor convergence (did the energy actually converge? Is the structure stable?)
4. Compare results (which structure is most stable? What properties does it have?)
5. Decide what to try next (should we explore this parameter space? Try a different structure?)
6. Iterate until you have an answer

Each step can be automated individually, but stringing them together into a coherent campaign? That's still expert-intensive and brittle. One failed calculation, one convergence issue, one weird result, and the whole workflow breaks down.

The vision is an agent that can handle all of this end to end. You give it a natural language goal, and it figures out the rest.

## What I Built

The system has a few key pieces:

**A planner agent** that uses Claude to understand natural language goals and generate multi-step workflows. Tell it "find the most stable semiconductor structure" and it breaks that down into concrete steps: generate silicon in diamond lattice, generate germanium in diamond lattice, calculate formation energies, compare results, etc.

**Specialized agents** for different tasks:
- A structure agent that can generate 30 or more different crystal structures (FCC, BCC, diamond, rocksalt, zincblende, perovskite, surfaces, supercells)
- A simulation agent that runs energy calculations using ML potentials (M3GNet, CHGNet) or fallback to simpler methods (EMT, Morse)
- An analysis agent that extracts properties, checks convergence, compares results
- A Bayesian optimizer that uses Gaussian Process surrogates to intelligently explore parameter spaces
- A property predictor that estimates band gaps, bulk moduli, formation energies

The planner coordinates all of these. It's like having a research assistant that actually understands what you're trying to do and can execute the plan.

## Why This Is Interesting

There's a lot of work on AI agents for science, but most of it is either:
- Very narrow (one specific task, one specific workflow)
- Very abstract (proofs of concept that don't actually run real simulations)
- Very brittle (works great until something unexpected happens)

This project tries to bridge that gap. It's modular enough that you can swap in different backends (start with ML potentials, upgrade to real DFT later). It's robust enough to handle common failure modes (convergence issues, missing data, weird results). And it's flexible enough to handle different types of goals (optimization, comparison, exploration).

The key insight is that materials workflows have a natural hierarchical structure. You have high-level goals (find stable structure), mid-level tasks (generate structures, run simulations), and low-level operations (calculate energy, extract properties). An LLM planner is actually pretty good at reasoning about this hierarchy, especially when you give it specialized tools for each level.

## What Actually Works

The system can handle a surprising range of tasks:

**Lattice constant optimization**: The Bayesian optimizer can suggest the next parameter to try based on uncertainty, using acquisition functions like expected improvement or upper confidence bound. It's not just random search, it's actually reasoning about where to explore next.

**Property prediction**: The property predictor can estimate band gaps, bulk moduli, and formation energies from crystal structures. It uses learned representations (crystal features) rather than just heuristics.

**Comparative analysis**: Give it multiple materials and it can compare their properties, check which is most stable, identify trends. The analysis agent extracts the relevant properties and the planner interprets what they mean.

**Natural language planning**: This is where it gets interesting. You can say things like "find optimal catalyst for CO2 reduction" and the planner will generate a multi-step workflow. It's not perfect, but it's way better than manually scripting everything.

## What Doesn't Work (Yet)

This is still a proof of concept. For real materials discovery, you'd need:

**Real DFT backends**: Right now it uses ML potentials (M3GNet, CHGNet) which are fast but not as accurate as full DFT. For production, you'd want to integrate with VASP, Quantum ESPRESSO, or similar.

**HPC integration**: Materials simulations run on clusters. You'd need to integrate with schedulers like Slurm or PBS, handle job submission, monitor queue status, etc.

**Persistent storage**: Right now everything is in-memory. You'd want a database to track calculation history, cache results, enable resumable workflows.

**Better error recovery**: When a calculation fails, the agent should be able to diagnose why (convergence issue? Memory problem? Invalid structure?) and try alternatives.

**Larger material databases**: 30 or more materials is a good start, but real discovery needs access to Materials Project, OQMD, or similar databases.

## The Bigger Picture

This connects to a broader vision of agentic science. The idea is that as LLMs get better at reasoning and planning, and as scientific tools get better APIs, we can build systems that actually do science autonomously. Not just assist scientists, but actually run experiments, analyze results, form hypotheses, test them.

Materials science is a good testbed because:
- The workflows are well-defined (structure → simulation → analysis → decision)
- The tools are mature (DFT codes, structure databases, property predictors)
- The problems are important (batteries, catalysts, semiconductors)
- The failure modes are manageable (convergence issues are common but solvable)

But the same principles could apply to other domains. Drug discovery, protein design, climate modeling, whatever. The key is having agents that can reason about scientific workflows, not just execute fixed scripts.

## What I Learned

Building this made me realize how much of materials science is actually workflow orchestration. The hard part isn't running a single DFT calculation (that's well-automated). The hard part is deciding which calculations to run, in what order, how to interpret the results, what to try next.

LLMs are surprisingly good at this kind of reasoning. They can understand natural language goals, break them down into steps, handle edge cases, interpret results. The challenge is giving them the right tools and making sure they use them correctly.

The modular architecture helps a lot. Each agent has a clear interface, so you can swap implementations without breaking the whole system. Start with ML potentials, upgrade to DFT later. Start with simple structure generation, add more sophisticated methods later.

The evaluation framework is also crucial. You need to be able to test whether the agent is actually doing the right thing, not just generating plausible-looking outputs. I built evaluation metrics (MAE, RMSE, R²) and benchmark datasets to check this.

## Where This Could Go

The obvious next steps are:
- Integrate real DFT backends (VASP, QE)
- Add HPC job scheduling
- Expand the material database
- Add more sophisticated optimization methods
- Test on real discovery problems (not just proof of concept)

But the more interesting direction is making the agents more autonomous. Right now the planner generates a plan and executes it. What if it could also:
- Detect when results are unexpected and replan?
- Learn from past workflows to improve future ones?
- Collaborate with other agents (or human scientists)?
- Explain its reasoning in ways that humans can verify?

The vision is agents that don't just execute workflows, but actually understand what they're doing and why. That's still far off, but this project is a step in that direction.

## Try It Yourself

The code is on [GitHub](https://github.com/LauraGomezjurado/materials_agents). It's set up to run with minimal dependencies (Python 3.9 or later, pymatgen, ASE, anthropic). You can try the full demo with:

```bash
python examples/demo_agentic_workflow.py
```

This runs through a complete workflow: planning, structure generation, simulation, analysis, optimization, result interpretation. It's not production-ready, but it's a working proof of concept.

The system is designed to be extensible. Want to add a new structure type? Add it to the structure agent. Want to use a different optimizer? Swap in a different implementation. Want to add new properties? Extend the property predictor.

## Final Thoughts

This is still early work. The system works for proof of concept tasks, but real materials discovery is harder. Still, I think the approach is promising. LLM-based agents can reason about scientific workflows in ways that traditional automation can't. They can handle natural language goals, adapt to unexpected situations, interpret results.

The key is making sure they're actually doing science, not just generating plausible-looking outputs. That requires good evaluation, clear interfaces, robust error handling. But if we get that right, I think agentic science could be transformative.

Not because it replaces scientists, but because it lets scientists focus on the interesting parts: forming hypotheses, interpreting results, making connections. The agent handles the workflow orchestration, the scientist handles the science.

That's the vision anyway. We'll see how far we can take it.

