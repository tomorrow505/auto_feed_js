# Site Support

本页描述“代码中已接入”和“当前人工测试结论”。

## 已人工验证（非音乐为主）
- Nexus/类 Nexus：TTG、HDB、CHDBits、PTer、HDSky、CMCT、HDHome、OurBits、Audiences、MTeam
- Gazelle（影视）：PTP、GPW
- Unit3D/Classic：BHD、BLU、Tik、KG、Monika

补充：Monika（MDU）已按上游源码规则对齐修复上传路径与关键表单映射。
补充：SC、TJUPT、HDT 已补齐为可识别源站/目标站，并按 legacy 规则加入专属 tracker；HDT 归入 special 站点清单，避免误放进 Nexus/Gazelle/Unit3D 分类。2026-05-18 回归修复了三站上传页表单等待、SC group-only 源页注入、HDT details/torrents 源页兼容、TJUPT 专用字段与通用标题抢写等问题。

## 音乐站点（持续补齐）
- RED
- OPS
- DIC
- OpenCD

说明：以上 4 个站点已接入单独 tracker，但仍在补齐双向转发字段和细节规则。

## 配置已存在但未系统回归
- FRDS
- ACM
- HDF
- PrivateHD

## 本地构建验证
- 图床按钮已从 Gifyu 切换为 ImgBB，旧 `gifyuApiKey` 会迁移到 `imgbbApiKey`。
- Cinematik 的 IMDb aspect ratio 兜底已按当前 IMDb technical 页 DOM 验证，可读取 `Aspect ratio1.85 : 1` 形态。

## 代码位置
- 站点配置：`src/config/`
- 站点逻辑：`src/trackers/`（一站一文件）
- 框架模板：`src/templates/`
- 通用规则：`src/common/rules/`
