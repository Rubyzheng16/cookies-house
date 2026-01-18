// 小程序入口文件
App({
  onLaunch() {
    // 初始化
    console.log('情绪饼干屋启动');
  },
  
  onShow() {
    // 更新自定义tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  },
  
  globalData: {
    userInfo: null as any,
    showInputModal: false
  }
});
