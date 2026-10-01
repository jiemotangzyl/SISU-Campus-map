# 数惠·便利一图 · GitHub Pages 发布包

将本目录内的文件和文件夹直接上传到 GitHub 仓库根目录，使 index.html 在第一层。

GitHub 仓库 Settings → Pages → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save。GitHub Free 使用公开仓库。网站地址通常为 https://你的用户名.github.io/仓库名/ ，以 Pages 页面显示的网址为准。

本包已配置用户提供的腾讯网页地图公开 Key。腾讯控制台还需授权 你的用户名.github.io，保留 localhost；若使用自定义域名也需授权该域名。域名填写格式以腾讯控制台为准。不要将 GitHub 仓库链接当作网站域名。

本地预览：在此目录运行 python -m http.server 8000 --bind 127.0.0.1，访问 http://localhost:8000/。

没有编译步骤和后端，不需要把 serve.mjs 或 Sites 的 .openai 配置上传。本包 .nojekyll 用于关闭 Jekyll 处理；如网页上传未保留隐藏文件，可在仓库 Add file → Create new file 创建名为 .nojekyll 的空文件。

真实状态：localhost 已加载腾讯真实底图并显示学校 POI 测试标记；该标记仅用于本地实测，不包含在正式发布包中。正式26条设施仍均待定位，不编造建筑坐标。照片、开放情况和入口持续采集中。

后续修改 data/campus_facilities.json 和 assets/photos/<id>/ 并提交，GitHub Pages 会重新发布。数据与照片维护详见 docs/DATA_GUIDE.md。

GitHub Pages 网站默认公开可访问。上传照片之前确认 public_use 与公开使用授权；浏览器地图 Key 本身会在前端可见，需使用域名和平台权限限制。
