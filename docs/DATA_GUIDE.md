# 数据与照片维护

## 单一内容源

所有设施列表和详情读取 data/campus_facilities.json。标准 JSON 数组，UTF-8；不写注释或末尾多余逗号。正式数据与 templates/facility.example.json 隔离，格式示例不导入地图。示例经纬度仍为 null，避免假坐标。空白模板不预填日期、编号或事实。

## 必填及字段类型

|字段|类型 / 规则|
|---|---|
|id、name、category|必填字符串；id 唯一且稳定；category 从首页分类中选择|
|summary、location_desc、building、subcategory|字符串；未知可写待补充；floor 可 null|
|aliases、departments、tips、pending_items|字符串数组|
|services|对象数组，推荐 name、floor、status、keywords；兼容纯字符串|
|parent_id|父建筑 ID 或 null，用于内部服务点关联；当前26条无内部独立服务点|
|opening_hours、access_rules、reservation、fees|字符串或 null，未知显示待补充|
|latitude、longitude|数值或 null，不填0、字符串、随机值或学校复用坐标|
|coordinate_system|GCJ-02 / WGS84 / BD-09 或 null；本版只绘制 GCJ-02|
|coordinate_status|必填：待定位 / 已定位，待现场复核 / 已现场复核|
|coordinate_source、coordinate_source_url|来源说明与链接；已定位必须有实际来源|
|coordinate_collected_at|ISO 日期或 null，坐标真正获得的日期|
|position_type|建筑中心 / 实际入口 或 null|
|original_coordinates|转换前经纬度、体系与原始来源对象或 null|
|geometry、geometry_coordinate_system|预留真实轮廓结构和坐标系，本版不绘制此字段；不要填假轮廓|
|entrances|对象数组：name、description、latitude、longitude、coordinate_system、coordinate_status；独立于建筑点|
|photo|旧单图字段，保留兼容数据结构；展示前请迁移到有授权的 photos|
|photos|对象数组，src、caption、taken_at、credit、public_use；public_use 必须 true 才公开展示|
|verified_at|真正现场核实日期或 null，不自动填当前日期|
|content_status|必填；资料来源确认与现场核实分开说明|
|sources|对象数组：title、organization、url、accessed_at、note|
|updated_at|实际修改资料的 ISO 日期或 null，不等于现场核实日期|

## 添加或修改

复制 templates/facility.template.json 的对象，填写必填内容后加入正式数组。保持未知坐标为 null、状态为待定位；后续采集完毕再填写真实来源和坐标。启动 HTTP 预览，运行 node checks.mjs，检查搜索、详情与待核实字段，再发布新版本。更换正式编号前检查 data/id_mapping.json 与旧链接兼容。

## 现场照片

1. 把自己拍摄或已获授权的图片放入 assets/photos/<id>/。
2. 在该记录 photos 填入每张的相对路径，例如 assets/photos/TMP-SJ-0013/entrance.jpg。
3. 填 caption、taken_at（未知为 null）、credit；确认公开使用授权后才设 public_use:true。
4. 建议用 JPG/WebP 适当压缩，并保留入口、门牌的可读性；不在公开照片中暴露私人资料。
5. 本版允许同源 assets/photos/ 下的图片。外部远程图片不直接使用；先取得使用授权并按项目维护流程提供文件。
6. 多张图由同一模板生成，点击可开大图，用按钮切换、Esc关闭；加载失败显示明确提示。

~~~json
{"src":"assets/photos/TMP-SJ-0013/entrance.jpg","caption":"第一教学楼入口门牌（实际拍摄后填写）","taken_at":null,"credit":"摄影者姓名待补充","public_use":false}
~~~

本地文件选择不是上传。本项目没有上传后台；把图片与JSON放入本地目录只影响本地预览，重新发布后其他获准访问者才能看到。无照片时保持数组空，不用 AI 或随机校园照片。

## 纠错入口

在 js/config.js 的 feedbackUrl 设置真实 HTTPS 表单；留空时仅提供复制反馈内容，明确没有提交。网站不会审核或自动发布反馈。

## 地图浏览状态

sessionStorage 保存本次会话的中心、缩放、搜索与分类。返回 index.html 恢复；分享链接不携带私人浏览状态。无权限或浏览器禁止存储时自然降级为默认视图。
