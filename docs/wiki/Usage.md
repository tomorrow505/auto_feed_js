# Usage

## 基本流程
1. 在源站**种子详情页**打开 `转发/Reupload`。
2. 需要补中文信息时点击 `点击获取`（仅中文 NP 系站点注入）。
3. 选择目标站跳转上传页。
4. 脚本检测缓存并自动预填。

## 页面判定规则（重要）
- PTP / GPW / RED / OPS / DIC：必须带 `torrentid` 的详情页才注入转发与远程推送。
- HDB / CHDBits / OpenCD：仅 `details.php?id=...` 详情页注入。
- TTG：`/t/{id}` 或 `details.php?id=...`。
- 不满足详情页条件时，不注入转发入口与远程推送，避免误抓错种。

## 快捷键
- `Alt + S`：打开设置面板。

## 预填失败排查
1. 目标站是否登录。
2. 当前页面是否满足详情页规则（尤其是否有 `torrentid`）。
3. 设置里该目标站是否在“启用站点”中。
4. 打开控制台查看 parse/fill 报错。

## 推荐测试链路
- 视频链路：`PTP -> TTG`、`PTP -> HDB`、`HDB -> CHDBits`、`GPW -> CMCT`。
- 音乐链路：`RED/OPS/DIC <-> OpenCD`（当前为重点补齐项）。
