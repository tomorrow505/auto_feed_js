# Site Support

## 代码层的站点适配位置
- 站点配置：`src/config/`
- 站点解析与预填：`src/trackers/`
- 通用模板（Nexus/Gazelle 等）：`src/templates/`

## 当前适配策略
- 优先保证常用站点（PTP/HDB/CHD/MTeam/BHD/CMCT/pter/KG/Audiences/TTG/Tik 等）作为源站和目标站都可用。
- 其余站点逐步迁移旧版逻辑，迁移顺序以 `todo.md` 为准。

## 如何新增/修站点（维护者指引）
1. 先确认该站属于哪种框架（NexusPHP / Gazelle / Unit3D 等）。
2. 能走模板就走模板，不能就新增 tracker 并实现 parse/fill。
3. 在真实页面做源站解析和目标站预填的端到端验证。
4. 把差异记录进 `todo.md`，避免回归。

