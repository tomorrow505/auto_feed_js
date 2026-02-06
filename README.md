# Auto-Feed Refactor

原作者：**tomorrow505**  
重构维护：**gawain**  
仓库地址：`https://github.com/Gawain12/auto_feed_js`

重构版 Wiki：`docs/wiki/Home.md`

## 安装
1. 安装浏览器扩展 Tampermonkey。
2. 从 GitHub Releases 安装最新版（推荐）：
   `https://github.com/Gawain12/auto_feed_js/releases/latest`
3. 下载并安装脚本文件：
   `https://github.com/Gawain12/auto_feed_js/releases/latest/download/auto_feed.user.js`

说明：
- GreasyFork 上的链接目前为旧版脚本发布地址（如后续同步重构版，会在本仓库 README/Wiki 明确标注）。

## 开发
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

## 文档
- `docs/wiki/Home.md`
- `docs/wiki/Usage.md`
- `docs/wiki/Settings.md`
- `docs/wiki/Image-Tools.md`
- `docs/wiki/Remote-Download.md`
- `docs/wiki/Site-Support.md`
- `docs/wiki/FEATURE_PARITY.md`

## Release (Tag)
推送 tag `v*` 会触发 GitHub Actions 构建并将 `dist/auto_feed.user.js` 作为 Release 附件发布：
`https://github.com/Gawain12/auto_feed_js/releases/latest/download/auto_feed.user.js`

## License
GPL-3.0

