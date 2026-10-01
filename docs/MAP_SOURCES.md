> GitHub Pages 准备包补充：已配置项目网页地图 Key。2026-10-01 的 localhost 实测已确认底图加载、学校 POI 测试标记显示、放大与设施详情访问。标记点击、真实建筑定位、校园网络和 GitHub Pages 线上加载尚未完成验收。以下内容保留初始交付记录，不代表本包仍缺 Key。

# 地图资源调查与选择

查阅日期：2026-10-01。将“文档能力核查”“目标区域实际覆盖”和“最终环境加载实测”分开记录。

|候选|网页接入、Key 与坐标|校园覆盖 / 道路 / 河流 / 轮廓|访问与成本限制|
|---|---|---|---|
|腾讯 JavaScript API GL（选用）|官方 SDK；需自己的 Key；GCJ-02；LatLng 纬度在前|没有项目 Key，未能实测松江校园内部的细节与最新程度|官方文档可访问；项目 SDK 未授权实测；额度、付费与商业使用授权须在账号控制台确认，不能承诺无限免费|
|高德 JavaScript API 2.0|官方网页 API；需网页 Key，官方说明新 Key 还需安全密钥配置；GCJ-02|未申请 Key，未实测校园内覆盖|官方文档可访问；不安装此 SDK。安全密钥推荐按官方代理方案管理，不能随意放服务器密钥到前端|
|Leaflet + OSM 标准底图|Leaflet 是地图显示框架，本身不提供底图；标准 OSM 瓦片无需 Key，数据为 WGS84|未能核实26条命名建筑点位；官方检索页本环境不可访问，Overpass 校园名称查询返回 HTTP 406|OSM 官方瓦片有署名、缓存、禁止批量预下载等政策且无 SLA；目标校园网络加载与细节未实测，不用于本版|

选择腾讯的原因：优先匹配发起人的平台意向与分享坐标体系，采用单一官方 SDK，不使用隐藏瓦片接口，也不将未转换的 OSM/GPS 点位混入。先交付 Key-independent 页面与数据层；真实底图阶段保留明确待配置状态。

## 证据链接

- [腾讯官方基础入门](https://lbs.qq.com/webApi/javascriptGL/glGuide/glBasic)：Key、HTTP 服务、GCJ-02 与参数顺序。
- [腾讯 Map 类](https://lbs.qq.com/webApi/javascriptGL/glDoc/docIndexMap)：拖拽、滚轮、触屏缩放、tilesloaded、zoom 等事件。
- [腾讯标记](https://lbs.qq.com/webApi/javascriptGL/glDoc/glDocMarker) 与 [文本标签](https://lbs.qq.com/webApi/javascriptGL/glDoc/glDocLabel)：交互图层、碰撞配置。
- [腾讯控制台](https://lbs.qq.com/dev/console/application/mine)：以此处账号当前配额、域名与权限设置为准。公开配额/条款页面未能可靠访问，故未给出具体金额或次数。
- [高德快速上手](https://developer.amap.com/api/javascript-api-v2/getting-started)、[安全密钥说明](https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode)。
- [OSM 标准瓦片政策](https://operations.osmfoundation.org/policies/tiles/)。未接入该服务。
- [学校官方校园地图](https://www.shisu.edu.cn/campus-life/maps/) 及 [2016公开平面图](https://info.shisu.edu.cn/56/4f/c42a22095/page.htm)：只用于人工核对，发布日期不同，不等于今天的更新状态。

## Key 配置后必做

1. 在发布域名、手机校园 Wi-Fi 和移动数据分别加载，记录设备、网络、耗时、错误与日期。
2. 放大校内，人工检查主要道路、镜湖与26条设施对应位置；缺失与旧名称独立记入核对表。
3. 保留腾讯 SDK 原有 logo、版权来源与比例尺；不得遮盖或裁切。
4. 采集建筑中心或真实入口，分别记录；不自动申请使用者定位权限。
5. 新地图能打开不等于建筑用途、营业状态已更新。

## 蓝色与校徽

已查阅 [学校官网](https://www.shisu.edu.cn/) 与 [学校导视系统资料](https://news.shisu.edu.cn/gazette/1/20210701/67b1adc5b82c4afa93692911f3f5aeaf.html)，可核查中英文校名和校训。未取得官方标准色文件或适合本项目使用的校徽素材，采用文字标识与 #0056A6 设计近似蓝，不声称精确从校徽取色或为官方标准；项目 S 图标与地图 favicon 不是校徽。
