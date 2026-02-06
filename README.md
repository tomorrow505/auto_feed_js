# Auto-Feed Refactor

这是 `auto_feed.user.js` 的**模块化重构版本**，保持原脚本功能一致，并拆分为可维护的引擎/服务/模板结构，支持本地开发、构建与发布。  
原作者：**tomorrow505**  

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
# Auto-Feed Refactor (PT 自动转载/发布脚本)

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Preact](https://img.shields.io/badge/Framework-Preact-673ab7.svg)](https://preactjs.com/)
[![License](https://img.shields.io/badge/License-GPL%203.0-green.svg)](LICENSE)

> 这是 `auto_feed.user.js` 的**模块化重构版本**，保持原脚本核心功能一致，并采用现代架构重写，提供更流畅的交互体验与更强的扩展性。

---

## ✨ 核心特性

### 1. 极致简约的 UI 体验
重构版摒弃了传统的 HTML 拼接，采用 **Preact + Shadow DOM** 打造了现代化简约界面：
- **深色模式**: 完美适配现代 PT 站点的暗色主题。 
- **多语言**: 内置中/英双语切换，国际化支持更友善。

### 2. 强大的转载引擎
支持跨架构、跨站点的无缝转载，智能识别并预填表单：
- **NexusPHP**: M-Team, HDSky, CHDBits, SSD, TTG 等。
- **Unit3D**: BHD, BLU, Aither 等。
- **Gazelle**: PTP, RED, OPS, DIC 等。
- **特殊架构**: HDBits, KG, AvistaZ 系列。

### 3. 智能辅助工具
- **图片转存**: 集成 PTPIMG, PIXhost, Hostik 等主流图床，支持批量截图转存与“桥接模式”一键拉取。
- **远程推送**: 一键将种子推送到 qBittorrent, Transmission, Deluge，支持连接测试与路径映射。
- **种子清洗**: 自动移除隐私信息（Comment, Created By），源站 Tracker 替换，保护账号安全。
- **元数据增强**: 自动从豆瓣/IMDb 获取中文简介、海报与评分，补齐外站资源信息。

---

## 🚀 快速开始

### 安装
1. 安装浏览器扩展 **Tampermonkey**。
2. [点击安装脚本](dist/auto_feed.user.js) (或从 GreasyFork 安装)。
3. 访问支持的 PT 站点，按下 `Alt + S` 打开设置面板。

### 开发指南
如果你想参与开发或自行构建：

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/auto_feed_js.git

# 2. 安装依赖
npm install

# 3. 启动开发服务器 (支持热更新)
npm run dev

# 4. 构建发布版本
npm run build
```

---

## 📚 文档中心
- [用户手册 (Usage)](docs/wiki/Usage.md)
- [功能对照表 (Feature Parity)](docs/wiki/FEATURE_PARITY.md)
- [图像工具详解](docs/wiki/Image-Tools.md)
- [支持站点列表](docs/wiki/Site-Support.md)

---

## 🤝 致谢
- 原作者：**tomorrow505** (感谢大佬的开创性工作)

## 📄 许可证
GPL-3.0
