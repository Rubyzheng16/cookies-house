// AI接口调用（临时使用，后续会迁移到后端）
// 注意：小程序中不应该直接调用AI API，应该通过后端服务

export const aiService = {
  // 分析今日内容（通过后端API）
  async analyzeToday(entries) {
    try {
      const response = await wx.request({
        url: 'https://your-api-domain.com/api/analysis/daily',
        method: 'POST',
        data: {
          entries: entries.map(e => ({
            text: e.text,
            type: e.type
          }))
        }
      });
      
      if (response.statusCode === 200) {
        return response.data.analysis || '哎呀，烤箱好像出了一点小状况。';
      }
      return '分析失败，请稍后再试';
    } catch (error) {
      console.error('AI分析失败', error);
      return '分析失败，请稍后再试';
    }
  },

  // 拆解目标（通过后端API）
  async splitGoal(goalTitle) {
    try {
      const response = await wx.request({
        url: 'https://your-api-domain.com/api/goals/split',
        method: 'POST',
        data: { title: goalTitle }
      });
      
      if (response.statusCode === 200) {
        return response.data.steps || [];
      }
      return [];
    } catch (error) {
      console.error('目标拆解失败', error);
      return [];
    }
  }
};
