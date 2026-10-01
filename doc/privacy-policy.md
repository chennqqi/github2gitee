# Privacy Policy / 隐私政策

**Product**: GitHub → Gitee (browser extension)  
**Effective date**: 2026-10-01  
**Applies to**: version 0.4.x and later store releases (see the listing page)

This document explains how the extension handles data. Before submitting to browser stores, host this page at a **public HTTPS URL** and paste that URL into the store console.

The **English** text below is the default / authoritative version. A Chinese translation follows for convenience.

---

## English (default)

### 1. What we collect

This extension **does not operate its own backend by default**, and does **not** upload your tokens or repository contents to a developer-operated server.

Data that may be involved:

| Data | Where stored | Purpose |
|------|--------------|---------|
| Gitee access token (required) | Browser extension local storage (`storage.local`) | Call Gitee APIs (validate account, detect repos, attempt mirror sync, etc.) |
| GitHub token (optional) | Same | Call GitHub APIs (private repos or higher rate limits; usually unnecessary for public repos) |
| Repository mappings (GitHub ↔ Gitee) | Same | Remember imported/registered repos and sync status |
| Locale preference, poll interval, and other settings | Same | UI language and polling configuration |
| Current GitHub / Gitee page context | Processed locally only while you are on those pages | Show the panel, prefill import URLs, and assist sync navigation |

### 2. How data is used and transmitted

- From your browser, the extension sends necessary requests to **GitHub** (`github.com` / `api.github.com`) and **Gitee** (`gitee.com`) to orchestrate import, check status, and trigger sync.
- **Actual repository transfer / mirroring is performed by Gitee’s official services**, and is subject to Gitee’s own terms and privacy policy.
- The developer does **not** collect analytics SDKs, advertising identifiers, or unrelated browsing history through this extension.

### 3. Permissions

| Permission / host access | Reason |
|--------------------------|--------|
| `storage` | Store tokens, mappings, and settings locally |
| `alarms` | Periodically check whether mapped repos have updates |
| `tabs` | Open Gitee import / repository pages |
| `https://github.com/*` | Detect repository pages and inject the action panel |
| `https://api.github.com/*` | Read public (or authorized) repository metadata |
| `https://gitee.com/*` | Assist import pages, open sync UI, and call Gitee APIs |

### 4. Retention and deletion

- Data remains in **your browser profile**. Uninstalling the extension or clearing extension data deletes it.
- You may clear tokens in Settings. Mappings can be removed one by one in the extension popup (this does **not** delete remote repositories on Gitee).

### 5. Third-party services

Using this extension involves interacting with GitHub and Gitee. Please also review their privacy policies and terms of service. Changes to those products may affect import/sync behavior.

### 6. Children and sensitive data

This product is intended as a developer tool. It is not directed at children and does not intentionally collect special-category sensitive personal data.

### 7. Contact

For privacy questions, open an issue on the project repository, or email the support address listed on the store page:

- Repository: https://github.com/chennqqi/github2gitee  
- Support email: _replace with a real address before store submission_

### 8. Changes

When this policy is updated, this document and the effective date will be revised. Material changes should also be noted in the extension’s update notes where practical.

---

## 中文

**说明**：以下为中文译本；如与英文表述不一致，**以英文版为准**。

### 1. 我们收集什么

本扩展**默认不运营自有后端**，也不会把你的令牌或仓库内容上传到开发者服务器。

可能涉及的数据仅包括：

| 数据 | 存放位置 | 用途 |
|------|----------|------|
| Gitee Access Token（必填） | 浏览器扩展本地存储（`storage.local`） | 调用 Gitee API（校验账号、探测仓库、尝试镜像同步等） |
| GitHub Token（可选） | 同上 | 访问 GitHub API（例如私有仓或提高限额；公开仓通常可不填） |
| 仓库映射列表（GitHub ↔ Gitee） | 同上 | 记住已导入/已登记的仓库与同步状态 |
| 语言偏好、检查间隔等设置 | 同上 | 界面语言与轮询配置 |
| 当前浏览的 GitHub / Gitee 页面上下文 | 仅在你打开相关页面时于本地处理 | 显示面板、预填导入地址、辅助同步跳转 |

### 2. 数据如何使用与传输

- 扩展会在你的浏览器内，向 **GitHub**（`github.com` / `api.github.com`）与 **Gitee**（`gitee.com`）发送必要的网络请求，以完成导入编排、状态检查与同步触发。
- **实际仓库搬运/镜像由 Gitee 官方服务完成**，并受 Gitee 自身条款与隐私政策约束。
- 开发者**不**通过本扩展收集分析 SDK、广告标识或无关浏览历史。

### 3. 权限说明

| 权限 / 主机访问 | 原因 |
|-----------------|------|
| `storage` | 本地保存 Token、映射与设置 |
| `alarms` | 按间隔检查仓库是否有更新 |
| `tabs` | 打开 Gitee 导入页 / 仓库页等 |
| `https://github.com/*` | 识别仓库页并注入操作面板 |
| `https://api.github.com/*` | 读取公开（或授权）仓库元数据 |
| `https://gitee.com/*` | 导入页辅助、同步跳转、Gitee API |

### 4. 数据保留与删除

- 数据保存在**你的浏览器配置文件**中。卸载扩展或清除扩展数据即可删除。
- 你也可在设置中清空 Token；映射可在扩展弹窗中逐条移除（**不会**删除 Gitee 上的远程仓库）。

### 5. 第三方服务

使用本扩展即会与 GitHub、Gitee 交互，请同时阅读其隐私政策与服务条款。官方产品变更可能导致导入/同步行为变化。

### 6. 儿童与敏感场景

本产品面向开发者工具场景，不面向儿童设计，不主动收集特殊类别敏感个人信息。

### 7. 联系方式

如有隐私相关问题，请通过项目仓库 Issue，或商店页预留的支持邮箱联系维护者：

- 仓库：https://github.com/chennqqi/github2gitee  
- 支持邮箱：_*上架前请替换为真实邮箱*_

### 8. 变更

隐私政策更新时，将同步修改本文档与生效日期；重大变更建议在扩展更新说明中提示。
