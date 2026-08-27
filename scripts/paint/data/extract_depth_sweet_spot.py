"""
Pull the v3_medium depth sweep out of the latent_thought_monitorability run
outputs and into a small JSON the p5.brush figure can be driven from.

The website only ever held the rendered matplotlib PNG, so the numbers lived in
the other repo. Keeping this extractor next to the sketch means the drawing is
regenerable from source rather than traced off an image.

  python3 scripts/paint/data/extract_depth_sweet_spot.py
"""

import json
import os

SRC = os.path.expanduser(
    "~/Desktop/latent_thought_monitorability/outputs/followups/16_v3m_depth_targets.json"
)
OUT = os.path.join(os.path.dirname(__file__), "depth-sweet-spot.json")

MODEL = "codi_v3m_k6"
DEPTHS = ["s1_high", "s2_high", "s3_high"]
SERIES = [
    ("prompt_only", "prompt only"),
    ("cot_only", "cot only"),
    ("answer_only", "answer only"),
]

rows = json.load(open(SRC))["rows"]


def cell(scope, target):
    for r in rows:
        if r["model"] == MODEL and r["scope"] == scope and r["target"] == target:
            return r
    raise KeyError(f"{scope}/{target} missing from {SRC}")


figure = {
    "title": "v3_medium  CODI fine-tune",
    "x": {"label": "target depth", "ticks": ["s1 (depth 1)", "s2 (depth 2)", "s3 (depth 3)"]},
    "y": {"label": "val AUC (95% CI)", "min": 0.2, "max": 0.8, "chance": 0.5},
    "series": [
        {
            "key": scope,
            "label": label,
            "points": [
                {
                    "x": i,
                    "y": cell(scope, t)["val_auc"],
                    "lo": cell(scope, t)["val_auc_lo"],
                    "hi": cell(scope, t)["val_auc_hi"],
                }
                for i, t in enumerate(DEPTHS)
            ],
        }
        for scope, label in SERIES
    ],
    "source": os.path.relpath(SRC, os.path.expanduser("~")),
}

with open(OUT, "w") as f:
    json.dump(figure, f, indent=2)

print(f"wrote {OUT}")
for s in figure["series"]:
    pts = ", ".join(f"{p['y']:.3f} [{p['lo']:.3f},{p['hi']:.3f}]" for p in s["points"])
    print(f"  {s['label']:<12} {pts}")
