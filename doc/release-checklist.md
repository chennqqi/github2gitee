# 发布清单（Chrome / Edge / Firefox）

状态约定：`[ ]` 未做 · `[x]` 已完成（本地工程侧）

## 0. 发布策略

| 阶段 | 目标 | 建议 |
|------|------|------|
| A. 侧载内测 | 给试用者 zip / 加载已解压 | 现在即可 |
| B. Chrome Web Store | 正式分发 Chromium | 补齐下方 1～5 |
| C. Edge Add-ons | 可与 Chrome 包同源 | 审核通过 Chrome 后通常更快 |
| D. Firefox AMO | 需签名与 `gecko.id` | 单独提交 |

当前工程版本见 `extension/package.json`（开发版 `0.4.x`）。正式上架建议升为 **`1.0.0`**。

---

## 1. 工程侧（本仓库可完成）

- [x] MIT `LICENSE`
- [x] 隐私政策草稿 [`privacy-policy.md`](./privacy-policy.md)（英文为准据文本，附中文译本）
- [x] 商店文案草稿 [`store-listing.md`](./store-listing.md)
- [x] 打包脚本：`cd extension && npm run pack`
- [x] 构建产物：`dist/chrome`、`dist/firefox`
- [ ] 正式版号改为 `1.0.0`（上架当次再改）
- [ ] 隐私政策托管为**公网 HTTPS URL**，并替换文中占位邮箱
- [ ] 用户向安装说明（可放 README「Install」章节）已校对
- [ ] 发布用 zip **不含** `node_modules`、源码；建议不含 `.map`（`npm run pack` 已排除 map）

### 打包命令

```bash
cd extension
npm install
npm run pack
```

输出目录：`extension/release/`

- `github2gitee-<version>-chrome.zip`（Chrome / Edge 通用）
- `github2gitee-<version>-firefox.zip`

---

## 2. 质量验收（上架前必做）

在 **Chrome、Edge、Firefox** 各跑一遍：

- [ ] 未配置 Token：面板提示去设置，设置页可保存并校验 Token
- [ ] 公开仓：导入跳转 Gitee「从 URL 导入」，完成后确认/自动探测映射
- [ ] 已映射仓：立即同步（mirror API 或打开「同步更新」页）至少一条路径可用
- [ ] 弹窗：映射列表、登记已有仓、立即检查
- [ ] 设置页：语言 / Token / 间隔互不影响功能页
- [ ] 卸载扩展后本地 Token/映射不可再被本扩展读取（预期行为）

已知产品边界（商店描述必须写清）：

- 真正搬代码的是 **Gitee**；插件是编排层
- 「同步更新」可能**强制覆盖** Gitee 侧提交
- MVP 主打**公开仓**；私有仓依赖额外授权，不保证

---

## 3. 商店账号与合规

- [ ] Chrome Web Store 开发者账号（一次性注册费）
- [ ] Edge 合作中心账号
- [ ] Firefox Add-ons 账号；为正式版设置稳定 `browser_specific_settings.gecko.id`
- [ ] 填写隐私政策 URL、单一用途说明、权限Justification
- [ ] 远程代码：本扩展应为自包含包（勿动态下发可执行脚本）

---

## 4. 素材规格（最少集）

| 素材 | Chrome | Edge | Firefox | 状态 |
|------|--------|------|---------|------|
| 扩展图标 128 | 已有 `icon128.png` | 同左 | 同左 | 工程内已有 |
| 商店小图 / 宣传图 | 需按控制台规格导出 | 同 | 同 | [ ] 待制作 |
| 截图 ≥1 张 | 建议 1280×800 或 640×400 | 按控制台 | 按控制台 | [ ] 待制作 |
| 推荐截图内容 | ① GitHub 页小按钮/面板 ② 设置页 ③ 弹窗映射列表 | | | |

截图可用系统截图工具制作；上架前替换商店占位图。

---

## 5. 提交动作清单

### Chrome

1. [ ] `npm run pack` 得到 chrome zip  
2. [ ] 上传 zip，填 [`store-listing.md`](./store-listing.md) 文案  
3. [ ] 填隐私政策 URL、权限说明  
4. [ ] 提交审核  

### Edge

1. [ ] 可用同一 chrome zip（或 Edge 构建若有差异）  
2. [ ] 关联/声明隐私政策与产品说明  

### Firefox

1. [ ] 确认 `manifest` 中 gecko id 为正式 id  
2. [ ] 上传 firefox zip，走 AMO 审核/签名  
3. [ ] 临时加载（`about:debugging`）**不能**代替正式分发  

---

## 6. 发布后

- [ ] 打 git tag（如 `v1.0.0`）并写 GitHub Release（附 zip）  
- [ ] README 增加商店徽章与安装链接  
- [ ] 收集审核驳回项，记入 `doc/requirements.md`  

---

## 7. 阻塞项（未完成则不要点「提交审核」）

1. 公网隐私政策 URL + 真实支持邮箱  
2. 至少 1～3 张合格截图  
3. 三端冒烟通过  
4. 正式版本号与商店描述中的能力边界一致  
