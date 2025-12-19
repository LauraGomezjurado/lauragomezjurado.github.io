# Image Upload Guide for Alignment Forum

Your blog post references **9 images** that need to be uploaded separately to Alignment Forum. Here's how to handle them:

## Images Referenced

1. **IMAGE_PLACEHOLDER_1**: Effect sizes for cohort differences in stylometric features (H1)
   - Original path: `/images/blog/effect_sizes.png`
   - Description: Cohen's d with 95% bootstrap confidence intervals

2. **IMAGE_PLACEHOLDER_2**: Empirical distributions of stylometric features (H1)
   - Original path: `/images/blog/feature_distributions.png`
   - Description: Distribution overlays for US and UK cohorts

3. **IMAGE_PLACEHOLDER_3**: JS similarity heatmap (H2)
   - Original path: `/images/blog/figure1_js_heatmap.png`
   - Description: Model-country alignment heatmap

4. **IMAGE_PLACEHOLDER_4**: Own-country advantage plot (H2)
   - Original path: `/images/blog/figure2_own_country_advantage.png`
   - Description: Bar chart with error bars

5. **IMAGE_PLACEHOLDER_5**: Calibration analysis (H3)
   - Original path: `/images/blog/h3_calibration_plot.png`
   - Description: Calibration curve plot

6. **IMAGE_PLACEHOLDER_6**: Classifier analysis (H3)
   - Original path: `/images/blog/classifier_analysis.png`
   - Description: Confusion matrix, ROC curve, and coefficients

7. **IMAGE_PLACEHOLDER_7**: Layerwise activation differences
   - Original path: `/images/blog/activation_differences.png`
   - Description: Activation divergence across layers

8. **IMAGE_PLACEHOLDER_8**: PCA variance structure
   - Original path: `/images/blog/sae_features.png`
   - Description: PCA explained variance plot

9. **IMAGE_PLACEHOLDER_9**: Projection-feature correlations
   - Original path: `/images/blog/projection_feature_correlations.png`
   - Description: Correlation plot

## How to Upload Images

### Method 1: During Post Creation

1. In the Alignment Forum editor, click the image icon or use `![alt text](url)`
2. Upload each image from your local `/images/blog/` directory
3. Alignment Forum will generate a URL for each image
4. Replace `IMAGE_PLACEHOLDER_X` in the markdown with the actual URLs

### Method 2: Upload First, Then Edit

1. Create a draft post
2. Upload all images first (they'll be saved to your account)
3. Copy the image URLs
4. Replace placeholders in the markdown file before pasting

### Method 3: External Hosting (Alternative)

If you prefer external hosting:
- Upload images to Imgur, GitHub, or another image host
- Replace placeholders with the hosted URLs
- Ensure images are publicly accessible

## Image Formatting in Markdown

Alignment Forum supports standard Markdown image syntax:

```markdown
![Alt text describing the image](https://alignmentforum.org/uploads/your-image.png)
```

Or with a title:

```markdown
![Alt text](https://alignmentforum.org/uploads/your-image.png "Optional title")
```

## Tips

- **Image size**: Keep images under 5MB for faster loading
- **Alt text**: Always include descriptive alt text for accessibility
- **Order**: Upload images in the order they appear in the post
- **Testing**: Use preview mode to verify all images display correctly
- **Backup**: Keep original images in case you need to re-upload

## Finding Your Images

Your original images should be located at:
```
/Users/lauragomez/Desktop/website/public/images/blog/
```

If they're not there, check:
- `src/assets/images/blog/`
- `content/images/blog/`
- Or wherever your website stores blog images

## After Uploading

Once you've uploaded all images and replaced the placeholders:

1. ✅ Verify all 9 images display correctly in preview
2. ✅ Check that image descriptions match the content
3. ✅ Ensure images are properly sized (not too large/small)
4. ✅ Test on different screen sizes if possible

Good luck with your submission!
