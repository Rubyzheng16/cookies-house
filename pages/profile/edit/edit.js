const auth = require('../../../services/auth.js');

const PROFILE_NICKNAME = 'profile_nickname';
const PROFILE_AVATAR = 'profile_avatar';

Page({
  data: {
    nickName: '',
    avatarUrl: '',
    showNicknameInput: false,
    nickNameInput: '',
  },

  onLoad() {
    if (!auth.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/auth/login' });
      return;
    }
    this.syncFromStorage();
  },

  onShow() {
    this.syncFromStorage();
  },

  syncFromStorage() {
    const user = auth.getUser();
    const nickName = wx.getStorageSync(PROFILE_NICKNAME) || (user && user.nickName) || '首席烘焙师';
    const avatarUrl = wx.getStorageSync(PROFILE_AVATAR) || (user && user.avatarUrl) || '';
    this.setData({ nickName, avatarUrl, nickNameInput: nickName });
  },

  changeNickname() {
    this.setData({
      showNicknameInput: true,
      nickNameInput: this.data.nickName || '首席烘焙师',
    });
  },

  onNicknameInput(e) {
    this.setData({ nickNameInput: e.detail.value });
  },

  cancelNickname() {
    this.setData({ showNicknameInput: false, nickNameInput: this.data.nickName });
  },

  saveNickname() {
    const val = (this.data.nickNameInput || '').trim();
    if (!val) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    wx.setStorageSync(PROFILE_NICKNAME, val);
    this.setData({ nickName: val, showNicknameInput: false, nickNameInput: val });
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  changeAvatar() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempPath = res.tempFiles[0].tempFilePath;
        const fs = wx.getFileSystemManager();
        fs.saveFile({
          tempFilePath: tempPath,
          success(saveRes) {
            wx.setStorageSync(PROFILE_AVATAR, saveRes.savedFilePath);
            that.setData({ avatarUrl: saveRes.savedFilePath });
            wx.showToast({ title: '头像已更换', icon: 'success' });
          },
          fail() {
            wx.setStorageSync(PROFILE_AVATAR, tempPath);
            that.setData({ avatarUrl: tempPath });
            wx.showToast({ title: '头像已更换', icon: 'success' });
          },
        });
      },
      fail() {
        wx.showToast({ title: '取消选择', icon: 'none' });
      },
    });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success(res) {
        if (res.confirm) {
          auth.clearAuth();
          wx.reLaunch({ url: '/pages/auth/login' });
        }
      },
    });
  },
});
