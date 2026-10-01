# 需求分析

## 2026-10-01：浏览器插件同步 GitHub→Gitee 可行性
- 原方案：本地/Action 用 git clone + push（GitPython），需 Token + SSH 私钥，偏重。
- 浏览器无法原生跑 git；纯前端 mirror 大仓受内存/存储/CORS 限制，不现实。
- 可行轻量路径：插件作编排层，调用 Gitee「仓库镜像 Pull」API/能力，由 Gitee 服务端从 GitHub 拉取；或插件触发轻量后端做 mirror。
- 结论：可行，但应定位「一键创建/配置镜像」而非在扩展内完整 git clone/push。

## 2026-10-01：两种业务场景分析
- **场景 A（已有→自动同步）**：自有 GitHub 仓可用 Gitee Pull 镜像 + webhook；他人公开仓无法在对方仓挂 webhook，需轮询 commit 再触发同步。
- **场景 B（浏览→新增）**：插件在 GitHub 页识别仓库 → 调 Gitee 建空仓 → 首次 mirror（优先薄后端或 Gitee 导入/镜像）；可同时登记到「已同步列表」供后续自动同步。
- 建议产品形态：扩展负责发现/建仓/登记；同步执行走 Gitee 镜像或轻量后端；扩展侧维护「已同步映射表」驱动轮询。

## 2026-10-01：单独需求文档
- 用户要求正式 PRD 与 `requirements.md` 流水摘要分离。
- 已整理完整草案至 `doc/prd-github2gitee-extension.md`：背景目标、场景 A/B、功能/非功能、约束、MVP 验收、里程碑、待确认项。
- `requirements.md` 继续只记短摘要；详细需求以 PRD 为准。

## 2026-10-01：多浏览器支持
- 将 N-05 从「Chromium 优先、Firefox 后续」改为 P0：Chrome/Edge/Firefox 同时支持。
- 实现上建议 WebExtensions 兼容子集 + polyfill + 多 manifest 构建；业务与浏览器 API 解耦。
- MVP 验收增加三端核心流程冒烟；待确认项改为是否必须官方商店上架。

## 2026-10-01：需求梳理与开发设计
- 梳理：MVP=公开仓一键新增+轮询/手动同步+三端；P1=私有仓/webhook/商店；扩展不做内嵌 git。
- 设计建议：Extension(MV3+polyfill) 编排 + Sync Service 异步 mirror；本地 mapping 存储；alarms 轮询。
- 关键待确认：D-01 薄同步服务（推荐）vs 仅 Gitee 官方镜像；其余 D-02～D-05 已给建议默认。
- 确认后进入 M1 工程骨架实现。

## 2026-10-01：决策确认并启动 M1
- D-01～D-07 全部确认按建议默认；锁定薄同步服务架构。
- 开始实现 extension（MV3 三端构建）与 sync-service（health + API 骨架）。
- M1 已完成：扩展 Options/Popup/Content/Background 可构建；服务 `/v1/health`、`/v1/sync`、`/v1/jobs/{id}` 可用；mirror 逻辑留待 M3。

## 2026-10-01：澄清 sync-service 必要性
- sync-service 负责服务端 git mirror（建仓/clone/push），扩展只做编排。
- 不一定要「本机」：可部署云函数/小 VPS；本机只是开发默认。
- 纯插件无法可靠做完整历史镜像（无 git、存储/内存限制）；可纯插件做的是「调 Gitee 官方镜像 API/导入」，但对他人公开仓能力弱且不稳定。

## 2026-10-01：纯 API（无 sync-service）可行性
- 建仓、读元数据、Contents 逐文件读写：纯插件可行。
- 完整 commit/分支/标签历史：GitHub 有较完整 Git Data API；Gitee 侧 mainly 读 blob/tree + Contents 写文件，难以对等重建完整 git 历史。
- 结论：纯 API 适合「快照同步/小仓」；不等价于 git mirror。若接受无完整历史，可砍掉 sync-service 改纯插件。

## 2026-10-01：Gitee 官方导入/同步能力
- 官方支持「从 GitHub 导入仓库」（网页 OAuth 授权后选择导入），导入后可用仓库页「同步更新」；另有仓库镜像 Pull。
- 文档见：https://help.gitee.com/questions/GitHub%E4%BB%93%E5%BA%93%E5%BF%AB%E9%80%9F%E5%AF%BC%E5%85%A5Gitee%E5%8F%8A%E5%90%8C%E6%9B%B4%E6%96%B0
- 公开稳定的「一键 import 任意 GitHub URL」Open API 未见；插件更现实的是：跳转/辅助官方导入页，或已导入后触发同步/镜像。
- 这意味着「纯插件 + 借 Gitee 服务端搬代码」比 Contents 快照更接近完整历史，但受官方导入范围/授权限制。

## 2026-10-01：Gitee 网页 Sync 按钮
- 对应帮助文档中的仓库主页「同步更新」（多分支场景推荐；默认强制同步/覆盖）。
- 与「仓库镜像管理」里的手动「更新」同类：由 Gitee 侧拉 GitHub，用户点一下即可。
- 插件若走官方能力路线：新增≈引导导入；已有仓手动/自动同步≈触发同步更新或 mirror pull。

## 2026-10-01：重改需求与设计（v1.0）
- 采纳用户方向：借 Gitee 网页「从 GitHub 导入」+「同步更新」/镜像，纯插件编排。
- D-01 从薄同步服务改为官方能力；MVP 成功标准允许半自动跳转确认。
- 已重写 prd / requirements-review / design 至 v1.0；工程上 sync-service 归档，扩展为主交付物。
- 下一步：Spike 导入深链与同步触发方式，再实现 M2。

## 2026-10-01：继续实现 M2（官方导入路线）
- Spike：`/projects/import/url` 需登录可用；同步无通用「同步更新」API，优先 `remote_mirror/pull`，否则打开仓库页。
- 扩展已实现 request_import / confirm_imported / manual_sync / register_existing_mapping / poll update_available。
- typecheck + chrome/firefox build 通过。

## 2026-10-01：是否开发完成
- 结论：未全部完成。MVP 主路径代码已具备，但未端到端验收；M4 三端回归、M5 私有仓/打磨、商店发布均未做。
- 同步依赖半自动（无 mirror 时需网页点同步更新）；导入深链预填需真机验证。

## 2026-10-01：继续完善 MVP（v0.2.0）
- 后台：pending_import 自动确认；update 时仅 API 静默同步，避免轮询弹页。
- Gitee content script：导入 URL 预填、同步控件高亮。
- Popup 中文化 + 立即检查；构建通过。待真机三端验收。

## 2026-10-01：删除 sync-service
- 用户确认可彻底删除；目录已从仓库移除。
- 设计文档升至 v1.1（修复此前编码损坏并去掉归档表述）；交付物仅剩 extension + doc。

## 2026-10-01：Edge 加载 dist/chrome
- 根因：content script / SW 产物含 ES import 分包；content scripts 不能可靠用 type:module。
- 修复：逐入口 IIFE 打包、去掉 content/background 的 type:module；版本 0.2.1。
- 加载路径须为含 manifest.json 的 `extension/dist/chrome`。

## 2026-10-01：UX 改为 GitHub 页内操作
- 用户反馈难用/无设计感；采纳「感知 GitHub 页直接操作」+ Token 引导。
- 实现：仓库页右下角面板（导入/确认/同步/登记）；无 Token 显示步骤引导并打开 Options；Options 增加私人令牌申请指引。Popup 降为映射列表。
- 版本 0.3.0。

## 2026-10-01：双语与体验增强
- 需求：中英双语（浏览器默认 + 手动切换）、Logo、面板/Popup/配置引导体验。
- 实现：`shared/i18n.ts`；config.locale=auto|zh|en；GitHub 面板/Popup/Options 统一切换；品牌图标 public/icons；版本 0.4.0。
