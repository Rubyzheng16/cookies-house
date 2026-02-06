// 折叠式未来目标管理页面
import { goalService } from '../../services/goal.js';
import { aiService } from '../../utils/ai.js';

Page({
  data: {
    goals: [],
    newGoal: '',
    isLoading: false,
    expandedGoals: [],
    droppingGoalId: '',
  },

  onLoad() {
    this.loadGoals();
  },

  onShow() {
    this.loadGoals();
  },

  loadGoals() {
    const goals = goalService.getGoals();
    const goalsWithUi = this.withUiFields(goals);
    this.setData({ goals: goalsWithUi });
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
          type: null
        };

        const goals = goalService.addGoal(goal);
        const goalsWithProgress = this.withUiFields(goals);
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
  completeStep(e) {
    const { goalId, stepId } = e.currentTarget.dataset;
    // 触发糖果掉落动画
    this.setData({ droppingGoalId: goalId });

    setTimeout(() => {
      const goals = goalService.completeStep(goalId, stepId);
      const goalsWithProgress = this.withUiFields(goals);
      this.setData({ goals: goalsWithProgress, droppingGoalId: '' });
      
      wx.showToast({
        title: '完成一步！',
        icon: 'success',
        duration: 1000
      });
    }, 400);
  },

  // 编辑步骤内容（长按步骤）
  editStep(e) {
    const { goalId, stepId, text } = e.currentTarget.dataset;
    wx.showModal({
      title: '编辑步骤',
      editable: true,
      content: text || '',
      success: (res) => {
        const newText = res.content;
        if (!res.confirm || !newText || !newText.trim()) {
          return;
        }
        const goals = goalService.updateStepText(goalId, stepId, newText.trim());
        const goalsWithProgress = this.withUiFields(goals);
        this.setData({ goals: goalsWithProgress });
        wx.showToast({
          title: '已更新步骤',
          icon: 'success',
          duration: 800
        });
      }
    });
  },

  // 为每个目标补充 UI 需要的字段：progress、nextStep
  withUiFields(goals) {
    return goals.map(goal => {
      const completedCount = goal.steps.filter(s => s.completed).length;
      const progress = goal.steps.length > 0 
        ? Math.round((completedCount / goal.steps.length) * 100) 
        : 0;
      const nextStep = goal.steps.find(s => !s.completed) || null;
      return Object.assign({}, goal, {
        progress,
        nextStep
      });
    });
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
