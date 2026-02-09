// 后端 API 地址配置
//
// 【切换版本】修改 USE_LOCAL_DEV 即可：
// - true   = 真机调试版（局域网 IP）
// - false  = 正式/体验版（用域名）

const USE_LOCAL_DEV = true;

// 本地开发默认使用 localhost:3000（需在本机启动后端）
const LOCAL_DEV_URL = 'http://localhost:3000';
const PROD_URL = 'https://api.your-domain.com';

export const API_BASE_URL = USE_LOCAL_DEV ? LOCAL_DEV_URL : PROD_URL;
