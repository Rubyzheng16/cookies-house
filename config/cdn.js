/**
 * CDN 图片配置
 *
 * 排查 404：在浏览器打开下面的 URL 能打开则路径正确
 * 若 404，请检查：1) 分支名（main/master）2) 图片是否已 push 到远程 3) 路径是否与仓库结构一致
 */

// 置为 false 时使用本地图片（需确保 assets/images 被 pack 包含）；CDN 404 时可先改为 false
const USE_CDN = false;

// 仓库信息
const GITHUB_USER = 'Rubyzheng16';
const GITHUB_REPO = 'cookies-house';
// 分支：新仓库通常为 main，旧仓库可能为 master，请与 GitHub 实际分支一致
const GITHUB_BRANCH = 'main';
// 路径：仓库根含 miniprogram 用 miniprogram/assets/images；根即 miniprogram 用 assets/images
const IMAGES_PATH = 'miniprogram/assets/images';

const CDN_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}/${IMAGES_PATH}`;

const CDN_FOLDERS = [
  `${CDN_BASE}/folders/folder-1.png`,
  `${CDN_BASE}/folders/folder-2.png`,
  `${CDN_BASE}/folders/folder-3.png`,
  `${CDN_BASE}/folders/folder-4.png`,
  `${CDN_BASE}/folders/folder-5.png`,
  `${CDN_BASE}/folders/folder-6.png`
];

// 幸运饼干图片（需上传到 git 的 assets/images/fortune-cookie/）
export const CDN_FORTUNE_COOKIE_WHOLE = USE_CDN ? `${CDN_BASE}/fortune-cookie/fortune-cookie-whole.png` : '';
export const CDN_FORTUNE_COOKIE_BROKEN = USE_CDN ? `${CDN_BASE}/fortune-cookie/fortune-cookie-broken.png` : '';

// 不启用 CDN 时返回空，constants 会回退到本地路径
export const CDN_FOLDER_IMAGES = USE_CDN ? CDN_FOLDERS : ['', '', '', '', '', ''];
export const CDN_ADD_BTN = USE_CDN ? `${CDN_BASE}/add-btn.png` : '';
