# 需求记录

## 2026-10-01
- 参考 [coreylam/github2gitee](https://github.com/coreylam/github2gitee)（本地 Python 批量同步 GitHub→Gitee）。
- 希望开发更轻便方案：用浏览器插件，对某个 GitHub 仓库一键克隆/同步到 Gitee。
- 先评估可行性，再决定实现路径。

## 2026-10-01（场景补充）
1. **已有仓自动同步**：Gitee 上已有对应仓库时，GitHub 变更后能自动同步。
2. **新增克隆**：在 GitHub 浏览到感兴趣仓库时，一键新建到自己的 Gitee 并完成首次同步。

## 2026-10-01（文档）
- 要求单独创建正式需求文档，不与流水摘要混写。
- 已输出：`doc/prd-github2gitee-extension.md`（v0.1 草案）。

## 2026-10-01（多浏览器）
- 浏览器插件需同时支持 Chrome、Edge、Firefox；核心功能三端对等。
- 已更新 PRD 至 v0.2。

## 2026-10-01（需求梳理与开发设计）
- 启动需求梳理与开发设计。
- 产出：`doc/requirements-review.md`、`doc/design-github2gitee-extension.md`。
- 待确认决策 D-01～D-05（尤其同步执行层是否采用薄同步服务）。

## 2026-10-01（决策确认 + M1）
- 用户确认：D-01～D-07 全部按建议默认。
- 开始 M1：搭建 `extension/` 与 `sync-service/` 工程骨架。
- M1 骨架已落地：扩展可构建（chrome/firefox）、同步服务 health/sync/jobs API（mirror 仍为 stub）。

## 2026-10-01（澄清 sync-service）
- 询问：sync-service 作用？是否必须本地？纯插件能否实现？

## 2026-10-01（纯 API 方案）
- 进一步明确：纯浏览器插件，GitHub/Gitee 全部通过 API 操作，是否可行？

## 2026-10-01（Gitee 网页导入）
- 用户指出：Gitee 网页可直接从 GitHub 导入仓库（及后续同步更新）。

## 2026-10-01（Gitee 网页 Sync）
- 用户确认：Gitee 网页上也有点击 Sync/同步更新 的操作。

## 2026-10-01（重改需求与设计）
- 主方案改为：纯浏览器插件 + Gitee 官方导入/同步更新/镜像；取消 sync-service 作为 MVP 依赖。
- 已更新 PRD / 需求梳理 / 开发设计至 v1.0；`sync-service/` 标记为 archived。

## 2026-10-01（继续实现 M2）
- 扩展已对齐 v1.0：导入跳转、确认导入、手动同步、登记已有映射、轮询有更新；去掉 sync-service 配置。

## 2026-10-01（进度确认）
- 用户询问是否已全部开发完成。

## 2026-10-01（继续完善 MVP）
- 增强轮询自动确认导入、有更新时静默尝试 mirror pull；Gitee 页预填/高亮；Popup 中文与「立即检查」；扩展版本 0.2.0。

## 2026-10-01（后台任务）
- 早先启动的本地 sync-service 进程已中止；与当前 v1.0 主路径无关（服务已归档）。

## 2026-10-01（删除 sync-service）
- 确认可彻底删除；已移除整个 `sync-service/` 目录并更新 README / 设计文档。

## 2026-10-01（Edge 加载失败）
- Edge 加载 dist/chrome 失败；原因倾向 ES module 分包；改为 IIFE 单文件构建 v0.2.1。

## 2026-10-01（UX 改进）
- 主交互改到 GitHub 页面内操作；补 Token/登录引导；降低对 Popup 的依赖。

## 2026-10-01（双语 + 体验）
- 支持中英双语：默认跟随浏览器语言，可在面板/Popup/设置中手动切换。
- 设计 Logo/图标；优化 GitHub 页面板、Popup、配置引导与交互。

## 2026-10-01（弱化干扰 + 视觉统一）
- 右下角默认收起为半透明小按钮，点击再展开；统一 teal/slate 配色并重做 Logo。

## 2026-10-01（功能/配置拆分）
- GitHub 页面板仅保留导入/同步动作，去掉语言等配置入口。
- 扩展弹窗=映射管理（功能页）；Options=语言/Token/间隔（纯配置页）。

## 2026-10-01（发布准备）
- 补充 MIT LICENSE、隐私政策草稿、商店文案、发布清单；`npm run pack` 生成上架用 zip。
- 隐私政策改为中英双语，**默认/准据文本为英文**，中文为译本。
- 生成商店截图与可粘贴描述：`doc/store-assets/`（3 张 1280×800 + SUBMISSION_COPY）。
