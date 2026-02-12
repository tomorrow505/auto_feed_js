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
- `trackers`：站点差异（parse/fill）
- `templates`：框架通用能力
- `common/rules`：纯函数规则，不做 DOM/请求副作用
- `services`：运行时服务与副作用
- `core`：站点识别和执行时序

## 开发建议
1. 先在 `archive/auto_feed.legacy.user.js` 找旧规则。
2. 尽量在对应站点 tracker 修复，避免污染通用层。
3. 复用 `common/rules`，删除重复代码，不新增一次性服务。
4. 每次站点改动后至少验证 1 条端到端链路。

## 提交前
- `npm run build` 必须通过。
- 若行为变化，更新 `FEATURE_PARITY.md`。
