# Site Support

本页描述“代码中已接入”和“当前人工测试结论”。

## 已人工验证（非音乐为主）
- Nexus/类 Nexus：TTG、HDB、CHDBits、PTer、HDSky、CMCT、HDHome、OurBits、Audiences、MTeam
- Gazelle（影视）：PTP、GPW
- Unit3D/Classic：BHD、BLU、Tik、KG、Monika

补充：Monika（MDU）已按上游源码规则对齐修复上传路径与关键表单映射。

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

## 代码位置
- 站点配置：`src/config/`
- 站点逻辑：`src/trackers/`（一站一文件）
- 框架模板：`src/templates/`
- 通用规则：`src/common/rules/`
