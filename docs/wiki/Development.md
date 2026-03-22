# Development

## 环境
- Node.js 18.20.x+
- npm 10+

## 命令
```bash
npm install
npm run dev
npm run build
```

本地安装入口：
- `http://127.0.0.1:5174/auto-feed.user.js`

## 架构约定
- `trackers`：站点差异（parse/fill，一站一文件）
- `templates`：框架通用能力
- `common/rules`：纯函数规则，不做 DOM/请求副作用
- `services`：运行时服务与副作用
- `core`：站点识别和执行时序

## 重构适配流程（推荐）
1. 先对齐上游源码规则，再动当前代码。
2. 先打通数据链路（parse -> storage -> fill），再修 UI 表现。
3. 单站差异优先放 `trackers/config`，不要把站点特例污染通用模板。
4. 必做端到端实测，不仅是本地编译通过。

详细步骤见：[`Refactor-Adaptation-Tutorial.md`](Refactor-Adaptation-Tutorial.md)

## 开发建议
1. 先在 `archive/auto_feed.legacy.user.js` 找旧规则。
2. 尽量在对应站点 `tracker/config` 修复，避免污染通用模板。
3. 复用 `common/rules`，删除重复代码，不新增一次性服务。
4. 每次站点改动后至少验证 1 条端到端链路。

推荐定位命令：
```bash
rg -n "站点名|set_jump_href|autotype|autores|default_search_list|add_search_urls" archive/auto_feed.legacy.user.js
rg -n "siteEngineMap|keywords|match" src/core src/config
rg -n "nameInput|descrInput|imdbInput|torrent" src
```

## 提交前
- `npm run build` 必须通过。
- 若行为变化，更新 `FEATURE_PARITY.md`。
