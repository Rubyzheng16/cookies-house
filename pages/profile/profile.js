// 个人中心页面
Page({
  data: {
    balance: 1280,
    userInfo: null,
    settingsItems: ['个人资料', '烘焙偏好', '通知开关', '帮助与反馈']
  },

  onLoad() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    // 从存储中获取用户信息
    const userInfo = wx.getStorageSync('user_info');
    this.setData({ userInfo });
  },

  // 充值
  handleRecharge() {
    wx.showToast({
      title: '支付功能开发中',
      icon: 'none'
    });
  },

  // 设置项点击
  handleSetting(e) {
    const item = e.currentTarget.dataset.item;
    wx.showToast({
      title: `${item}功能开发中`,
      icon: 'none'
    });
  }
});
