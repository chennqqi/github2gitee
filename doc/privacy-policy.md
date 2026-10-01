# 隐私政策 / Privacy Policy

**产品名称**：GitHub → Gitee（浏览器扩展）  
**生效日期**：2026-10-01  
**适用版本**：0.4.x 及后续正式发布版本（以商店页为准）

本文说明扩展如何处理数据。上架商店前，请将本文托管为**可公开访问的 URL**（例如 GitHub Pages / 仓库 `doc/privacy-policy.md` 的稳定链接），并在商店后台填写该链接。

---

## 中文

### 1. 我们收集什么

本扩展**默认不运营自有后端**，也不会把你的令牌或仓库内容上传到开发者服务器。

可能涉及的数据仅包括：

| 数据 | 存放位置 | 用途 |
|------|----------|------|
| Gitee Access Token（必填） | 浏览器扩展本地存储（`storage.local`） | 调用 Gitee API（校验账号、探测仓库、尝试镜像同步等） |
| GitHub Token（可选） | 同上 | 访问 GitHub API（例如私有仓或提高限额，公开仓通常可不填） |
| 仓库映射列表（GitHub ↔ Gitee） | 同上 | 记住已导入/已登记的仓库与同步状态 |
| 语言偏好、检查间隔等设置 | 同上 | 界面与轮询配置 |
| 当前浏览的 GitHub / Gitee 页面上下文 | 仅在你打开相关页面时于本地处理 | 显示面板、预填导入地址、辅助同步跳转 |

### 2. 数据如何使用与传输

- 扩展会在你的浏览器内，向 **GitHub**（`github.com` / `api.github.com`）与 **Gitee**（`gitee.com`）发送必要的网络请求，以完成导入编排、状态检查与同步触发。
- **实际仓库搬运/镜像由 Gitee 官方服务完成**，受 Gitee 自身条款与隐私政策约束。
- 开发者**不**通过本扩展收集分析 SDK、广告标识或无关浏览历史。

### 3. 权限说明

| 权限 / 主机访问 | 原因 |
|-----------------|------|
| `storage` | 本地保存 Token、映射与设置 |
| `alarms` | 按间隔检查仓库是否有更新 |
| `tabs` | 打开 Gitee 导入页 / 仓库页等 |
| `https://github.com/*` 等 | 识别仓库页并注入操作面板 |
| `https://api.github.com/*` | 读取公开（或授权）仓库元数据 |
| `https://gitee.com/*` | 导入页辅助、同步跳转、Gitee API |

### 4. 数据保留与删除

- 数据保存在**你的浏览器配置文件**中。卸载扩展或清除扩展数据即可删除。
- 你也可在设置中清空 Token；映射可在扩展弹窗中逐条移除（不会删除 Gitee 上的远程仓库）。

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

---

## English

### Summary

GitHub → Gitee is a browser extension that helps you start Gitee’s official import/sync flows. It stores your **Gitee/GitHub tokens** and **repo mappings** only in **browser extension local storage**. It does **not** send tokens to a developer-operated backend. Network requests go to **GitHub** and **Gitee** as needed for the features you use. Uninstalling the extension or clearing extension data removes locally stored data.

### Permissions

- `storage`, `alarms`, `tabs`, and host access to GitHub/Gitee exist solely to provide import orchestration, status checks, and sync shortcuts.

### Contact

- Repository: https://github.com/chennqqi/github2gitee  
- Support email: _replace before store submission_

### Changes

Material updates will be reflected in this document and the effective date.
