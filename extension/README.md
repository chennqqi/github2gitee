# Extension

Cross-browser extension (Chrome / Edge / Firefox) for **GitHub → Gitee** using Gitee official import / sync.

## Develop

```bash
npm install
npm run build
```

Outputs:

- `dist/chrome` (also usable in Edge)
- `dist/firefox`

### Load unpacked

- Chrome: `chrome://extensions` → Developer mode → Load unpacked → `dist/chrome`
- Edge: `edge://extensions` → same with `dist/chrome`
- Firefox: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `dist/firefox/manifest.json`

### Pack release zips

```bash
npm run pack
```

Creates `release/github2gitee-<version>-chrome.zip` and `...-firefox.zip` (no `.map` files).

## Usage

1. Options / Settings: set **Gitee access token** (language & poll live here only)
2. Open a GitHub repository → floating button → **Import to Gitee**
3. Finish import on Gitee → confirm in the panel (or auto-detect)
4. Later: **Sync now** (mirror API or open Gitee 同步更新)
5. Popup: mapping management only

No sync-service URL is required.
