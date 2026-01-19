// 折叠式未来目标管理页面
import { Goal, GoalStep } from '../../types';
import { goalService } from '../../services/goal';
import { aiService } from '../../utils/ai';

Page({
  data: {
    goals: [] as Goal[],
    newGoal: '',
    isLoading: false,
    expandedGoals: [] as string[],
    showInputModal: false
  },

  onLoad() {
    this.loadGoals();
  },

  onShow() {
    this.loadGoals();
    // 更新自定义tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },

  loadGoals() {
    const goals = goalService.getGoals();
    // 计算每个目标的进度百分比
    const goalsWithProgress = goals.map(goal => {
      const completedCount = goal.steps.filter(s => s.completed).length;
      const progress = goal.steps.length > 0 
        ? Math.round((completedCount / goal.steps.length) * 100) 
        : 0;
      return Object.assign({}, goal, {
        progress: progress
      });
    });
    this.setData({ goals: goalsWithProgress });
  },

  // 输入框变化
  onInputChange(e: any) {
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
        const goalSteps: GoalStep[] = steps.map((text: string) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: text.trim(),
          completed: false
        }));

        const goal: Goal = {
          id: Math.random().toString(36).substr(2, 9),
          title: this.data.newGoal,
          steps: goalSteps,
          candyCount: 0,
          isCompleted: false
        };

        const goals = goalService.addGoal(goal);
        // 计算进度
        const goalsWithProgress = goals.map(g => {
          const completedCount = g.steps.filter(s => s.completed).length;
          const progress = g.steps.length > 0 
            ? Math.round((completedCount / g.steps.length) * 100) 
            : 0;
          return Object.assign({}, g, {
            progress: progress
          });
        });
        this.setData({
          goals: goalsWithProgress,
          newGoal: ''
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
  completeStep(e: any) {
    const { goalId, stepId } = e.currentTarget.dataset;
    
    setTimeout(() => {
      const goals = goalService.completeStep(goalId, stepId);
      // 重新计算进度
      const goalsWithProgress = goals.map(goal => {
        const completedCount = goal.steps.filter(s => s.completed).length;
        const progress = goal.steps.length > 0 
          ? Math.round((completedCount / goal.steps.length) * 100) 
          : 0;
        return Object.assign({}, goal, {
          progress: progress
        });
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
  toggleExpand(e: any) {
    const goalId = e.currentTarget.dataset.goalId;
    const expanded = this.data.expandedGoals;
    const index = expanded.indexOf(goalId);
    
    if (index > -1) {
      expanded.splice(index, 1);
    } else {
      expanded.push(goalId);
    }
    
    this.setData({ expandedGoals: expanded });
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
    const fragmentService = require('../../services/fragment').fragmentService;
    fragmentService.addEntry(text, type);
    
    wx.showToast({
      title: '已记录',
      icon: 'success'
    });
  }
});
