// 小程序入口文件（云端同步：启动时拉取、切回前台时自动上传）
const auth = require('./services/auth.js');
const sync = require('./services/sync.js');

let _uploadTimer = null;

App({
  onLaunch() {
    console.log('情绪饼干屋启动');
    // 已登录时从云端恢复数据（换设备/重装后能拿到云端数据）
    if (auth.isLoggedIn()) {
      sync.downloadAndRestore().catch(() => {});
    }
  },

  onShow() {
    // 切回前台后延迟 2 秒自动上传到云端，减少占本地内存
    if (_uploadTimer) clearTimeout(_uploadTimer);
    if (!auth.isLoggedIn()) return;
    _uploadTimer = setTimeout(() => {
      _uploadTimer = null;
      sync.uploadSnapshot().catch(() => {});
    }, 2000);
  },

  globalData: {
    userInfo: null
  }
});
