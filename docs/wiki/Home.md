# 🤖 Auto-Feed Refactor Wiki

欢迎使用 **Auto-Feed Refactor**！这是一个专为 PT (Private Tracker) 爱好者设计的自动化脚本，旨在通过模块化的架构，提供极致的转载与发布效率。

> [!NOTE]
> 本 Wiki 记录了重构版（v3.x）的现状及其与旧版（v2.x）的功能集成情况。

---

## 快速入口
- 安装脚本：[GitHub Releases](https://github.com/Gawain12/auto_feed_js/releases/latest) / `auto_feed.user.js` 下载直链：`https://github.com/Gawain12/auto_feed_js/releases/latest/download/auto_feed.user.js`
- 核心入口：`src/main.ts`
- 站点适配（PT 语义：Tracker）：`src/trackers/`
- 通用能力：`src/services/`
- 设置面板：`src/ui/`（默认 `Alt+S` 打开）

---

## 🌟 核心理念
- **简约而不简单**: 基于 Preact + TypeScript，代码结构清晰，易于维护。
- **极致美学**: 采用 Apple 风格 UI，支持深色/浅色模式与多语言切换。
- **安全优先**: 所有的种子清洗与图片转存逻辑均在本地运行，保护个人私钥安全。

---

## 🗺️ 快速导航

### 📖 使用手册
| 模块 | 说明 |
| :--- | :--- |
| [🚀 使用教程](Usage.md) | 从安装到完成第一次转载。 |
| [🔧 设置详解](Settings.md) | 如何配置 API Key、远程推送等。 |
| [🖼️ 图像工具集](Image-Tools.md) | 截图转存、对比图制作与图床桥接。 |
| [📡 远程推送](Remote-Download.md) | qB/TR/Deluge 的集成与路径映射。 |

### 🛠️ 开发者中心
| 模块 | 说明 |
| :--- | :--- |
| [⚙️ 代码结构](Development.md) | 想要改代码？先看这里。 |
| [🌍 站点适配指南](Site-Support.md) | 如何添加或修改站点规则。 |
| [📊 功能差距](Feature-Gap.md) | 对照旧版的补齐进度。 |

---

## 🚩 典型工作流
1. **解析 (Parse)**: 脚本自动抓取源站种子页面中的 MediaInfo、简介、图片链接。
2. **增强 (Enhance)**: 一键获取豆瓣评分、中文名、Ptgen 简介及海报。
3. **清洗 (Clean)**: 自动移除种子中的个人信息，随机化创建时间。
4. **注入 (Fill)**: 跳转目标站，毫秒级自动预填所有发布项与文件。

---

## 📅 版本与路线图
- **Current (v3.1.x)**: 核心框架完成，支持 NexusPHP/Gazelle/Unit3D 主流站点。
- **Upcoming (P0)**: 深度对齐 PTP/HDB 转发逻辑，补齐种子自动下载链路。
- **Vision**: 通过配置化引擎实现“零代码”站点扩展。

> [!TIP]
> 详细的任务进度请参考根目录下的 [todo.md](../../todo.md)。
