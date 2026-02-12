// 与 TypeScript 版本保持一致的 JS 配置
// 供纯 JS 文件（如 utils/ai.js）在运行时使用

// 【切换版本】修改下面这一行即可：
// - true   = 真机调试版（局域网 IP，手机和电脑需同一 WiFi）
// - false  = 正式/体验版（用域名，需部署后端到公网并配置 HTTPS）

// 这里先改成 false，让所有请求都走线上服务器
const USE_LOCAL_DEV = false;

// 真机调试：本地开发用 localhost（需电脑上启动后端）
const LOCAL_DEV_URL = 'http://localhost:3000';

// 正式/体验版：HTTPS 域名，需在小程序后台配置为 request 合法域名
const PROD_URL = 'https://api.cookiediary.cn';

export const API_BASE_URL = USE_LOCAL_DEV ? LOCAL_DEV_URL : PROD_URL;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL };
}
