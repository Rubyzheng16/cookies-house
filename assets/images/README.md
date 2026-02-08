# 图片资源说明

请将您准备的图片放入以下位置：

## 文件夹样式（6 款）

将 6 款文件夹图片放入 `folders/` 目录，命名为：
- `folder-1.png` - 第 1 款
- `folder-2.png` - 第 2 款
- `folder-3.png` - 第 3 款
- `folder-4.png` - 第 4 款
- `folder-5.png` - 第 5 款
- `folder-6.png` - 第 6 款

文件夹按列表顺序循环使用：第 1 个用 folder-1，第 2 个用 folder-2，……第 7 个又用 folder-1，以此类推。

## 底部加号按钮

将您的**完整按钮图片**（整圆设计，含图标）放入根目录，命名为：
- `add-btn.png`

会完全替换原有的圆形按钮，不会叠加任何背景或边框。建议使用透明背景的 PNG。

支持格式：png、jpg、webp

**注意**：微信小程序要求单张图片/音频不超过 200KB。若压缩后仍超限，请将图片上传到 CDN，在 `miniprogram/config/cdn.js` 中填入 URL，程序会优先使用 CDN 地址。

## 幸运饼干（fortune-cookie）

将幸运饼干图片放入 `fortune-cookie/` 目录：

- `fortune-cookie-whole.png`：点击前的完整饼干图片
- `fortune-cookie-broken.png`：点击后破开的饼干图片，露出字条区域

AI 生成的文字会叠加在破开饼干图片的字条区域中央。若字条位置与图片不一致，可在 `miniprogram/components/fortune-cookie/index.wxss` 中调整 `.fortune-slip-overlay` 的 `top`、`left`、`width` 等。
