// 技能分析页
import { skillTreeService } from '../../services/skillTree.js';

Page({
  data: {
    analysis: {
      total: 0,
      continueCount: 0,
      letGoCount: 0,
      byCategory: []
    }
  },

  onLoad() {
    this.loadAnalysis();
  },

  onShow() {
    this.loadAnalysis();
  },

  loadAnalysis() {
    const analysis = skillTreeService.getAnalysisData();
    this.setData({ analysis });
  }
});
