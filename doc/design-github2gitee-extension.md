# GitHub → Gitee 浏览器插件 — 开发设计

| 项 | 内容 |
|---|---|
| 文档版本 | v1.1 |
| 日期 | 2026-10-01 |
| 依据 | [`requirements-review.md`](./requirements-review.md)、[`prd-github2gitee-extension.md`](./prd-github2gitee-extension.md) |
| 架构 | **纯浏览器插件 + Gitee 官方导入 / 同步更新 / Pull 镜像** |
| 变更 | v1.1：彻底删除 `sync-service/`（不再保留归档目录） |

---

## 1. 设计目标

- **零自建同步后端**：用户只装插件 + 使用 Gitee（及可选 GitHub Token）。
- **完整历史交给 Gitee**：导入与同步更新由 Gitee 服务端拉取 GitHub。
- **插件做编排**：识别仓库、跳转/触发、映射、轮询「有更新」、状态展示。
- **跨浏览器**：Chrome / Edge / Firefox，MV3 + polyfill。

---

## 2. 总体架构

```
┌──────────────────────────────────────────────────────────┐
│  Browser Extension (MV3)                                 │
│  Popup / Options / Content(GitHub+Gitee) / Background    │
│  · 映射存储 · alarms 轮询 · 打开 Gitee 页 · 调公开 API   │
└───────────────┬──────────────────────────┬───────────────┘
                │                          │
                ▼                          ▼
         api.github.com              gitee.com
         (读仓/commit)               · 网页：导入 / 同步更新
                                     · API：user/repos、commits、
                                       remote_mirror/pull（若可用）
                                     · 服务端实际拉取 GitHub
```

**职责**

| 组件 | 负责 | 不负责 |
|---|---|---|
| Extension | UI、映射、跳转导入、触发/引导同步、轮询对比 | git 传输、自建 mirror |
| Gitee 官方 | 导入、同步更新、镜像拉取 | — |
| GitHub API | 元数据与最新 SHA（公开仓可无 token） | — |

---

## 3. 工程结构

```
github2gitee/
├── doc/
├── extension/                 # 唯一交付物
│   ├── src/
│   │   ├── background/
│   │   ├── content/           # GitHub + Gitee 页脚本
│   │   ├── popup/
│   │   ├── options/
│   │   └── shared/
│   ├── manifests/
│   └── ...
└── README.md
```

> 历史上短暂存在过 `sync-service/`（自建 git mirror），v1.0 起移出主路径，**v1.1 已从仓库删除**。

---

## 4. 核心流程

### 4.1 新增导入

GitHub 仓页 →「Import to Gitee」→ 打开 `https://gitee.com/projects/import/url?url=...`（并尽量复制 clone URL）→ `pending_import` → 用户完成官方导入 → 自动/手动确认 → `success`。

### 4.2 同步已有仓

手动「立即同步」或轮询发现 SHA 不一致 → 优先 `POST .../remote_mirror/pull` → 失败则打开 Gitee 仓库页引导点「同步更新」（轮询时不自动弹页，仅标「有更新」）。

### 4.3 仅登记映射

Popup「登记已导入仓库」：校验 Gitee 仓存在后写入映射。

---

## 5. 扩展要点

- 配置：`gitee_token`、可选 `github_token`、`poll_interval_minutes`（默认 20）
- 权限：`storage` / `alarms` / `tabs`；hosts：github.com、api.github.com、gitee.com
- Content：GitHub 注入导入按钮；Gitee 页预填导入 URL、高亮同步控件

---

## 6. Spike 结论

| ID | 结果 |
|---|---|
| S1 | `/projects/import/url` 可用（需登录）；带 `?url=` + 复制 URL 兜底 |
| S2 | 无通用「同步更新」公开 API；有 mirror 用 `remote_mirror/pull`，否则打开仓库页 |
| S3 | mirror pull 失败则降级打开网页 |
| S4 | `GET /repos/{owner}/{repo}` 判断导入完成；支持自动确认 |

---

## 7. 里程碑

| 阶段 | 状态 |
|---|---|
| M1′ 文档切换 | 完成 |
| M2 导入 + 映射 | 完成（extension v0.2.0） |
| M3 手动同步 | 完成 |
| M4 轮询/自动确认/静默 pull | 完成代码；三端真机待测 |
| M5 私有仓/打磨 | 待开始 |
| 删除 sync-service | **完成（v1.1）** |
