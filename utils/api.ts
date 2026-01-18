// API请求封装
const API_BASE_URL = 'https://your-api-domain.com/api'; // 需要替换为实际的后端地址

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
}

export const api = {
  // 通用请求方法
  request<T = any>(options: RequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE_URL}${options.url}`,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
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
