// 折叠式未来目标管理页面
import { Goal, GoalStep } from '../../types';
import { goalService } from '../../services/goal';
import { aiService } from '../../utils/ai';
import { fragmentService } from '../../services/fragment';
import { skillTreeService } from '../../services/skillTree';

Page({
  data: {
    tab: 'goal' as 'goal' | 'skill',
    goals: [] as Goal[],
    newGoal: '',
    isLoading: false,
    expandedGoals: [] as string[],
    showInputModal: false,
    droppingGoalId: '' as string | null,
    droppingCandyOffset: 0,
    droppingCandyColor: '#FF80AB',
    skillCategories: [] as Array<{ id: string; name: string; icon: string; count: number }>
  },

  onLoad() {
    this.loadGoals();
    this.loadSkillCategories();
  },

  onShow() {
    this.loadGoals();
    this.loadSkillCategories();
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

  // 切换步骤完成状态（打勾=完成+糖果掉落，取消=还原+糖果消失）
  completeStep(e: any) {
    const { goalId, stepId } = e.currentTarget.dataset;
    const goal = (this.data.goals || []).find((g: Goal) => g.id === goalId);
    const step = goal && (goal.steps || []).find((s: { id: string; completed: boolean }) => s.id === stepId);
    const isUncomplete = step && step.completed;

    if (isUncomplete) {
      const goals = goalService.toggleStep(goalId, stepId);
      const goalsWithProgress = this.withUiFields(goals, this.data.expandedGoals || []);
      this.setData({ goals: goalsWithProgress });
      wx.showToast({ title: '已取消', icon: 'none', duration: 800 });
    } else {
      const colors = ['#FF80AB', '#81C784', '#FFF176', '#B39DDB'];
      const nextCount = (goal ? (goal.candyCount || 0) + 1 : 1);
      const color = colors[(nextCount - 1) % 4];
      const offset = Math.round((Math.random() - 0.5) * 80);
      this.setData({
        droppingGoalId: goalId as string,
        droppingCandyOffset: offset,
        droppingCandyColor: color
      });
      setTimeout(() => {
        const goals = goalService.toggleStep(goalId, stepId);
        const goalsWithProgress = this.withUiFields(goals, this.data.expandedGoals || []);
        this.setData({
          goals: goalsWithProgress,
          droppingGoalId: null,
          droppingCandyOffset: 0
        });
        wx.showToast({ title: '完成一步！', icon: 'success', duration: 1000 });
      }, 920);
    }
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

  // 切换标签
  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab as 'goal' | 'skill';
    this.setData({ tab });
  },

  // 加载技能树分类统计
  loadSkillCategories() {
    const categories = skillTreeService.getStatsByCategory();
    this.setData({ skillCategories: categories });
  },

  // 进入技能分类详情
  goToSkillDetail(e: any) {
    const category = e.currentTarget.dataset.category;
    if (!category) return;
    wx.navigateTo({
      url: `/pages/skill-detail/skill-detail?category=${category}`
    });
  },

  // 进入技能分析页
  goToSkillAnalysis() {
    wx.navigateTo({ url: '/pages/skill-analysis/skill-analysis' });
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
    const { text, type, images, voicePath } = e.detail;
    const hasContent = (text && text.trim()) || (images && images.length > 0) || voicePath;
    if (!hasContent) {
      wx.showToast({ title: '请输入内容、选择图片或录制语音', icon: 'none' });
      return;
    }
    fragmentService.addEntry((text || '').trim() || '[图片/语音]', type, { images, voicePath });
    wx.showToast({ title: '已记录', icon: 'success' });
  }
});
