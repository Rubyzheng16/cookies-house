// 小程序入口文件
// 登录 / 注册流程放在独立的登录页中，这里只做全局状态与 tabBar 处理
import type { User } from './types';

declare const wx: any;

App({
  onLaunch() {
    // 启动时暂时不做额外逻辑，登录交给登录页
  },

  onShow() {
    // 更新自定义tabBar选中状态（默认选中首页）
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  },

  globalData: {
    userInfo: null as User | null,
    showInputModal: false
  }
});
