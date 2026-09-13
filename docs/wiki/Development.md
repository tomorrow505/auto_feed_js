# Development

## 环境
- Node.js 18.20.x+
- npm 10+

## 命令
```bash
npm install
npm run dev
```

本地调试只使用一个动态入口：
- `http://127.0.0.1:5174/auto-feed-refactor.user.js`

`npm run build` 会同时生成：
- `dist/auto_feed.user.js`：完整脚本。
- `dist/auto-feed-refactor.user.js`：本地调试 loader，头部 `@require` 指向本机完整脚本。

`npm run dev` 会常驻本地服务并监听源码变化，loader 每次构建会追加本地构建版本号。调试 loader 使用独立的 `[Local Debug]` 名称和 namespace，可以和正式版同时安装。

## 分支与提交流程

- 原项目 `main` 是旧版 legacy，主要用于查找已有行为和兼容规则。
- 原项目 `dev` 是新版主线，经过验证的修复和适配再向这里提交 PR。
- `refactor-dev` 是更快的开发与验证分支，先在这里完成实现、真实站点测试和回归。

推荐流程：先在 `refactor-dev` 开发和验证，确认问题已解决且没有明显回归后，再整理提交到原项目 `dev`。

启动调试：
```bash
npm run dev
```

正式发布前只需额外执行一次：
```bash
npm run build
```

不需要维护第三份本地全量拷贝；`dist/` 中的两个文件只是正式 bundle 和调试 loader 的构建产物。

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
