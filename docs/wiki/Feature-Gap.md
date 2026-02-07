# Feature Gap (Legacy vs Refactor)

本页只做“差距导航”，具体任务粒度与勾选请看 `FEATURE_PARITY.md`。

## 旧版关键能力 (重构版仍需补齐)
- 转发主链路的“逐站预填细节”对齐：PTP/HDB/CHD 作为源与目标时的字段、勾选项、标题清洗、特殊规则
- GZ 架构的“组内多种子”识别与仅在具体 torrent 页面显示入口
- 种子清洗与“发布后自动下载种子”链路（旧版支持大量站点）
- 外站中文信息获取链路：IMDb->豆瓣 ID 获取方式切换、ptgen 节点切换、剧集非第一季的“检索并选择”交互
- 查重与发布切换模式，以及快搜模板管理（旧版支持一行一条模板 + 变量替换）
- 禁转提示的关键字与站点规则补齐
- 图片转存与图片处理大窗口：多图转存策略、对比图/抽取展示图等
- 外站中文显示覆盖（PTP/HDB/FL/AVZ/Tik/KG/NBL/CG 等）与逐项开关
- 一键签到、简化 MediaInfo 等辅助功能迁移

## 旧版 Wiki 页面对应
- `设置页面` -> `docs/wiki/Settings.md` + `FEATURE_PARITY.md` (设置能力差距)
- `源种子页面` + `转载功能` + `发布页面` -> `docs/wiki/Usage.md` + `FEATURE_PARITY.md` (逐站逻辑差距)
- `查重及快搜` -> `docs/wiki/Usage.md` + `FEATURE_PARITY.md`
- `图片转存` + `图片处理` -> `docs/wiki/Image-Tools.md` + `FEATURE_PARITY.md`
- `qb推送` -> `docs/wiki/Remote-Download.md` + `FEATURE_PARITY.md`
