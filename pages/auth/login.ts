// 登录 / 注册页：使用微信一键登录，对接后端 /api/auth/login
import * as auth from '../../services/auth';
import type { User } from '../../types';

declare const wx: any;

const app = getApp();

Page({
  data: {
    loading: false as boolean,
  },

  onLoad() {
    // 如果已经有 token，直接跳转到饼干屋（文件夹页）
    if (auth.isLoggedIn()) {
      this.goToIndex();
    }
  },

  // 一键登录按钮
  handleLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    wx.login({
      success: (res: any) => {
        if (!res.code) {
          wx.showToast({ title: '登录失败，请重试', icon: 'none' });
          this.setData({ loading: false });
          return;
        }
        auth
          .login(res.code)
          .then((user: User) => {
            if (app && (app as any).globalData) {
              (app as any).globalData.userInfo = user;
            }
            this.goToIndex();
          })
          .catch(() => {
            wx.showToast({ title: '登录失败，请稍后再试', icon: 'none' });
          })
          .finally(() => {
            this.setData({ loading: false });
          });
      },
      fail: () => {
        wx.showToast({ title: '微信登录失败', icon: 'none' });
        this.setData({ loading: false });
      },
    });
  },

  goToIndex() {
    // 登录完成后进入 tabBar 的“我的”页
    wx.switchTab({ url: '/pages/index/index' });
  },
});

