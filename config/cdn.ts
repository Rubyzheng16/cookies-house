/**
 * CDN 图片配置
 * 将超过 200KB 的图片上传到 CDN 后，在此填入 URL
 * 留空则使用本地路径（需保证本地文件 < 200KB）
 *
 * 推荐：微信云开发、腾讯云 COS、阿里云 OSS、七牛云 等
 */

const USE_CDN = true;

const GITHUB_USER = 'Rubyzheng16';
const GITHUB_REPO = 'cookies-house';
const GITHUB_BRANCH = 'master';
const IMAGES_PATH = 'assets/images';

const CDN_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}/${IMAGES_PATH}`;

const CDN_FOLDERS = [
  `${CDN_BASE}/folders/folder-1.png`,
  `${CDN_BASE}/folders/folder-2.png`,
  `${CDN_BASE}/folders/folder-3.png`,
  `${CDN_BASE}/folders/folder-4.png`,
  `${CDN_BASE}/folders/folder-5.png`,
  `${CDN_BASE}/folders/folder-6.png`
];

export const CDN_FOLDER_IMAGES = USE_CDN ? CDN_FOLDERS : ['', '', '', '', '', ''];
export const CDN_ADD_BTN = USE_CDN ? `${CDN_BASE}/add-btn.png` : '';
