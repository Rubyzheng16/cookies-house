// 可视化状态感知页面
import { DayFolder } from '../../types';
import { fragmentService } from '../../services/fragment';
import { dateUtils } from '../../utils/date';
import { aiService } from '../../utils/ai';

Page({
  data: {
    folders: [] as DayFolder[],
    tab: 'daily' as 'daily' | 'trends',
    todayFolder: null as DayFolder | null,
    showInputModal: false
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
    // 更新自定义tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
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
  switchTab(e: any) {
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
  getCount(type: string) {
    return (this.data.todayFolder?.entries || []).filter((e: any) => e.type === type).length;
  },

  // 获取最近7天的文件夹
  getRecentFolders() {
    return this.data.folders.slice(0, 7).reverse();
  },

  // 获取柱状图高度
  getBarHeight(folder: DayFolder) {
    const height = Math.min(100, folder.entries.length * 15 + 10);
    return height;
  },

  // 获取短日期
  getShortDate(date: string) {
    return date.split('/').slice(1).join('/');
  },

  // 加号按钮点击事件
  onAddButtonClick() {
    this.setData({ showInputModal: true });
  },

  // 隐藏输入弹窗
  hideInputModal() {
    this.setData({ showInputModal: false });
  },

  // 处理输入确认
  handleInputConfirm(e: any) {
    const { text, type } = e.detail;
    fragmentService.addEntry(text, type);
    
    // 重新加载数据
    this.loadData();
    
    wx.showToast({
      title: '已记录',
      icon: 'success'
    });
  }
});
