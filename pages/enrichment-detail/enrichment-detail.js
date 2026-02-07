// 丰荣板块详情页
import { enrichmentService } from '../../services/enrichment.js';

Page({
  data: {
    category: null,
    categoryInfo: null,
    history: []
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
  }
});
