// 个人中心页面
Page({
  data: {
    balance: 1280,
    userInfo: null as any,
    settingsItems: ['个人资料', '烘焙偏好', '通知开关', '帮助与反馈'],
    showInputModal: false
  },

  onLoad() {
    this.loadUserInfo();
    // 更新自定义tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      });
    }
  },

  onShow() {
    // 更新自定义tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      });
    }
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
  handleSetting(e: any) {
    const item = e.currentTarget.dataset.item;
    wx.showToast({
      title: `${item}功能开发中`,
      icon: 'none'
    });
  },

  // 加号按钮点击事件
  onAddButtonClick() {
    this.setData({ showInputModal: true });
  },

  // 隐藏输入弹窗
  hideInputModal() {
    this.setData({ showInputModal: false });
  },

  // 处理输入确认
  handleInputConfirm(e: any) {
    const { text, type, images, voicePath } = e.detail;
    const hasContent = (text && text.trim()) || (images && images.length > 0) || voicePath;
    if (!hasContent) {
      wx.showToast({ title: '请输入内容、选择图片或录制语音', icon: 'none' });
      return;
    }
    const fragmentService = require('../../services/fragment').fragmentService;
    fragmentService.addEntry((text || '').trim() || '[图片/语音]', type, { images, voicePath });
    wx.showToast({ title: '已记录', icon: 'success' });
  }
});
