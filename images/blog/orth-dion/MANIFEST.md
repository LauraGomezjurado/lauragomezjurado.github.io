# Asset manifest — Orth-Dion blog post

All images here are PNG conversions (200 dpi via `pdftoppm`) of figures from the paper
source tree at `~/Downloads/NeurIPS2026_AdaDion (1)/`.  Files are referenced in
`src/components/OrthDionPost.jsx` with paths of the form
`/images/blog/orth-dion/<name>.png`.

| Blog filename              | Source PDF (in paper repo)                                      | Used in                                  |
|----------------------------|------------------------------------------------------------------|------------------------------------------|
| `figure1_val_loss.png`     | `NeurIPS_Format/figs/intro/figure1_val_loss.pdf`                | §1 hero / opening result                  |
| `geometry_norms.png`       | `NeurIPS_Format/figs/intro/geometry_sgd_signsgd_muon.pdf`       | §2 unit-ball schematic                    |
| `nu_scaling.png`           | `NeurIPS_Format/figs/llm/fig3_left_llama_nu_scaling_blue.pdf`   | §6 layer-mean ν̄ₜ time-course             |
| `nu_hist.png`              | `NeurIPS_Format/figs/llm/fig3_right_nu_t_hist_blue.pdf`         | §6 per-update νₜ distribution             |
| `val_loss_curves.png`      | `NeurIPS_Format/figs/llm/val_loss.pdf`                          | §8 LLaMA 320M val-loss curves             |
| `speedup_bars.png`         | `NeurIPS_Format/figs/llm/bars.pdf`                              | §8 wall-clock-to-match-Dion bars          |
| `wallclock_large.png`      | `NeurIPS_Format/figs/intro/wallclock_large.pdf`                 | §8 17.1B per-step time                    |
| `avg_rank.png`             | `NeurIPS_Format/figs/llm/avg_rank.pdf`                          | (kept; not currently referenced)          |

No images were edited beyond the rasterization step.  The hero figure in the
post header (Ky Fan dual-ball schematic) is rendered inline as JSX in
`BlogPost.jsx :: OrthDionHeroFigure`, not as a PNG.
