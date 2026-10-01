# Store submission copy (paste-ready)

Use English fields by default for Chrome Web Store / Edge / AMO. Chinese variants are included for locales that accept them.

Privacy policy URL placeholder: `https://github.com/chennqqi/github2gitee/blob/main/doc/privacy-policy.md`  
Support email placeholder: `chennqqi@gmail.com`

---

## 1. Listing name

**English**
```
GitHub to Gitee
```

**中文**
```
GitHub → Gitee
```

---

## 2. Short description (≤132 chars recommended)

**English**
```
Import GitHub repos to Gitee from the repo page and manage sync via Gitee’s official import/sync flows.
```

**中文**
```
在 GitHub 仓库页一键导入到 Gitee，并管理后续同步（依托 Gitee 官方导入/同步能力）。
```

---

## 3. Detailed description

### English (paste)

```
GitHub to Gitee is a lightweight browser extension that helps you back up GitHub repositories to your own Gitee account.

What it does
• Shows a discreet control on GitHub repository pages to start Gitee’s “import from URL” flow
• Keeps a local mapping list so you can sync later, open the Gitee repo, or register an existing import
• Optionally checks on an interval whether GitHub has new commits

What it does not do
• It does not run git clone/push inside the browser
• It does not host a sync backend — Gitee performs the actual transfer/mirror
• Private repos, LFS, and very large repositories are best-effort only

Important
• You need a Gitee personal access token (stored only in local extension storage)
• Gitee “同步更新 / force sync” may overwrite the target repository — prefer Gitee as a backup mirror

Permissions (why we ask)
• storage — save tokens, mappings, and settings locally
• alarms — periodic update checks
• tabs — open Gitee import/repo pages
• github.com / api.github.com / gitee.com — detect pages and call required APIs

Privacy policy: https://github.com/chennqqi/github2gitee/blob/main/doc/privacy-policy.md
Support: chennqqi@gmail.com
```

### 中文（粘贴）

```
GitHub → Gitee 是一款轻量浏览器扩展，帮助你把 GitHub 仓库备份到自己的 Gitee 账号。

功能
• 在 GitHub 仓库页提供低调入口，发起 Gitee「从 URL 导入」
• 本地维护映射列表：同步、打开 Gitee 仓、登记已有导入
• 可按间隔检查 GitHub 是否有更新

非目标
• 不在浏览器内执行 git clone/push
• 不自建同步后端；真正搬代码的是 Gitee 官方导入/镜像/同步更新
• 私有仓、LFS、超大仓不保证成功

请注意
• 需要 Gitee 私人令牌（仅保存在本机扩展存储）
• Gitee「同步更新」可能强制覆盖目标仓，建议把 Gitee 仓当作备份用途

权限说明
• storage：本地保存 Token、映射与设置
• alarms：定时检查更新
• tabs：打开 Gitee 相关页面
• github.com / api.github.com / gitee.com：识别页面并调用必要 API

隐私政策：https://YOUR_PUBLIC_HOST/privacy-policy
支持邮箱：support@example.com
```

---

## 4. Single purpose (review form)

```
This extension’s sole purpose is to help users import and sync GitHub repositories to their own Gitee account using Gitee’s official capabilities.
```

---

## 5. Permission justifications (review form)

```
storage: Store Gitee/GitHub tokens, locale, poll interval, and repository mappings in extension local storage only.

alarms: Periodically check whether mapped GitHub repositories have new commits.

tabs: Open Gitee import and repository pages so the user can confirm import or click 同步更新.

https://github.com/*: Detect the current repository page and show the on-page action panel.

https://api.github.com/*: Read public (or authorized) repository metadata such as default-branch SHA.

https://gitee.com/*: Assist the import page, open sync UI, and call Gitee APIs with the user-provided token.
```

---

## 6. Screenshot captions (upload order)

| File | Caption (EN) | 说明（中文） |
|------|--------------|-------------|
| `shot-01-github-panel.png` | Import to Gitee from a GitHub repository page | GitHub 页右下角面板：一键导入 |
| `shot-02-settings.png` | Settings: language and Gitee token (stored locally) | 设置页：语言与 Token（仅本地） |
| `shot-03-mappings-popup.png` | Popup: manage repository mappings and sync | 扩展弹窗：映射管理与同步 |

Suggested Chrome size: **1280 × 800** PNG.

### Promo tiles (Chrome Web Store)

| File | Spec | Field |
|------|------|-------|
| `promo-small-440x280.jpg` | 440×280 JPEG RGB (no alpha) | 小型宣传图块 |
| `promo-marquee-1400x560.jpg` | 1400×560 JPEG RGB (no alpha) | 顶部宣传图块 |

Regenerate with `python doc/store-assets/gen_promo_tiles.py`.

---

## 7. Category / tags

- Category: Developer Tools  
- Tags: github, gitee, sync, backup, mirror, import
