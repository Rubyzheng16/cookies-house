// 与 TypeScript 版本保持一致的 JS 配置
// 供纯 JS 文件（如 utils/ai.js）在运行时使用
//
// 【切换版本】修改下面这一行即可：
// - true   = 真机调试版（局域网 IP，手机和电脑需同一 WiFi）
// - false  = 正式/体验版（用域名，需部署后端到公网并配置 HTTPS）

const USE_LOCAL_DEV = true;

// 真机调试：电脑的局域网 IP，用 ipconfig 查看
const LOCAL_DEV_URL = 'http://192.168.88.95:3000';
// 正式/体验版：替换为你的实际后端域名
const PROD_URL = 'https://api.your-domain.com';

export const API_BASE_URL = USE_LOCAL_DEV ? LOCAL_DEV_URL : PROD_URL;

