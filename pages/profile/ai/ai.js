const AI_KEY_STORAGE = 'ai_api_key';

Page({
  data: {
    keyInput: '',
    showKey: false,
    hasKey: false,
  },

  onLoad() {
    const stored = wx.getStorageSync(AI_KEY_STORAGE) || '';
    this.setData({
      keyInput: stored,
      hasKey: !!stored,
    });
  },

  onShow() {
    const stored = wx.getStorageSync(AI_KEY_STORAGE) || '';
    this.setData({
      keyInput: stored,
      hasKey: !!stored,
    });
  },

  onKeyInput(e) {
    this.setData({ keyInput: e.detail.value });
  },

  toggleShowKey() {
    this.setData({ showKey: !this.data.showKey });
  },

  saveKey() {
    const key = (this.data.keyInput || '').trim();
    if (!key) {
      wx.showToast({ title: '请先粘贴 API Key', icon: 'none' });
      return;
    }
    wx.setStorageSync(AI_KEY_STORAGE, key);
    this.setData({ hasKey: true });
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  clearKey() {
    const that = this;
    wx.showModal({
      title: '清除密钥',
      content: '仅会从本机小程序中删除，不会影响官网上的密钥本身。',
      success(res) {
        if (res.confirm) {
          wx.removeStorageSync(AI_KEY_STORAGE);
          that.setData({ keyInput: '', hasKey: false });
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      },
    });
  },
});

