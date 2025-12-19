import json
import os
import matplotlib
import matplotlib.pyplot as plt

# Avoid matplotlib trying to write to ~/.matplotlib
os.environ.setdefault('MPLCONFIGDIR', '/tmp/matplotlib')

ROOT_WEBSITE = '/Users/lauragomez/Desktop/website'
OUT_DIR = os.path.join(ROOT_WEBSITE, 'public', 'images', 'blog')
os.makedirs(OUT_DIR, exist_ok=True)

INTERP_JSON = '/Users/lauragomez/Desktop/subliminal_learning_rlhf/results/interpretability/interpretability_results.json'
CORR_JSON = '/Users/lauragomez/Desktop/subliminal_learning_rlhf/results/interpretability_pubsolid/projection_feature_correlations.json'

with open(INTERP_JSON, 'r') as f:
    interp = json.load(f)

with open(CORR_JSON, 'r') as f:
    corr = json.load(f)

# -------- Plot 1: activation differences --------
act = interp['activation_differences']
layers = sorted([int(k) for k in act.keys()])
cos = [act[str(L)]['cosine_similarity'] for L in layers]
l2 = [act[str(L)]['l2_norm'] for L in layers]

fig, ax = plt.subplots(1, 2, figsize=(10, 3.2), dpi=200)
ax[0].plot(layers, cos, marker='o', linewidth=2)
ax[0].set_title('Layerwise cosine similarity')
ax[0].set_xlabel('Layer')
ax[0].set_ylabel('Cosine similarity')
ax[0].set_ylim(min(cos) - 0.01, 1.0005)
ax[0].grid(True, alpha=0.3)

ax[1].plot(layers, l2, marker='o', linewidth=2, color='#b45309')
ax[1].set_title('L2 norm of mean difference')
ax[1].set_xlabel('Layer')
ax[1].set_ylabel('L2 norm')
ax[1].grid(True, alpha=0.3)

fig.suptitle('US vs UK internal divergence (mean activations)', y=1.05, fontsize=12)
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, 'activation_differences.png'), bbox_inches='tight')
plt.close(fig)

# -------- Plot 2: "SAE" (PCA proxy) explained variance --------
sae = interp.get('sae', {})
ev_us = sae.get('explained_variance_us', [])[:4]
ev_uk = sae.get('explained_variance_uk', [])[:4]

fig, ax = plt.subplots(figsize=(7.5, 3.2), dpi=200)
xs = list(range(1, 5))
width = 0.38
ax.bar([x - width/2 for x in xs], ev_us, width=width, label='US', color='#2563eb')
ax.bar([x + width/2 for x in xs], ev_uk, width=width, label='UK', color='#b45309')
ax.set_xticks(xs)
ax.set_xlabel('Component')
ax.set_ylabel('Explained variance')
ax.set_title('Layer 18 explained variance (PCA proxy)')
ax.grid(True, axis='y', alpha=0.3)
ax.legend(frameon=False)
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, 'sae_features.png'), bbox_inches='tight')
plt.close(fig)

# -------- Plot 3: projection ↔ stylometry correlations (Pearson) --------
correlations = corr['correlations']
items = []
for feat, stats in correlations.items():
    items.append((feat, stats['pearson_r'], stats['pearson_p']))
items.sort(key=lambda t: abs(t[1]), reverse=True)

feats = [t[0] for t in items]
rs = [t[1] for t in items]
ps = [t[2] for t in items]

fig, ax = plt.subplots(figsize=(10, 3.8), dpi=200)
colors = ['#2563eb' if r >= 0 else '#b45309' for r in rs]
ax.bar(range(len(feats)), rs, color=colors)
ax.axhline(0, color='black', linewidth=1)
ax.set_xticks(range(len(feats)))
ax.set_xticklabels(feats, rotation=35, ha='right')
ax.set_ylabel("Pearson r")
ax.set_title('Projection onto Δ (layer 18) ↔ stylometry (n=300)')
ax.grid(True, axis='y', alpha=0.3)

# annotate p-values lightly for the top 5
for i, (r, p) in enumerate(zip(rs[:5], ps[:5])):
    ax.text(i, r + (0.02 if r >= 0 else -0.04), f"p={p:.1e}", ha='center', va='bottom' if r >= 0 else 'top', fontsize=8)

fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, 'projection_feature_correlations.png'), bbox_inches='tight')
plt.close(fig)

print('Wrote:')
print(' -', os.path.join(OUT_DIR, 'activation_differences.png'))
print(' -', os.path.join(OUT_DIR, 'sae_features.png'))
print(' -', os.path.join(OUT_DIR, 'projection_feature_correlations.png'))
