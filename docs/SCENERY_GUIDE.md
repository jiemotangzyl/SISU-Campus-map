# 校园风景照片墙

独立页面：`scenery.html`。首页、设施详情及项目介绍的主导航均可进入。

现在没有上传风景照片，页面展示专属空状态，不使用设施照片或虚构照片填充。上传后自动呈现错落照片墙，支持分类、点击放大、前后切换、键盘左右键和Esc关闭；单张照片可以通过`scenery.html?photo=照片编号`直接打开。

后续将已获公开使用授权且完成隐私筛选的照片放入 `assets/scenery/`，在 `data/scenery_photos.json` 的 `photos` 中追加：

```json
{
  "id": "scenery-001",
  "title": "镜湖晚光",
  "src": "assets/scenery/scenery-001.jpg",
  "category": "湖畔",
  "location": "镜湖",
  "taken_at": "2026-10-20",
  "photographer": "经本人同意公开的署名",
  "description": "可选的一句话说明",
  "alt": "湖面倒映着黄昏的天空",
  "width": 1600,
  "height": 1067,
  "public_use": true
}
```

上述仅为字段格式示例，不代表已经有这张照片。编号必须唯一。地点、时间、摄影者、说明和分类均可省略，不会显示待补充字段。`width`和`height`填写真实图片尺寸，以减少加载时布局跳动。建议长边不超过2000像素，移除EXIF后再公开。分类根据实际内容自动生成。

本地选文件不等于上传到公开网站。现已增加带本地后端的 upload.html 和管理员相册 admin.html，运行方式见 PHOTO_UPLOAD_LOCAL.md。静态照片仍可按上述目录方式加入；同学上传的照片则由本地相册服务保存。
