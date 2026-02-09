// 丰容板块详情页
import { enrichmentService } from '../../services/enrichment.js';
import { aiService } from '../../utils/ai.js';

Page({
  data: {
    category: null,
    categoryInfo: null,
    history: [],
    editMode: false
  },

  onLoad(options) {
    const category = options.category || '';
    const categoryInfo = enrichmentService.getCategoryById(category);
    const history = enrichmentService.getPanelHistory(category);

    this.setData({
      category,
      categoryInfo: categoryInfo || { id: category, name: category, icon: '📦' },
      history
    });

    if (categoryInfo) {
      wx.setNavigationBarTitle({
        title: `${categoryInfo.icon} ${categoryInfo.name}`
      });
    }
  },

  // 右上角 + 添加：手动或 AI 生成丰容内容
  onAdd() {
    const category = this.data.category;
    if (!category) return;
    wx.showActionSheet({
      itemList: ['手动添加', 'AI 生成一条'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.addManualRecord(category);
        } else if (res.tapIndex === 1) {
          this.addAiRecord(category);
        }
      }
    });
  },

  addManualRecord(category) {
    wx.showModal({
      title: '添加丰容内容',
      editable: true,
      placeholderText: '写下你想尝试的丰容小任务...',
      success: (res) => {
        if (!res.confirm) return;
        const text = (res.content || '').trim();
        if (!text) {
          wx.showToast({ title: '内容不能为空', icon: 'none' });
          return;
        }
        const history = enrichmentService.addPanelRecord(category, text);
        this.setData({ history });
        wx.showToast({ title: '已添加', icon: 'success' });
      }
    });
  },

  async addAiRecord(category) {
    if (!enrichmentService.canFetchMoreFortune()) {
      wx.showToast({ title: '今日已生成 5 个，明天再来吧', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '生成中...' });
    const result = await aiService.generateFortune(category);
    wx.hideLoading();

    if (!result || !result.content) {
      wx.showToast({ title: '生成失败，请稍后重试', icon: 'none' });
      return;
    }

    // 计入今日 AI 生成次数（共用幸运饼干每日 5 次的限制）
    enrichmentService.saveTodayFortune({
      category,
      content: result.content,
      completed: true,
      completedAt: Date.now()
    });

    const history = enrichmentService.addPanelRecord(category, result.content);
    this.setData({ history });
    wx.showToast({ title: '已生成', icon: 'success' });
  },

  // 预留编辑入口：后续可做「批量管理 / 重命名板块」等
  onEdit() {
    this.setData({ editMode: !this.data.editMode });
  },

  // 点击某条记录删除（编辑模式下生效）
  onDeleteItem(e) {
    if (!this.data.editMode) return;
    const index = e.currentTarget.dataset.index;
    const category = this.data.category;
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条丰容记录吗？',
      success: (res) => {
        if (!res.confirm) return;
        const history = enrichmentService.deletePanelRecord(category, index);
        this.setData({ history });
        wx.showToast({ title: '已删除', icon: 'success' });
      }
    });
  }
});
