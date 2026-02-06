# Auto-Feed Refactor Wiki

这是重构版（`refactor-dev` 分支）的内置 Wiki，目标是让后来维护者能快速理解：
1. 脚本在做什么
2. 代码结构在哪里
3. 目前已实现哪些能力，哪些仍在规划中

旧版完整功能与细节参考原项目 Wiki（tomorrow505/auto_feed_js/wiki），本 Wiki 只记录重构版的现状与路线图。

## 快速入口
- 安装脚本：`dist/auto_feed.user.js`
- 核心入口：`src/main.ts`
- 站点适配（PT 语义：Tracker）：`src/trackers/`
- 通用能力：`src/services/`
- 设置面板：`src/ui/`（默认 `Alt+S` 打开）

## 典型用法（简版）
1. 在源站的种子详情页点击 `转发/Reupload` 打开面板。
2. 选择 `发布/检索` 模式。
3. 点击目标站点打开新页。
4. 在目标站上传页自动预填（右下角会出现 Found Data 提示，可手动点“重新填充”）。

## 功能状态
已实现（可用但仍需逐站细化）：
- 一键转发主链路：源站解析 -> 缓存 -> 目标站预填
- 禁转/拒转关键字提示（部分站点/场景）
- 快速搜索：豆瓣/IMDb 页面 + 部分站点列表页（PTP/HDB 等）
- 图床能力：
  - 图床按钮组（原图/PTPIMG/PIXHOST/IMGBOX/HDBits/Hostik 等）
  - 图片处理大窗口（提取、替换、缩略、链接处理等）
  - 图床“一键拉取”桥接（预填文件选择框，不自动上传）
- 远程推送侧边栏（qB/TR/Deluge 等，持续对齐交互细节）

规划中（与旧版对齐的差距）：
- 更多站点覆盖与站点特例迁移
- 分类/媒介/编码/音轨/分辨率/匿名等字段的逐站预填对齐
- 外站信息与中文增强（ptgen、IMDb->豆瓣、中文简介/副标题等）
- 种子清洗细节与 gazelle 多 torrent 选择逻辑完善

差距清单与优先级：`todo.md`

## 本 Wiki 页面
- `docs/wiki/Development.md`
- `docs/wiki/Feature-Gap.md`
- `docs/wiki/Usage.md`
- `docs/wiki/Settings.md`
- `docs/wiki/Image-Tools.md`
- `docs/wiki/Remote-Download.md`
- `docs/wiki/Site-Support.md`

## 教程大纲（对照旧版）
已实现：
- 安装与开发：`docs/wiki/Development.md`
- 基本转发与预填：`docs/wiki/Usage.md`
- 设置面板：`docs/wiki/Settings.md`
- 图片处理与图床桥接：`docs/wiki/Image-Tools.md`
- 远程推送（基础能力）：`docs/wiki/Remote-Download.md`

规划中：
- Ptgen/外站中文信息更完整对齐（简介/副标题等）
- 洗种与种子清洗细节完全对齐（多 tracker/gazelle 多种子）
- 禁转提示规则细节完全对齐
- 站点覆盖与大量站点特例迁移
