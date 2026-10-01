# Store assets

Screenshots and paste-ready copy for Chrome Web Store / Edge Add-ons / Firefox AMO.

## Files

| File | Size | Use |
|------|------|-----|
| `shot-01-github-panel.png` | 1280×800 | Screenshot 1 — on-page import panel |
| `shot-02-settings.png` | 1280×800 | Screenshot 2 — settings / token |
| `shot-03-mappings-popup.png` | 1280×800 | Screenshot 3 — mappings popup |
| `promo-small-440x280.jpg` | **440×280** RGB JPEG | Chrome **小型宣传图块** |
| `promo-marquee-1400x560.jpg` | **1400×560** RGB JPEG | Chrome **顶部宣传图块** |
| `icon128.png` | 128×128 | Extension icon (also in package) |
| `SUBMISSION_COPY.md` | — | **Paste-ready** name, description, permission justifications |
| `gen_promo_tiles.py` | — | Regenerate the two promo JPEGs |

## How to use

1. Open [`SUBMISSION_COPY.md`](./SUBMISSION_COPY.md), replace privacy URL and support email.
2. Upload the three `shot-0*.png` files in order (captions are in that file).
3. Optionally upload promo tiles if the store asks:
   - Small: `promo-small-440x280.jpg`
   - Marquee: `promo-marquee-1400x560.jpg`
4. Follow [`../release-checklist.md`](../release-checklist.md) for the rest.

## Regenerate promo tiles

```bash
cd doc/store-assets
python gen_promo_tiles.py
```

## Regenerate screenshots

```bash
cd doc/store-assets
python -m http.server 8765
# open each shot-0N-*.html at 1280×800 and capture PNG
```

HTML sources: `shot-01-github-panel.html`, `shot-02-settings.html`, `shot-03-mappings-popup.html`.
