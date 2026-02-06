// 个人中心页面
const auth = require('../../services/auth.js');

// 本地存储的昵称、头像 key（后端用户无昵称头像时使用）
const PROFILE_NICKNAME = 'profile_nickname';
const PROFILE_AVATAR = 'profile_avatar';
const NOTIFICATION_KEY = 'profile_notification_on';

Page({
  data: {
    balance: 1280,
    userInfo: null,
    notificationOn: true,
  },

  onLoad() {
    if (!auth.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/auth/login' });
      return;
    }
    this.loadUserInfo();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  onShow() {
    this.loadUserInfo();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  loadUserInfo() {
    const user = auth.getUser();
    const nickName = wx.getStorageSync(PROFILE_NICKNAME) || (user && user.nickName) || '首席烘焙师';
    const avatarUrl = wx.getStorageSync(PROFILE_AVATAR) || (user && user.avatarUrl) || '';
    const notificationOn = wx.getStorageSync(NOTIFICATION_KEY);
    this.setData({
      userInfo: user ? { ...user, nickName, avatarUrl } : { nickName, avatarUrl },
      notificationOn: notificationOn === undefined ? true : !!notificationOn,
    });
  },

  goProfileEdit() {
    wx.navigateTo({ url: '/pages/profile/edit/edit' });
  },

  goAiSettings() {
    wx.navigateTo({ url: '/pages/profile/ai/ai' });
  },

  onNotificationChange(e) {
    const value = e.detail.value;
    wx.setStorageSync(NOTIFICATION_KEY, value);
    this.setData({ notificationOn: value });
    wx.showToast({ title: value ? '已开启通知' : '已关闭通知', icon: 'none' });
  },

  handleRecharge() {
    wx.showToast({ title: '支付功能开发中', icon: 'none' });
  },
});
