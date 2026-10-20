#!/usr/bin/env python3
"""Run the empirical testbeds (slow) — separate from run_all.py (fast proof checks).

Separation of concerns:
  run_all.py         machine-checks the LEMMAS. Every claim is an identity that must
                     hold exactly (or to a stated tolerance). Fast. Exit != 0 on any
                     failure, because a failure means a proof in 02-lemmas.md is wrong.

  run_experiments.py runs the EMPIRICAL testbeds. These measure quantities that are
                     not identities (correlations against ground truth, Lyapunov
                     exponents). Slow. A "bad" number here is a finding about the
                     world, not a broken proof — so this runner reports and does not
                     assert on the scientific quantities. It DOES fail on crashes and
                     on the scripts' own internal self-checks.

Reports feeding from these: Q6-EXPERIMENT.md, Q12-EXPERIMENT.md.
"""

import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent

EXPERIMENTS = [
    ("q6_testbed.py",
     "Q6  cross-step join vs exact enumerated ground truth",
     "Q6-EXPERIMENT.md"),
    ("q12_nonnegativity.py",
     "Q12 LayerNorm sign structure; Lyapunov exponents of signed relevance",
     "Q12-EXPERIMENT.md"),
]

BAR = "=" * 78


def main() -> int:
    print(BAR)
    print("EMPIRICAL TESTBEDS -- diffusion-relevance-lens")
    print("  (proof checks live in run_all.py and are run separately)")
    print(BAR)

    results = []
    for script, desc, report in EXPERIMENTS:
        path = HERE / script
        if not path.exists():
            print(f"\n[SKIP] {script} not present")
            results.append((script, "MISSING", 0.0, report))
            continue

        print(f"\n{'-' * 78}\n>>> {script}\n    {desc}\n{'-' * 78}")
        t0 = time.time()
        proc = subprocess.run([sys.executable, str(path)], cwd=HERE)
        dt = time.time() - t0
        status = "OK" if proc.returncode == 0 else f"EXIT {proc.returncode}"
        results.append((script, status, dt, report))

    print(f"\n{BAR}\nSUMMARY\n{BAR}")
    print(f"{'script':<28}{'status':<12}{'time':>8}   report")
    print("-" * 78)
    for script, status, dt, report in results:
        print(f"{script:<28}{status:<12}{dt:>7.1f}s   {report}")
    print(BAR)

    print("\nInterpretation note:")
    print("  These scripts measure, they do not prove. A number moving is a finding,")
    print("  not a regression. Only crashes and the scripts' own internal self-checks")
    print("  (e.g. exact-propagation vs Monte-Carlo agreement, estimator validation")
    print("  against known Lyapunov exponents) constitute failures.")

    failed = [s for s, st, _, _ in results if st not in ("OK", "MISSING")]
    if failed:
        print(f"\nFAILED: {', '.join(failed)}")
        return 1
    print("\nOVERALL: all present experiments ran cleanly")
    return 0


if __name__ == "__main__":
    sys.exit(main())
