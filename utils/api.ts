// API 请求封装（与后端 REST 风格一致，带登录态时自动加 Authorization）
import { API_BASE_URL } from '../config';
import { getToken } from '../services/auth';

const BASE = `${API_BASE_URL}/api`;

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
}

export const api = {
  request<T = any>(options: RequestOptions): Promise<T> {
    const token = getToken();
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE}${options.url}`,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data as T);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 获取碎片列表
  getFragments(date?: string) {
    return this.request({
      url: '/fragments',
      method: 'GET',
      data: { date }
    });
  },

  // 创建碎片
  createFragment(data: { content: string; type: string; quadrant?: string }) {
    return this.request({
      url: '/fragments',
      method: 'POST',
      data
    });
  },

  // 分析碎片
  analyzeFragments(date: string) {
    return this.request({
      url: '/analysis/daily',
      method: 'POST',
      data: { date }
    });
  },

  // 获取目标列表
  getGoals() {
    return this.request({
      url: '/goals',
      method: 'GET'
    });
  },

  // 创建目标
  createGoal(data: { title: string }) {
    return this.request({
      url: '/goals',
      method: 'POST',
      data
    });
  },

  // AI拆解目标
  splitGoal(goalId: string) {
    return this.request({
      url: `/goals/${goalId}/split`,
      method: 'POST'
    });
  },

  // 更新步骤状态
  updateStepStatus(goalId: string, stepId: string, completed: boolean) {
    return this.request({
      url: `/goals/${goalId}/steps/${stepId}`,
      method: 'PUT',
      data: { completed }
    });
  }
};
