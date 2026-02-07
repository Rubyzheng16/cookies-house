/**
 * CDN 图片配置
 * 将超过 200KB 的图片上传到 CDN 后，在此填入 URL
 * 留空则使用本地路径（需保证本地文件 < 200KB）
 *
 * 推荐：微信云开发、腾讯云 COS、阿里云 OSS、七牛云 等
 *
 * 使用 CDN 时需在微信公众平台 → 开发 → 开发管理 → 开发设置
 * 的「downloadFile 合法域名」中添加 CDN 域名
 */

// 文件夹图片（6 款），按顺序对应 folder-1 ~ folder-6
export const CDN_FOLDER_IMAGES = [
  '', // folder-1.png
  '', // folder-2.png
  '', // folder-3.png
  '', // folder-4.png
  '', // folder-5.png
  ''  // folder-6.png
];

// 底部加号按钮
export const CDN_ADD_BTN = '';
