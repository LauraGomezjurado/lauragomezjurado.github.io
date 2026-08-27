"""
Pull the LLaMA 320M validation-loss curves for the Orth-Dion post from W&B.

Unlike the latent-thought figures, these numbers are not on disk anywhere: the
paper tree in ~/Downloads holds only the rendered PDFs, and the sandbox repo has
no run logs. The source of truth is the `neurips_v4` project, whose eight
`replication/*` runs are the eight curves in figs/llm/val_loss.pdf.

Needs a key in the environment; nothing is written to the repo but the curves:

  export WANDB_API_KEY=...        # rotate this if it has been pasted anywhere
  python3 scripts/paint/data/extract_orth_dion_val_loss.py
"""

import json
import os
import sys

try:
    import wandb
except ImportError:
    sys.exit(
        "wandb not importable. Use a venv that has it, e.g.\n"
        "  ~/Desktop/latent_thought_monitorability/.venv/bin/python "
        + os.path.relpath(__file__)
    )

KEY = os.environ.get("WANDB_API_KEY")
if not KEY:
    sys.exit("set WANDB_API_KEY first (and rotate it afterwards if it was pasted into a chat)")

ENTITY = "llm_jp_pp"
PROJECT = "neurips_v4"
METRIC = "validation_metrics/loss"
OUT = os.path.join(os.path.dirname(__file__), "orth-dion-val-loss.json")

# run name -> (label, colour family, line style). The families mirror the paper:
# each optimizer keeps one colour, rank fractions vary the stroke.
WANTED = {
    "replication/dion": ("Dion, rf 0.5", "dion", "solid"),
    "replication/dion_rf0p25": ("Dion, rf 0.25", "dion", "dashed"),
    "replication/dion_rf0p125": ("Dion, rf 0.125", "dion", "dotted"),
    "replication/orth_dion": ("Orth-Dion, rf 0.5", "orth", "solid"),
    "replication/orth_dion_rf0p25": ("Orth-Dion, rf 0.25", "orth", "dashed"),
    "replication/orth_dion_rf0p125": ("Orth-Dion, rf 0.125", "orth", "dotted"),
    "replication/muon": ("Muon", "muon", "solid"),
    "replication/adadion_block": ("AdaDion block", "adadion", "solid"),
}

api = wandb.Api(api_key=KEY, timeout=90)
runs = {r.name: r for r in api.runs(f"{ENTITY}/{PROJECT}")}

series = []
for name, (label, family, style) in WANTED.items():
    run = runs.get(name)
    if run is None:
        print(f"  ! missing run {name}", file=sys.stderr)
        continue
    hist = run.history(keys=[METRIC], pandas=True)
    pts = [
        {"x": int(row["_step"]), "y": round(float(row[METRIC]), 5)}
        for _, row in hist.iterrows()
        if row[METRIC] == row[METRIC]  # drop NaN
    ]
    series.append({"key": name.split("/")[-1], "label": label, "family": family, "style": style, "points": pts})
    print(f"  {label:<22} {len(pts):>4} pts   final {pts[-1]['y']:.4f}")

figure = {
    "title": "LLaMA 320M  ·  validation loss",
    "x": {"label": "step", "min": 0, "max": 6100},
    # The run starts near loss 12; the published figure crops to the tail where
    # the optimizers actually separate.
    "y": {"label": "validation loss", "min": 3.2, "max": 4.0},
    "series": series,
    "source": f"wandb://{ENTITY}/{PROJECT} ({METRIC})",
}

with open(OUT, "w") as f:
    json.dump(figure, f, indent=2)
print(f"wrote {OUT}")
