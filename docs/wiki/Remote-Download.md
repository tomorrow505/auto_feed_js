# Remote Download

重构版提供“远程推送”侧边栏，用于把当前页面的 torrent 推送到下载器的 Web UI。

## 入口
- 设置里启用“侧边栏”，页面右侧会出现推送 UI。

## 支持的客户端（持续补齐）
- qBittorrent
- Transmission
- Deluge (Web UI)

## 配置说明（概念）
每个客户端通常需要：
- Web UI 地址
- 账号/密码（或 Deluge 的 Web password）
- 保存路径映射（按标签选择路径）

注意：
- 各客户端的“测试连接”逻辑会有差异，Deluge 的认证机制容易造成“测试提示不完全准确”，以实际推送是否成功为准。

