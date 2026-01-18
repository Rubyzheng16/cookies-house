// 本地存储工具
const STORAGE_KEYS = {
  COOKIES: 'emotion_cookies',
  GOALS: 'cookie_goals',
  USER_INFO: 'user_info'
};

export const storage = {
  // 保存饼干数据
  saveCookies(cookies) {
    try {
      wx.setStorageSync(STORAGE_KEYS.COOKIES, cookies);
    } catch (e) {
      console.error('保存饼干数据失败', e);
    }
  },

  // 获取饼干数据
  getCookies() {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.COOKIES);
      return data || [];
    } catch (e) {
      console.error('获取饼干数据失败', e);
      return [];
    }
  },

  // 保存目标数据
  saveGoals(goals) {
    try {
      wx.setStorageSync(STORAGE_KEYS.GOALS, goals);
    } catch (e) {
      console.error('保存目标数据失败', e);
    }
  },

  // 获取目标数据
  getGoals() {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.GOALS);
      return data || [];
    } catch (e) {
      console.error('获取目标数据失败', e);
      return [];
    }
  },

  // 保存用户信息
  saveUserInfo(userInfo) {
    try {
      wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
    } catch (e) {
      console.error('保存用户信息失败', e);
    }
  },

  // 获取用户信息
  getUserInfo() {
    try {
      return wx.getStorageSync(STORAGE_KEYS.USER_INFO) || null;
    } catch (e) {
      console.error('获取用户信息失败', e);
      return null;
    }
  }
};
