// 折叠式未来目标管理页面
import { Goal, GoalStep } from '../../types';
import { goalService } from '../../services/goal';
import { aiService } from '../../utils/ai';
import { fragmentService } from '../../services/fragment';

Page({
  data: {
    goals: [] as Goal[],
    newGoal: '',
    isLoading: false,
    expandedGoals: [] as string[],
    showInputModal: false,
    droppingGoalId: '' as string | null
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
    const goalsWithUi = this.withUiFields(goals);
    this.setData({ goals: goalsWithUi });
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
  completeStep(e: any) {
    const { goalId, stepId } = e.currentTarget.dataset;
    // 触发糖果掉落动画
    this.setData({ droppingGoalId: goalId as string });

    setTimeout(() => {
      const goals = goalService.completeStep(goalId, stepId);
      const goalsWithProgress = this.withUiFields(goals);
      this.setData({ goals: goalsWithProgress, droppingGoalId: null });
      
      wx.showToast({
        title: '完成一步！',
        icon: 'success',
        duration: 1000
      });
    }, 400);
  },

  // 编辑步骤内容（长按步骤）
  editStep(e: any) {
    const { goalId, stepId, text } = e.currentTarget.dataset;
    wx.showModal({
      title: '编辑步骤',
      editable: true,
      content: text || '',
      success: (res) => {
        const newText = (res as any).content as string | undefined;
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
  withUiFields(goals: Goal[]): Array<Goal & { progress: number; nextStep: GoalStep | null }> {
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
  toggleExpand(e: any) {
    const goalId = e.currentTarget.dataset.goalId;
    const expanded = [...this.data.expandedGoals];
    const index = expanded.indexOf(goalId as string);
    
    if (index > -1) {
      expanded.splice(index, 1);
    } else {
      expanded.push(goalId as string);
    }
    
    this.setData({ expandedGoals: expanded });
  },

  // 删除整个目标
  deleteGoal(e: any) {
    const goalId = e.currentTarget.dataset.goalId as string;
    wx.showModal({
      title: '删除目标',
      content: '确定要删除这个目标和它的所有步骤吗？',
      success: (res) => {
        if (!res.confirm) return;
        const goals = goalService.deleteGoal(goalId);
        const goalsWithUi = this.withUiFields(goals);
        const expanded = this.data.expandedGoals.filter(id => id !== goalId);
        this.setData({ goals: goalsWithUi, expandedGoals: expanded });
        wx.showToast({
          title: '已删除目标',
          icon: 'success',
          duration: 800
        });
      }
    });
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
    
    wx.showToast({
      title: '已记录',
      icon: 'success'
    });
  }
});
