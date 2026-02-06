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
    const expanded = this.data.expandedGoals || [];
    const goalsWithUi = this.withUiFields(goals, expanded);
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
        const goalsWithProgress = this.withUiFields(goals, this.data.expandedGoals || []);
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
    } catch (error: any) {
      const isNetwork = error && error.message === 'NETWORK_ERROR';
      wx.showToast({
        title: isNetwork ? '无法连接服务器，请先启动后端' : '拆解失败，请重试',
        icon: 'none',
        duration: isNetwork ? 2800 : 2000
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

    // 等掉落动画播完（约 700ms）再更新列表，这样能看到糖果从上往下落
    setTimeout(() => {
      const goals = goalService.completeStep(goalId, stepId);
      const goalsWithProgress = this.withUiFields(goals, this.data.expandedGoals || []);
      this.setData({ goals: goalsWithProgress, droppingGoalId: null });
      wx.showToast({
        title: '完成一步！',
        icon: 'success',
        duration: 1000
      });
    }, 720);
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
        const goalsWithProgress = this.withUiFields(goals, this.data.expandedGoals || []);
        this.setData({ goals: goalsWithProgress });
        wx.showToast({
          title: '已更新步骤',
          icon: 'success',
          duration: 800
        });
      }
    });
  },

  // 为每个目标补充 UI 需要的字段：progress、nextStep、stepGroups、typeColor、isExpanded
  withUiFields(goals: Goal[], expandedGoals?: string[]): Array<Goal & { progress: number; nextStep: GoalStep | null; stepGroups: { title: string; steps: GoalStep[] }[]; typeColor?: string; isExpanded?: boolean }> {
    const typeColors: Record<number, string> = { 1: '#FF80AB', 2: '#81C784', 3: '#FFF176', 4: '#B39DDB' };
    const expanded = expandedGoals || [];
    return goals.map(goal => {
      const steps = goal.steps || [];
      const completedCount = steps.filter(s => s.completed).length;
      const progress = steps.length > 0 
        ? Math.round((completedCount / steps.length) * 100) 
        : 0;
      const nextStep = steps.find(s => !s.completed) || null;
      const groupSize = 2;
      const stepGroups: { title: string; steps: GoalStep[] }[] = [];
      for (let i = 0; i < steps.length; i += groupSize) {
        const chunk = steps.slice(i, i + groupSize);
        const groupIndex = Math.floor(i / groupSize) + 1;
        stepGroups.push({
          title: `小目标 ${groupIndex}`,
          steps: chunk
        });
      }
      const typeColor = (goal as any).type && typeColors[(goal as any).type] ? typeColors[(goal as any).type] : '#FF80AB';
      const id = goal.id != null ? String(goal.id) : '';
      return Object.assign({}, goal, {
        progress,
        nextStep,
        stepGroups,
        typeColor,
        isExpanded: expanded.indexOf(id) > -1
      });
    });
  },

  // 切换展开/收起，并同步更新每个目标的 isExpanded 以便视图正确显示
  toggleExpand(e: any) {
    const goalId = e.currentTarget.dataset.goalId != null ? String(e.currentTarget.dataset.goalId) : '';
    const expanded = (this.data.expandedGoals || []).slice();
    const index = expanded.indexOf(goalId);
    if (index > -1) {
      expanded.splice(index, 1);
    } else {
      expanded.push(goalId);
    }
    const goals = this.withUiFields(this.data.goals || [], expanded);
    this.setData({ expandedGoals: expanded, goals });
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
        const expanded = this.data.expandedGoals.filter((id: string) => id !== goalId);
        const goalsWithUi = this.withUiFields(goals, expanded);
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
