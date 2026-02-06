# Auto-Feed Refactor TODO

## 0. 结构对齐（参考 easy-upload）
- [ ] 新增目录：`src/common` `src/source` `src/target` `src/site-dom` `src/store`
- [ ] 迁移/整理公共工具（`htmlToBBCode` `mediaInfo` `MetaCleaner` `ExternalMetaService` `ImageHostService` 等）
- [ ] 统一 GM 存储与 session 缓存（用于跨页转发）

## 1. 核心流程
- [ ] 站点识别：源站详情页 / 目标站上传页
- [ ] 元数据解析 -> 清洗 -> 存储
- [ ] 目标站填表 -> 种子注入 -> 清理缓存
- [ ] 快捷检索 / 快捷跳转（可设置）

## 2. 站点优先级（先跑通 CHD/BHD/MT）
- [x] CHDBits 详情页解析 + 上传页填表
- [x] BHD 详情页解析 + 上传页填表
- [x] MTeam 详情页解析 + 上传页填表
- [x] 三站互转：转发按钮 + 检索按钮

## 3. 旧脚本功能迁移清单（保持一致）
- [ ] HTML -> BBCode（walkDOM）
- [ ] MediaInfo/BDInfo 解析与简化
- [ ] 片名/小简介/类型/媒介/编码/音轨/分辨率 推断
- [ ] 站点特例修正与过滤（依旧脚本逻辑）
- [ ] Douban/IMDb/TMDB 信息抓取与注入
- [x] 图床转换、图片提取与替换
- [ ] 任务缓存（GM/本地）与跨页转发
- [x] 快捷检索/快捷跳转规则

## 4. UI & 设置
- [ ] 设置面板：API Key / 快捷检索站点 / 必要开关
- [ ] 详情页按钮注入与状态反馈
- [ ] 错误日志展示
