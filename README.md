# Auto-Feed Refactor

原作者：**tomorrow505**  
仓库地址：https://github.com/Gawain12/auto_feed_js

使用教程（优先看这个）：
- Wiki 首页：[`docs/wiki/Home.md`](docs/wiki/Home.md)
- 使用教程：[`docs/wiki/Usage.md`](docs/wiki/Usage.md)

## 安装（Release）
1. 安装浏览器扩展 Tampermonkey。
2. 安装脚本（dev 频道，随 `dev` 分支自动更新）：
   https://github.com/Gawain12/auto_feed_js/releases/download/dev/auto_feed.user.js
3. 稳定版（打 tag `v*` 后）：
   https://github.com/Gawain12/auto_feed_js/releases/latest/download/auto_feed.user.js

说明：
- GreasyFork 目前为旧版脚本发布地址（如后续同步重构版，会在本仓库 README/Wiki 明确标注）。

## 使用引导
- 进 PT 种子详情页后，按 `Alt + S` 打开设置面板。
- 站点详情页标题旁会出现 `转发/Reupload` 和 `点击获取`（按站点与页面类型注入）。
- “功能差距/缺失清单”见：[`todo.md`](todo.md)

## 开发/构建
环境：
- Node.js 18.20.x
- npm 10+

命令：
```bash
npm install
npm run dev
```

开发安装入口（vite-plugin-monkey）：
`http://127.0.0.1:5173/__vite-plugin-monkey.install.user.js?origin=http%3A%2F%2F127.0.0.1%3A5173`

构建：
```bash
npm run build
```
产物：
- `dist/auto_feed.user.js`

## 文档（仓库内）
- [`docs/wiki/Home.md`](docs/wiki/Home.md)
- [`docs/wiki/Usage.md`](docs/wiki/Usage.md)
- [`docs/wiki/Settings.md`](docs/wiki/Settings.md)
- [`docs/wiki/Image-Tools.md`](docs/wiki/Image-Tools.md)
- [`docs/wiki/Remote-Download.md`](docs/wiki/Remote-Download.md)
- [`docs/wiki/Site-Support.md`](docs/wiki/Site-Support.md)
- [`docs/wiki/FEATURE_PARITY.md`](docs/wiki/FEATURE_PARITY.md)

## Release (Tag)
推送 tag `v*` 会触发 GitHub Actions 构建并将 `dist/auto_feed.user.js` 作为 Release 附件发布：
https://github.com/Gawain12/auto_feed_js/releases/latest/download/auto_feed.user.js

## License
GPL-3.0
