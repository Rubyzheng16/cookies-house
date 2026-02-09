// AI 接口调用：使用用户在「基本设置 → AI 助手密钥」中配置的 Key
// 密钥只保存在本机本地存储中，需要调用 AI 时才会读取并随请求发给你的后端 / AI 网关。

import { API_BASE_URL } from '../config';

const AI_KEY_STORAGE = 'ai_api_key';
// 直接复用后端 API 地址，本地为 http://localhost:3000
const AI_BASE_URL = API_BASE_URL;

function getLocalApiKey(): string | null {
  const key = wx.getStorageSync(AI_KEY_STORAGE) as string;
  if (!key) {
    wx.showToast({
      title: '请先在「我的-基本设置-AI 助手密钥」中配置 API Key',
      icon: 'none',
    });
    return null;
  }
  return key;
}

export const aiService = {
  // 分析今日内容
  async analyzeToday(entries: any[]): Promise<string> {
    const apiKey = getLocalApiKey();
    if (!apiKey) {
      return '尚未配置 AI 密钥';
    }

    return new Promise((resolve) => {
      wx.request({
        url: `${AI_BASE_URL}/api/analysis/daily`,
        method: 'POST',
        data: {
          apiKey, // 你的后端 / 网关用这个 Key 去调用不同 AI 官网
          entries: entries.map(e => ({
            text: e.text,
            type: e.type,
          })),
        },
        success: (response) => {
          const data = response.data as any;
          if (
            response.statusCode === 200 &&
            data &&
            data.code === 0 &&
            data.data &&
            typeof data.data.analysis === 'string'
          ) {
            resolve(data.data.analysis as string);
          } else {
            resolve(data?.message || '分析失败，请稍后再试');
          }
        },
        fail: (error) => {
          console.error('AI分析失败', error);
          resolve('分析失败，请稍后再试');
        },
      });
    });
  },

  // 拆解目标
  async splitGoal(goalTitle: string): Promise<string[]> {
    const apiKey = getLocalApiKey();
    if (!apiKey) {
      return [];
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${AI_BASE_URL}/api/goals/split`,
        method: 'POST',
        data: { title: goalTitle, apiKey },
        success: (response) => {
          const data = response.data as any;
          if (
            response.statusCode === 200 &&
            data &&
            data.code === 0 &&
            data.data &&
            Array.isArray(data.data.steps)
          ) {
            resolve(data.data.steps as string[]);
          } else {
            resolve([]);
          }
        },
        fail: (error: any) => {
          console.error('目标拆解失败', error);
          const msg = (error && error.errMsg) || '';
          if (msg.indexOf('fail') !== -1) {
            reject(new Error('NETWORK_ERROR'));
          } else {
            resolve([]);
          }
        },
      });
    });
  },

  // 长期分析（结合日记 / 丰容 / 技能树）
  async generateLongTermAnalysis(payload: {
    range?: { from?: string; to?: string };
    folders: any[];
    enrichment: any;
    skillTree: any;
  }): Promise<any | null> {
    const apiKey = getLocalApiKey();
    if (!apiKey) {
      return null;
    }

    return new Promise((resolve) => {
      wx.request({
        url: `${AI_BASE_URL}/api/analysis/long-term`,
        method: 'POST',
        data: {
          apiKey,
          ...payload,
        },
        success: (response) => {
          const data = response.data as any;
          if (
            response.statusCode === 200 &&
            data &&
            data.code === 0 &&
            data.data
          ) {
            resolve(data.data);
          } else {
            wx.showToast({
              title: data?.message || '长期分析失败',
              icon: 'none',
            });
            resolve(null);
          }
        },
        fail: (error) => {
          console.error('长期分析请求失败', error);
          wx.showToast({ title: '长期分析失败', icon: 'none' });
          resolve(null);
        },
      });
    });
  },
};

