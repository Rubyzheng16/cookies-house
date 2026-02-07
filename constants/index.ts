// 常量定义
import { CookieType } from '../types';
import { CDN_FOLDER_IMAGES, CDN_ADD_BTN } from '../config/cdn';

const LOCAL_FOLDER_IMAGES = [
  '/assets/images/folders/folder-1.png',
  '/assets/images/folders/folder-2.png',
  '/assets/images/folders/folder-3.png',
  '/assets/images/folders/folder-4.png',
  '/assets/images/folders/folder-5.png',
  '/assets/images/folders/folder-6.png'
];

/** 文件夹图片路径（6款），优先用 CDN，否则用本地 */
export const FOLDER_IMAGES = LOCAL_FOLDER_IMAGES.map((local, i) =>
  (CDN_FOLDER_IMAGES[i] || '').trim() || local
);

/** 底部加号按钮图片路径，优先用 CDN */
export const ADD_BTN_IMAGE = (CDN_ADD_BTN || '').trim() || '/assets/images/add-btn.png';

export const COLORS = {
  base: '#FCE4EC',
  header: '#6D4C41',
  ui: '#FFF9C4',
  text: '#3E2723',
  raspberry: '#FF80AB',
  matcha: '#81C784',
  lemon: '#FFF176',
  blueberry: '#B39DDB',
  gold: '#FFD700',
  mumbling: '#D7CCC8'
};

export const COOKIE_METADATA: Record<CookieType, { 
  name: string, 
  color: string, 
  icon: string, 
  label: string,
  description: string 
}> = {
  [CookieType.IMPORTANT_URGENT]: {
    name: '树莓夹心饼干',
    color: COLORS.raspberry,
    icon: '🍓',
    label: '重要且紧急',
    description: '火烧眉毛啦！先吃这一块。'
  },
  [CookieType.IMPORTANT_NOT_URGENT]: {
    name: '抹茶曲奇',
    color: COLORS.matcha,
    icon: '🍵',
    label: '重要不紧急',
    description: '细嚼慢咽，这是未来的养分。'
  },
  [CookieType.URGENT_NOT_IMPORTANT]: {
    name: '柠檬塔',
    color: COLORS.lemon,
    icon: '🍋',
    label: '紧急不重要',
    description: '酸酸脆脆，快速解决掉它。'
  },
  [CookieType.NOT_IMPORTANT_NOT_URGENT]: {
    name: '蓝莓马卡龙',
    color: COLORS.blueberry,
    icon: '🫐',
    label: '不重要不紧急',
    description: '闲暇时的甜点，享受当下。'
  },
  [CookieType.MUMBLING]: {
    name: '碎碎念饼干',
    color: COLORS.mumbling,
    icon: '💭',
    label: '碎碎念',
    description: '生活中的细碎火花，温暖而轻盈。'
  }
};
