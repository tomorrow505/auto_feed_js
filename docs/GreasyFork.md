# Auto-Feed｜PT一键转种助手（重构版）

项目地址：<https://github.com/tomorrow505/auto_feed_js/tree/dev>

这是从原版 Auto-Feed 演进而来的重构版本。我们保留原版熟悉的一键转种流程，把站点适配、信息提取、自动填表、图片处理和远程推送整理成更清晰、可解耦的功能模块，让后续维护和扩展更容易。

目前仍有部分小站、站点细节和边缘流程在迁移适配中，功能会持续补齐。需要适配其他站点时，可以参考仓库现有源码和适配方式提交 PR。

## 已实现功能

- 源站详情页一键转发到目标站上传页
- 自动填写标题、简介、媒体信息和图片
- IMDb、豆瓣、PTGen 等信息补全
- 快速搜索与页面增强
- 图片转存与图床处理（PTPIMG、Pixhost、Freeimage、ImgBB、Hostik、hdbimg）
- 远程推送到 qBittorrent、Transmission、Deluge
- 种子信息清洗与常用字段处理

## 界面预览

![设置面板](https://raw.githubusercontent.com/tomorrow505/auto_feed_js/dev/docs/images/settings.png)

![站点选择](https://raw.githubusercontent.com/tomorrow505/auto_feed_js/dev/docs/images/sites.png)

![图片处理工具](https://raw.githubusercontent.com/tomorrow505/auto_feed_js/dev/docs/images/image_tools.png)
