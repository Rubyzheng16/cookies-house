// 个人中心页面
const auth = require('../../services/auth.js');
const sync = require('../../services/sync.js');

// 本地存储的昵称、头像 key（后端用户无昵称头像时使用）
const PROFILE_NICKNAME = 'profile_nickname';
const PROFILE_AVATAR = 'profile_avatar';
const NOTIFICATION_KEY = 'profile_notification_on';

Page({
  data: {
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

  openDataBackupMenu() {
    wx.showActionSheet({
      itemList: ['备份到云端', '从云端恢复', '导出到本机'],
      success: (res) => {
        if (res.tapIndex === 0) this.backupToCloud();
        else if (res.tapIndex === 1) this.restoreFromCloud();
        else this.exportData();
      }
    });
  },

  backupToCloud() {
    wx.showLoading({ title: '上传中…' });
    sync.uploadSnapshot()
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '已备份到云端', icon: 'success' });
      })
      .catch((err) => {
        wx.hideLoading();
        wx.showToast({ title: err.message || '备份失败', icon: 'none' });
      });
  },

  restoreFromCloud() {
    wx.showModal({
      title: '从云端恢复',
      content: '将用云端数据覆盖当前本机数据，是否继续？',
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '恢复中…' });
        sync.downloadAndRestore()
          .then((result) => {
            wx.hideLoading();
            if (result && result.hasData) {
              wx.showToast({ title: '已从云端恢复', icon: 'success' });
            } else {
              wx.showToast({ title: '云端暂无数据', icon: 'none' });
            }
          })
          .catch((err) => {
            wx.hideLoading();
            wx.showToast({ title: err.message || '恢复失败', icon: 'none' });
          });
      }
    });
  },

  exportData() {
    wx.showActionSheet({
      itemList: ['导出为可读文本（适合查看）', '导出完整数据（适合恢复）'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this._exportReadable();
        } else {
          this._exportJson();
        }
      }
    });
  },

  _exportReadable() {
    const cookies = wx.getStorageSync('emotion_cookies') || [];
    const typeNames = { IMPORTANT_URGENT: '重要且紧急', IMPORTANT_NOT_URGENT: '重要不紧急', URGENT_NOT_IMPORTANT: '紧急不重要', NOT_IMPORTANT_NOT_URGENT: '不重要不紧急', MUMBLING: '碎碎念' };
    const lines = ['=== 饼干记 · 数据备份 ===', '', '导出时间：' + new Date().toLocaleString('zh-CN'), ''];
    if (cookies.length === 0) {
      lines.push('暂无记录');
    } else {
      cookies.forEach((folder) => {
        lines.push('【' + folder.date + '】');
        (folder.entries || []).forEach((e) => {
          const typeLabel = typeNames[e.type] || e.type || '碎碎念';
          const text = (e.text || '').trim() || '[无文字]';
          const imgNote = (e.images && e.images.length) ? ' (含 ' + e.images.length + ' 张图片)' : '';
          const voiceNote = e.voicePath ? ' (含语音)' : '';
          lines.push('  • [' + typeLabel + '] ' + text + imgNote + voiceNote);
        });
        lines.push('');
      });
    }
    lines.push('---', '说明：图片、语音为本地路径，备份仅保留文字。完整数据请选「导出完整数据」。');
    const text = lines.join('\n');
    this._copyToClipboard(text, '可读文本已复制，粘贴到记事本即可查看');
  },

  _exportJson() {
    const cookies = wx.getStorageSync('emotion_cookies') || [];
    const goals = wx.getStorageSync('cookie_goals') || [];
    const backup = {
      _exportTime: new Date().toISOString(),
      _tip: '饼干记完整数据，含图片路径。图片路径为设备本地路径，换设备后图片不可用。',
      emotion_cookies: cookies,
      cookie_goals: goals
    };
    const json = JSON.stringify(backup, null, 2);
    this._copyToClipboard(json, '完整数据已复制，请粘贴到 .txt 文件保存');
  },

  _copyToClipboard(data, successMsg) {
    if (data.length > 800000) {
      wx.showModal({
        title: '内容过多',
        content: '备份内容较大，建议分批导出或联系开发者。',
        showCancel: false
      });
      return;
    }
    wx.setClipboardData({
      data: data,
      success: () => {
        wx.showToast({ title: successMsg, icon: 'none', duration: 2500 });
      },
      fail: () => {
        wx.showModal({
          title: '复制失败',
          content: '请尝试分时段导出，或使用电脑微信开发者工具控制台备份。',
          showCancel: false
        });
      }
    });
  },

  onNotificationChange(e) {
    const value = e.detail.value;
    wx.setStorageSync(NOTIFICATION_KEY, value);
    this.setData({ notificationOn: value });
    wx.showToast({ title: value ? '已开启通知' : '已关闭通知', icon: 'none' });
  },
});
