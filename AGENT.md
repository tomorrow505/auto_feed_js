# Auto-Feed Maintainer Guide

本文件用于统一协作约束，避免重复回归。

## 目标
- 第一优先级：行为对齐 `archive/auto_feed.legacy.user.js` 已验证逻辑。
- 第二优先级：在不破坏现有功能前提下简化结构，减少重复逻辑。

## 当前共识
- 非音乐站点：以可用和稳定为主，优先修回归。
- 音乐站点（RED / OPS / DIC / OpenCD）：继续按旧版规则补齐 parse/fill 与转发链路。
- 新站适配：优先“源码对齐 + 实测验证”，而不是只拼 DOM 选择器。

## 代码组织（当前）
- `src/trackers/*`：站点单独实现（站点差异优先放这里；一站一文件）
- `src/templates/*`：站点框架通用实现
- `src/common/rules/*`：可复用纯逻辑（无副作用）
- `src/services/*`：运行时副作用（DOM/网络/缓存/UI 注入）
- `src/core/*`：站点识别、生命周期调度
- `src/config/*`：站点配置清单

## 源码对齐适配方法（强制）
1. 先找“上游真规则”
- 先查 `archive/auto_feed.legacy.user.js`。
- 不先写新逻辑，先定位：该站 `uploadPath`、`search` 参数、关键表单 selector、字段映射（category/type/resolution）。

2. 先抄稳定规则，再做最小改造
- 站点级差异优先落在 `trackers/*` 或 `config/*`。
- 模板层只放“多个站共用”的逻辑，避免把单站特例塞进模板导致回归扩散。
- Nexus / Gazelle / Unit3D 均遵循“一站一 tracker + SiteRegistry 一一映射”。

3. 用“链路”思维排查
- 源站 parse -> normalize -> Storage -> 目标站 fill。
- 任何一段字段缺失，后面都必然失败；禁止只看目标页填充代码。

4. 做真实页面验证
- 必做至少 1 条端到端（源站到目标站）。
- 至少覆盖：标题、简介、关键 ID（IMDb/TMDB/Douban）、种子文件注入、发布页关键下拉。

## 改动原则
1. 先在旧脚本确认规则，再改当前实现。
2. 能复用就复用，但不要把站点特例硬塞进通用层。
3. 站点行为必须可追踪到对应 `tracker/config`，避免“看不出逻辑在哪”。
4. 不引入“为了重构而重构”的抽象；优先减少重复代码与行为漂移。
5. 默认不做破坏性 git 操作，不回滚与当前任务无关的用户改动。

## 排错顺序
1. 源站 parse 是否拿到字段。
2. `normalize`/清洗是否改坏。
3. `StorageService` 是否写入/读取一致。
4. 目标站 fill 是否被页面二次渲染覆盖。

## 验收清单
- `npm run build` 通过。
- 至少做 1 条源站 -> 目标站端到端验证（包含标题、简介、媒介字段、关键 ID、torrent 注入）。
- 若改动站点逻辑，同步更新 `docs/wiki/FEATURE_PARITY.md` 状态说明。
