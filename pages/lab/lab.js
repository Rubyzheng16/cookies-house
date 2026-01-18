// 可视化状态感知页面
import { fragmentService } from '../../services/fragment.js';
import { dateUtils } from '../../utils/date.js';
import { aiService } from '../../utils/ai.js';

Page({
  data: {
    folders: [],
    tab: 'daily',
    todayFolder: null
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const folders = fragmentService.getFolders();
    const todayStr = dateUtils.getTodayString();
    const todayFolder = folders.find(f => f.date === todayStr);
    
    this.setData({
      folders,
      todayFolder: todayFolder || null
    });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
  },

  // 分析今日
  async analyzeToday() {
    const todayStr = dateUtils.getTodayString();
    const folder = this.data.folders.find(f => f.date === todayStr);
    
    if (!folder || folder.entries.length === 0) {
      wx.showToast({
        title: '暂无内容可分析',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '分析中...' });

    try {
      const analysis = await aiService.analyzeToday(folder.entries);
      const folders = fragmentService.updateAnalysis(todayStr, analysis);
      this.setData({ folders, todayFolder: folders.find(f => f.date === todayStr) || null });
    } catch (error) {
      wx.showToast({
        title: '分析失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 获取统计数量
  getCount(type) {
    return (this.data.todayFolder?.entries || []).filter(e => e.type === type).length;
  },

  // 获取最近7天的文件夹
  getRecentFolders() {
    return this.data.folders.slice(0, 7).reverse();
  },

  // 获取柱状图高度
  getBarHeight(folder) {
    const height = Math.min(100, folder.entries.length * 15 + 10);
    return height;
  },

  // 获取短日期
  getShortDate(date) {
    return date.split('/').slice(1).join('/');
  }
});
