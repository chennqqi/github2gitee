# github2gitee

Browser extension (Chrome / Edge / Firefox) that helps you **import and sync GitHub repositories to Gitee** using **Gitee’s official import / sync features**.

The extension is an **orchestrator** only. Gitee’s servers perform the actual repository transfer. No self-hosted sync backend is required.

## Install (sideload)

```bash
cd extension
npm install
npm run build
```

Load unpacked:

- Chrome / Edge: `extension/dist/chrome`
- Firefox (temporary): `about:debugging` → Load Temporary Add-on → `extension/dist/firefox/manifest.json`

Then open **Settings**, paste a Gitee access token, and use the floating control on a GitHub repository page.

### Release zip (for testers / store upload)

```bash
cd extension
npm run pack
```

Zips are written to `extension/release/` (`*-chrome.zip`, `*-firefox.zip`). Source maps are excluded.

## Usage

1. Settings: set **Gitee access token** (and optional language / poll interval)
2. Open a GitHub repository → expand the floating button → **Import to Gitee**
3. Finish import on Gitee → confirm in the panel / popup (or wait for detection)
4. Later: **Sync now** (tries mirror pull, otherwise opens Gitee 同步更新)
5. Extension popup: manage mappings; Settings page: tokens & language only

## Docs

| Doc | Path |
|-----|------|
| PRD | [`doc/prd-github2gitee-extension.md`](./doc/prd-github2gitee-extension.md) |
| Release checklist | [`doc/release-checklist.md`](./doc/release-checklist.md) |
| Store listing draft | [`doc/store-listing.md`](./doc/store-listing.md) |
| Store screenshots & paste copy | [`doc/store-assets/`](./doc/store-assets/) |
| Privacy policy | [`doc/privacy-policy.md`](./doc/privacy-policy.md) |
| Design | [`doc/design-github2gitee-extension.md`](./doc/design-github2gitee-extension.md) |

## Components

| Path | Role |
|------|------|
| `extension/` | Browser extension (the deliverable) |
| `doc/` | Requirements, design, release materials |

## Product decisions

- Prefer Gitee official **import** + **同步更新** / Pull mirror
- Pure extension only
- Public repos for MVP; Chrome / Edge / Firefox
- Sideload first; official store listing is a separate checklist item

## License

[MIT](./LICENSE)
