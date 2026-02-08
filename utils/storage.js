// 本地存储工具（兼容 require 与 import）
const STORAGE_KEYS = {
  COOKIES: 'emotion_cookies',
  GOALS: 'cookie_goals',
  USER_INFO: 'user_info',
  ENRICHMENT: 'enrichment_data',
  DIARY_PROMPT: 'diary_prompt_custom',
  USER_VIP: 'user_vip',
  COUNSELOR_DIARY: 'counselor_diary'
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

  // 获取饼干数据（确保始终返回数组，兼容旧格式）
  getCookies() {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.COOKIES);
      if (Array.isArray(data)) return data;
      // 兼容旧格式：{ folders: [...] }
      if (data && typeof data === 'object' && Array.isArray(data.folders)) return data.folders;
      return [];
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
  },

  // 获取丰容数据
  getEnrichmentData() {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.ENRICHMENT);
      return data || { todayFortune: null, litPanels: {} };
    } catch (e) {
      console.error('获取丰容数据失败', e);
      return { todayFortune: null, litPanels: {} };
    }
  },

  // 保存丰容数据
  saveEnrichmentData(data) {
    try {
      wx.setStorageSync(STORAGE_KEYS.ENRICHMENT, data);
    } catch (e) {
      console.error('保存丰容数据失败', e);
    }
  },

  // 日记指令（VIP 自定义）
  getDiaryPrompt() {
    try {
      return wx.getStorageSync(STORAGE_KEYS.DIARY_PROMPT) || '';
    } catch (e) {
      return '';
    }
  },

  saveDiaryPrompt(prompt) {
    try {
      wx.setStorageSync(STORAGE_KEYS.DIARY_PROMPT, prompt || '');
    } catch (e) {
      console.error('保存日记指令失败', e);
    }
  },

  // VIP 状态（user.vipLevel === 'vip' 或本地标记）
  isVip() {
    try {
      const stored = wx.getStorageSync(STORAGE_KEYS.USER_VIP);
      if (stored !== undefined && stored !== null) return !!stored;
      const user = wx.getStorageSync(STORAGE_KEYS.USER_INFO) || wx.getStorageSync('auth_user');
      return user && user.vipLevel === 'vip';
    } catch (e) {
      return false;
    }
  },

  setVip(vip) {
    try {
      wx.setStorageSync(STORAGE_KEYS.USER_VIP, !!vip);
    } catch (e) {
      console.error('设置 VIP 状态失败', e);
    }
  },

  // 心理日记
  getCounselorDiary() {
    try {
      return wx.getStorageSync(STORAGE_KEYS.COUNSELOR_DIARY) || '';
    } catch (e) {
      return '';
    }
  },

  saveCounselorDiary(diary) {
    try {
      wx.setStorageSync(STORAGE_KEYS.COUNSELOR_DIARY, diary || '');
    } catch (e) {
      console.error('保存心理日记失败', e);
    }
  }
};

// 兼容 require()
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storage };
}
