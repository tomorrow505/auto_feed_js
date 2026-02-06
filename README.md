# Auto-Feed Refactor

这是 `auto_feed.user.js` 的**模块化重构版本**，保持原脚本功能一致，并拆分为可维护的引擎/服务/模板结构，支持本地开发、构建与发布。  
原作者：**tomorrow505**  
重构维护：**gawain**

简化版 Wiki：`docs/wiki/Home.md`

## 功能概览
- 站点识别 + 一键转发（源站解析 → 目标站预填）
- 站点模块化（NexusPHP / Unit3D / Gazelle / 站点定制引擎）
- 快速搜索 + 快捷转发按钮
- 豆瓣/IMDb 快速工具、PTGen 数据获取
- 远程下载侧边栏（qBittorrent / Transmission）
- 图床转存（PTPIMG / Pixhost / Freeimage / Gifyu / HDBIMG）

## 已适配站点（未完全测试）
说明：以下为代码层面已接入的站点清单，**并非全部经过实测**。  
如遇解析/预填不完整，请在 TODO 里补登记。

NexusPHP / CHD 体系：
- MTeam
- HDSky
- OurBits
- CMCT (SpringSunday)
- TTG
- pterclub
- HDArea
- Audiences
- FRDS
- CHDBits

Gazelle / PTP / HDB：
- PTP
- HDB
- RED
- OPS
- DIC
- KG

Unit3D / Unit3D Classic：
- BHD
- Tik
- Aither
- BLU
- DarkLand
- ACM
- HDOli
- Monika
- DTR
- HONE
- FNP
- OnlyEncodes
- ReelFliX

## TODO（重构迁移中）
- 未实测站点的解析/预填验证（见“已适配站点”列表）
- 外站 HDB/PTP 的解析与预填细节继续对齐原脚本
- CMCT / Pter / TTG / HDSky 等常用站点做逐项验证
- 旧脚本的“站点特化逻辑”逐条迁移
- 特殊站点（如 Gazette / 小众站）按需补引擎适配
- 快速检索/转发按钮在部分站点样式对齐
- 远程推送侧边栏在更多站点详情页稳定性验证

## 已知限制
- 某些站点需要单独 DOM 结构适配，仍在迁移中
- 个别站点跨域资源（图标/图片）可能被浏览器拦截
- Safari 无法直接使用本地 loader，请使用完整脚本安装

## 项目结构
```
src/
  trackers/            # 站点解析/填充（PT 语义：Tracker 适配）
  services/            # 通用服务（存储/图床/爬取/远程）
  templates/           # 通用模板（Nexus/Gazelle 等）
  ui/                  # 设置面板
scripts/               # 本地开发辅助脚本（不参与功能逻辑）
docs/wiki/             # 重构版 Wiki（只记录重构版现状与差距）
dist/                  # 构建产物（用户脚本，默认不提交）
```

## 开发运行环境
推荐环境：
- Node.js 18+（已验证 18.20.x）
- npm 10+
- TypeScript 5+
- Vite 5 + vite-plugin-monkey

## 开发启动
```bash
npm install
npm run dev
```
开发默认启动 Vite（端口 5173），通过 `vite-plugin-monkey` 的安装入口进行调试。

## 构建
```bash
npm run build
```
构建产物在 `dist/`：
- `dist/auto_feed.user.js`（完整脚本）

## 使用说明
1. 生产/日常使用：安装 `dist/auto_feed.user.js`
2. 本地开发：`npm run dev`，通过 `vite-plugin-monkey` 的 install 页面安装开发版脚本
3. 设置面板：`Alt+S` 打开脚本设置

## CI/CD
本项目已配置 GitHub Actions：
- **CI**：push/PR 自动安装依赖并构建
- **CD**：推送 tag（`v*`）自动打包并发布 Release

## 作者与致谢
- 原作者：**tomorrow505**
- 重构维护：**gawain**

## 许可证
GPL-3.0
