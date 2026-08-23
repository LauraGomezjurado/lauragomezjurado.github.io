#!/usr/bin/env python3
"""
Run every lemma verification script and print a PASS/FAIL table.
Exits nonzero if any script fails.

    python3 verify/run_all.py            # summary table
    python3 verify/run_all.py -v         # also stream each script's full output
"""

import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent

SCRIPTS = [
    ("Lemma 1  LayerNorm Jacobian / grad-input", "lemma1_layernorm.py"),
    ("Lemma 2  Bilinear double-counting",        "lemma2_bilinear.py"),
    ("Lemma 3  Softmax Jacobian",                "lemma3_softmax.py"),
    ("Lemma 4  Telescoping / error compounding", "lemma4_telescoping.py"),
    ("Lemma 6  z-rule LRP = grad-input",         "lemma6_lrp_gradinput.py"),
    ("Q6       Path conditioning / Prop 6.1-6.4", "q6_path_conditioning.py"),
    ("Q9       Renormalisation at depth L*T",     "q9_renormalisation.py"),
]

# Lemma 5 is a one-line downward induction over the conservation property (D7.1);
# it has no numerical content to check beyond L6(cons), which is verified in
# lemma6_lrp_gradinput.py.  Recorded here so the omission is explicit.
NOT_MACHINE_CHECKED = [
    ("Lemma 5", "pure induction on (D7.1); telescoping sum has no numeric content. "
                "Its concrete instance (per-layer conservation of the z-rule) IS "
                "checked as L6(cons), and its ep-rule form (L5.2) is re-derived "
                "from Lemma 9.0 in q9_renormalisation.py."),
    ("Prop 6.3", "conditioning on a realised path removes randomness, leaving a "
                 "finite composition of differentiable maps; no numeric content "
                 "beyond Lemmas 1-7, which are checked individually."),
]


def main():
    verbose = "-v" in sys.argv or "--verbose" in sys.argv
    rows = []
    all_claims = []
    overall = 0

    for title, fname in SCRIPTS:
        path = HERE / fname
        if not path.exists():
            rows.append((title, fname, "MISSING", 0.0, 0, 0))
            overall = 1
            continue
        t0 = time.time()
        proc = subprocess.run([sys.executable, str(path)],
                              capture_output=True, text=True)
        dt = time.time() - t0
        out = proc.stdout + proc.stderr
        if verbose:
            print(out)
        n_pass = out.count("[PASS]")
        n_fail = out.count("[FAIL]")
        status = "PASS" if proc.returncode == 0 else "FAIL"
        if proc.returncode != 0:
            overall = 1
        rows.append((title, fname, status, dt, n_pass, n_fail))

        for line in out.splitlines():
            s = line.strip()
            if s.startswith("[PASS]") or s.startswith("[FAIL]"):
                all_claims.append(s)
            if status == "FAIL" and s.startswith("[FAIL]"):
                pass
        if status == "FAIL" and not verbose:
            print(f"--- failing output of {fname} ---")
            for line in out.splitlines():
                if "[FAIL]" in line or "Error" in line or "Traceback" in line:
                    print("   " + line)
            print()

    width = 78
    print("=" * width)
    print("VERIFICATION SUMMARY -- diffusion-relevance-lens")
    print("   02-lemmas.md, 03-q6-path-conditioning.md, "
          "05-q9-conservation-at-depth.md")
    print("=" * width)
    print(f"{'script':<30} {'lemma':<42} {'status':>6}")
    print("-" * width)
    for title, fname, status, dt, np_, nf in rows:
        print(f"{fname:<30} {title:<42} {status:>6}")
    print("-" * width)
    print(f"{'':<30} {'checks':<42}")
    for title, fname, status, dt, np_, nf in rows:
        print(f"{fname:<30} {str(np_) + ' passed, ' + str(nf) + ' failed':<42} "
              f"{dt:>5.1f}s")
    print("-" * width)
    tot_p = sum(r[4] for r in rows)
    tot_f = sum(r[5] for r in rows)
    print(f"TOTAL: {tot_p} individual claim checks passed, {tot_f} failed")
    print()
    print("Not machine-checked (by design):")
    for name, why in NOT_MACHINE_CHECKED:
        print(f"  {name}: {why}")
    print()
    print("=" * width)
    print(f"OVERALL: {'PASS' if overall == 0 else 'FAIL'}")
    print("=" * width)
    return overall


if __name__ == "__main__":
    raise SystemExit(main())
