# 商店文案草稿（Store Listing）

上架时按各商店字数限制微调。中英各备一份。

---

## 短名称 / Short name

- 中文：GitHub → Gitee  
- English: GitHub to Gitee

## 一句话简介 / Summary

- 中文：在 GitHub 仓库页一键导入到 Gitee，并管理后续同步（依托 Gitee 官方能力）。  
- English: Import GitHub repos to Gitee from the repo page and manage sync via Gitee’s official flows.

## 详细描述 / Description

### 中文

GitHub → Gitee 是一款轻量浏览器扩展，帮你把 GitHub 上的仓库备份/同步到 Gitee。

**它做什么**
- 在 GitHub 仓库页提供低调入口，发起「导入到 Gitee」
- 管理已导入仓库的映射列表，支持手动同步 / 打开 Gitee「同步更新」
- 可选定时检查 GitHub 是否有更新

**它不做什么**
- 不在本地执行 git clone/push
- 不自建同步服务器；真正搬代码的是 **Gitee 官方导入 / 镜像 / 同步更新**
- 不保证私有仓、LFS、超大仓或 Gitee 侧超时一定成功

**使用前请知悉**
- 需要你自己的 Gitee Access Token（仅保存在本机扩展存储）
- Gitee「同步更新」可能强制覆盖目标仓库，请把 Gitee 仓当作备份用途时务必小心

**权限说明（简述）**
- 存储：保存 Token 与映射
- 定时器：检查更新
- 标签页：打开 Gitee 相关页面
- 访问 github.com / gitee.com：识别页面并调用必要 API

隐私政策：[请替换为公网 URL]

### English

GitHub to Gitee is a lightweight browser extension that helps you back up GitHub repositories to Gitee.

**What it does**
- Start Gitee’s “import from URL” flow from a GitHub repository page
- Keep a local mapping list and trigger sync (mirror API when available, otherwise open Gitee’s sync UI)
- Optionally poll for GitHub updates

**What it does not do**
- It does not run git locally
- It does not host a sync backend; Gitee performs the actual transfer
- Private repos, LFS, and very large repos are best-effort only

**Before you use it**
- A Gitee personal access token is required (stored only in local extension storage)
- Gitee “force sync” may overwrite the target repository—prefer Gitee as a backup mirror

Privacy policy: [replace with public HTTPS URL]

---

## 权限 Justification（审核备注用，英文更通用）

| Permission / Host | Justification |
|-------------------|---------------|
| `storage` | Store Gitee/GitHub tokens, locale, poll interval, and repo mappings locally. |
| `alarms` | Periodically check whether mapped GitHub repos have new commits. |
| `tabs` | Open Gitee import/repo pages for user-confirmed import and sync. |
| `https://github.com/*` | Detect current repository and show the on-page action panel. |
| `https://api.github.com/*` | Read public (or authorized) repository metadata / default branch SHA. |
| `https://gitee.com/*` | Assist import page, open sync UI, and call Gitee APIs with the user token. |

Single purpose statement:

> This extension’s sole purpose is to help users import and sync GitHub repositories to their own Gitee account using Gitee’s official capabilities.

---

## 分类建议

- Developer Tools / Productivity / Workflow

## 宣传图文案（可选叠字）

- 「GitHub → Gitee」  
- 「官方导入 · 本地编排」  
- 「Token 仅存本机」
