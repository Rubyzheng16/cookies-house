/**
 * CDN 图片配置
 *
 * 排查 404：在浏览器打开下面的 URL，能打开则路径正确
 * https://cdn.jsdelivr.net/gh/Rubyzheng16/cookies-house@main/路径/add-btn.png
 *
 * 常见路径：miniprogram/assets/images （仓库根目录含 miniprogram 文件夹）
 *          assets/images （仓库根目录就是 miniprogram 的内容）
 */

const USE_CDN = true;

// 仓库信息（路径为 assets/images，分支为 master）
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

// 不启用 CDN 时返回空，constants 会回退到本地路径
export const CDN_FOLDER_IMAGES = USE_CDN ? CDN_FOLDERS : ['', '', '', '', '', ''];
export const CDN_ADD_BTN = USE_CDN ? `${CDN_BASE}/add-btn.png` : '';
