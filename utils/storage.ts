// 本地存储工具
const STORAGE_KEYS = {
  COOKIES: 'emotion_cookies',
  GOALS: 'cookie_goals',
  USER_INFO: 'user_info',
  SKILL_TREE: 'skill_tree_data',
  ABOUT_ME: 'about_me_data'
};

export const storage = {
  // 保存饼干数据
  saveCookies(cookies: any[]) {
    try {
      wx.setStorageSync(STORAGE_KEYS.COOKIES, cookies);
    } catch (e) {
      console.error('保存饼干数据失败', e);
    }
  },

  // 获取饼干数据
  getCookies(): any[] {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.COOKIES);
      return data || [];
    } catch (e) {
      console.error('获取饼干数据失败', e);
      return [];
    }
  },

  // 保存目标数据
  saveGoals(goals: any[]) {
    try {
      wx.setStorageSync(STORAGE_KEYS.GOALS, goals);
    } catch (e) {
      console.error('保存目标数据失败', e);
    }
  },

  // 获取目标数据
  getGoals(): any[] {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.GOALS);
      return data || [];
    } catch (e) {
      console.error('获取目标数据失败', e);
      return [];
    }
  },

  // 保存用户信息
  saveUserInfo(userInfo: any) {
    try {
      wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
    } catch (e) {
      console.error('保存用户信息失败', e);
    }
  },

  // 获取用户信息
  getUserInfo(): any {
    try {
      return wx.getStorageSync(STORAGE_KEYS.USER_INFO) || null;
    } catch (e) {
      console.error('获取用户信息失败', e);
      return null;
    }
  },

  // 获取技能树数据
  getSkillTreeData(): { items: any[] } {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.SKILL_TREE);
      return data || { items: [] };
    } catch (e) {
      console.error('获取技能树数据失败', e);
      return { items: [] };
    }
  },

  // 保存技能树数据
  saveSkillTreeData(data: { items: any[] }) {
    try {
      wx.setStorageSync(STORAGE_KEYS.SKILL_TREE, data);
    } catch (e) {
      console.error('保存技能树数据失败', e);
    }
  },

  // 获取关于我数据（头像 + 词语泡泡）
  getAboutMe(): { imagePath: string | null; words: string[] } {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.ABOUT_ME);
      return data || { imagePath: null, words: [] };
    } catch (e) {
      console.error('获取关于我数据失败', e);
      return { imagePath: null, words: [] };
    }
  },

  // 保存关于我数据
  saveAboutMe(data: { imagePath: string | null; words: string[] }) {
    try {
      wx.setStorageSync(STORAGE_KEYS.ABOUT_ME, data);
    } catch (e) {
      console.error('保存关于我数据失败', e);
    }
  }
};
