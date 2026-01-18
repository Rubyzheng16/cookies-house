// 折叠式未来目标管理页面
import { goalService } from '../../services/goal.js';
import { aiService } from '../../utils/ai.js';
import { CookieType } from '../../types/index.js';

Page({
  data: {
    goals: [],
    newGoal: '',
    isLoading: false,
    expandedGoals: [],
    selectedType: null,
    quadrantTypes: [
      { type: CookieType.IMPORTANT_URGENT, color: '#FF80AB', label: '紧急重要', order: 1 },
      { type: CookieType.IMPORTANT_NOT_URGENT, color: '#81C784', label: '重要不紧急', order: 2 },
      { type: CookieType.URGENT_NOT_IMPORTANT, color: '#FFF176', label: '紧急不重要', order: 3 },
      { type: CookieType.NOT_IMPORTANT_NOT_URGENT, color: '#B39DDB', label: '不重要不紧急', order: 4 }
    ]
  },

  onLoad() {
    this.loadGoals();
  },

  onShow() {
    this.loadGoals();
  },

  loadGoals() {
    const goals = goalService.getGoals();
    // 计算每个目标的进度百分比
    const goalsWithProgress = goals.map(goal => {
      const completedCount = goal.steps.filter(s => s.completed).length;
      const progress = goal.steps.length > 0 
        ? Math.round((completedCount / goal.steps.length) * 100) 
        : 0;
      return {
        ...goal,
        progress
      };
    });
    this.setData({ goals: goalsWithProgress });
  },

  // 输入框变化
  onInputChange(e) {
    this.setData({ newGoal: e.detail.value });
  },

  // 生成步骤
  async generateSteps() {
    if (!this.data.newGoal.trim()) {
      wx.showToast({
        title: '请输入目标',
        icon: 'none'
      });
      return;
    }

    this.setData({ isLoading: true });
    wx.showLoading({ title: '拆解中...' });

    try {
      const steps = await aiService.splitGoal(this.data.newGoal);
      
      if (steps.length > 0) {
        const goalSteps = steps.map(text => ({
          id: Math.random().toString(36).substr(2, 9),
          text: text.trim(),
          completed: false
        }));

        const goal = {
          id: Math.random().toString(36).substr(2, 9),
          title: this.data.newGoal,
          steps: goalSteps,
          candyCount: 0,
          isCompleted: false,
          type: this.data.selectedType || null
        };

        const goals = goalService.addGoal(goal);
        // 计算进度
        const goalsWithProgress = goals.map(g => {
          const completedCount = g.steps.filter(s => s.completed).length;
          const progress = g.steps.length > 0 
            ? Math.round((completedCount / g.steps.length) * 100) 
            : 0;
          return {
            ...g,
            progress
          };
        });
        this.setData({
          goals: goalsWithProgress,
          newGoal: '',
          selectedType: null
        });

        wx.showToast({
          title: '拆解成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '拆解失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '拆解失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
      wx.hideLoading();
    }
  },

  // 完成步骤
  completeStep(e) {
    const { goalId, stepId } = e.currentTarget.dataset;
    
    setTimeout(() => {
      const goals = goalService.completeStep(goalId, stepId);
      // 重新计算进度
      const goalsWithProgress = goals.map(goal => {
        const completedCount = goal.steps.filter(s => s.completed).length;
        const progress = goal.steps.length > 0 
          ? Math.round((completedCount / goal.steps.length) * 100) 
          : 0;
        return {
          ...goal,
          progress
        };
      });
      this.setData({ goals: goalsWithProgress });
      
      wx.showToast({
        title: '完成一步！',
        icon: 'success',
        duration: 1000
      });
    }, 400);
  },

  // 切换展开/收起
  toggleExpand(e) {
    const goalId = e.currentTarget.dataset.goalId;
    const expanded = this.data.expandedGoals;
    const index = expanded.indexOf(goalId);
    
    if (index > -1) {
      expanded.splice(index, 1);
    } else {
      expanded.push(goalId);
    }
    
    this.setData({ expandedGoals: expanded });
  }
});
