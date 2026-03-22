# Settings

## 打开方式
- 快捷键：`Alt + S`
- 面板顶部 `Save` 会显示 `Saving / Saved / Save Failed` 状态反馈。

## 主要分区
- `Dashboard`
  - 面板透明度、弹窗透明度、遮罩透明度、Toast 透明度
- `Settings`
  - 页面增强：PTP/HDB 豆瓣、PTP 组名显示、豆瓣/IMDb 快搜
  - 发布行为：默认匿名、发布后自动下载
  - 外部数据源：IMDb->豆瓣方式、PTGen 来源
  - 域名别名：CHD 域名、TorrentLeech 域名
  - 快搜模板编辑器（支持 legacy 模板行：`<a ...>` / `名称|URL` / 纯 URL）
  - 图床 API Key：PTPImg / Freeimage
- `Sites`
  - 启用站点
  - 常用站点（收藏）
  - 列表页快搜开关（PTP/HDB/HDT/UHD）
- `Remote`
  - 远程侧边栏开关
  - 默认跳检、推送前确认
  - qB / TR / Deluge 客户端配置与测试

## 说明
- 所有配置持久化在油猴存储（`auto_feed_settings`）。
- 站点启用状态受 `src/config/*` 与 `SiteCatalogService` 控制。
- 快搜默认预设来自 `archive/auto_feed.legacy.user.js`（含 `nzbs.in`、字幕站等独立搜索站点）。
