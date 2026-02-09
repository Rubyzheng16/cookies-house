// 折叠式未来目标管理页面
import { goalService } from '../../services/goal.js';
import { aiService } from '../../utils/ai.js';
import { fragmentService } from '../../services/fragment.js';
import { skillTreeService } from '../../services/skillTree.js';

Page({
  data: {
    tab: 'goal', // 默认以目标拆解为主
    goals: [],
    newGoal: '',
    isLoading: false,
    expandedGoals: [],
    showInputModal: false,
    droppingGoalId: '',
    droppingCandyOffset: 0,
    droppingCandyColor: '#FF80AB',
    skillCategories: []
  },

  onLoad() {
    this.loadGoals();
    this.loadSkillCategories();
  },

  onShow() {
    this.loadGoals();
    this.loadSkillCategories();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
  },

  // 加载技能树分类统计
  loadSkillCategories() {
    const categories = skillTreeService.getStatsByCategory();
    this.setData({ skillCategories: categories });
  },

  // 进入技能分类详情
  goToSkillDetail(e) {
    const category = e.currentTarget.dataset.category;
    if (!category) return;
    wx.navigateTo({ url: `/pages/skill-detail/skill-detail?category=${category}` });
  },

  // 进入技能分析页
  goToSkillAnalysis() {
    wx.navigateTo({ url: '/pages/skill-analysis/skill-analysis' });
  },

  // 长期目标板块右上角「添加」：新增一个长期目标（仅标题，可稍后拆解）
  onAddLongTermGoal() {
    wx.showModal({
      title: '添加长期目标',
      editable: true,
      placeholderText: '输入目标名称',
      success: (res) => {
        if (!res.confirm) return;
        const title = (res.content || '').trim();
        if (!title) {
          wx.showToast({ title: '请输入目标名称', icon: 'none' });
          return;
        }
        const goal = {
          id: Math.random().toString(36).substr(2, 9),
          title,
          steps: [],
          candyCount: 0,
          isCompleted: false,
          type: null
        };
        const goals = goalService.addGoal(goal);
        const goalsWithProgress = this.withUiFields(goals, this.data.expandedGoals || []);
        this.setData({ goals: goalsWithProgress });
        wx.showToast({ title: '已添加', icon: 'success' });
      }
    });
  },

  loadGoals() {
    const goals = goalService.getGoals();
    const expanded = this.data.expandedGoals || [];
    const goalsWithUi = this.withUiFields(goals, expanded);
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
    } catch (error) {
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
  completeStep(e) {
    const { goalId, stepId } = e.currentTarget.dataset;
    const goal = (this.data.goals || []).find(g => g.id === goalId);
    const step = goal && (goal.steps || []).find(s => s.id === stepId);
    const isUncomplete = step && step.completed;

    if (isUncomplete) {
      // 取消勾选：直接更新，糖果消失
      const goals = goalService.toggleStep(goalId, stepId);
      const goalsWithProgress = this.withUiFields(goals, this.data.expandedGoals || []);
      this.setData({ goals: goalsWithProgress });
      wx.showToast({ title: '已取消', icon: 'none', duration: 800 });
    } else {
      // 打勾完成：播糖果掉落动画后更新
      const colors = ['#FF80AB', '#81C784', '#FFF176', '#B39DDB'];
      const nextCount = (goal ? (goal.candyCount || 0) + 1 : 1);
      const color = colors[(nextCount - 1) % 4];
      const offset = Math.round((Math.random() - 0.5) * 80);
      this.setData({
        droppingGoalId: goalId,
        droppingCandyOffset: offset,
        droppingCandyColor: color
      });
      setTimeout(() => {
        const goals = goalService.toggleStep(goalId, stepId);
        const goalsWithProgress = this.withUiFields(goals, this.data.expandedGoals || []);
        this.setData({
          goals: goalsWithProgress,
          droppingGoalId: '',
          droppingCandyOffset: 0
        });
        wx.showToast({ title: '完成一步！', icon: 'success', duration: 1000 });
      }, 920);
    }
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

  // 为每个目标补充 UI 需要的字段：progress、nextStep、stepGroups、isExpanded
  withUiFields(goals, expandedGoals) {
    const expanded = expandedGoals || [];
    return goals.map(goal => {
      const steps = goal.steps || [];
      const completedCount = steps.filter(s => s.completed).length;
      const progress = steps.length > 0 
        ? Math.round((completedCount / steps.length) * 100) 
        : 0;
      const nextStep = steps.find(s => !s.completed) || null;
      const stepGroups = (goal.stepGroups && goal.stepGroups.length > 0)
        ? goal.stepGroups
        : chunkSteps(steps, 3);
      const typeColors = { 1: '#FF80AB', 2: '#81C784', 3: '#FFF176', 4: '#B39DDB' };
      const id = goal.id != null ? String(goal.id) : '';
      return Object.assign({}, goal, {
        progress,
        nextStep,
        stepGroups,
        typeColor: (goal.type && typeColors[goal.type]) ? typeColors[goal.type] : '#FF80AB',
        isExpanded: expanded.indexOf(id) > -1
      });
    });
  },

  // 切换展开/收起，并同步更新每个目标的 isExpanded 以便视图正确显示
  toggleExpand(e) {
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

  // 加号按钮点击（全局输入弹窗）
  onAddButtonClick() {
    this.setData({ showInputModal: true });
  },

  hideInputModal() {
    this.setData({ showInputModal: false });
  },

  handleInputConfirm(e) {
    const { text, type, images, voicePath } = e.detail;
    const hasContent = (text && text.trim()) || (images && images.length > 0) || voicePath;
    if (!hasContent) {
      wx.showToast({ title: '请输入内容、选择图片或录制语音', icon: 'none' });
      return;
    }
    fragmentService.addEntry((text || '').trim() || '[图片/语音]', type, { images, voicePath });
    wx.showToast({ title: '已记录', icon: 'success' });
  },

  // 删除目标
  deleteGoal(e) {
    const goalId = e.currentTarget.dataset.goalId;
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除该目标吗？',
      success: (res) => {
        if (!res.confirm) return;
        const goals = goalService.deleteGoal(goalId);
        const expanded = this.data.expandedGoals.filter(id => id !== goalId);
        const goalsWithProgress = this.withUiFields(goals, expanded);
        this.setData({ goals: goalsWithProgress, expandedGoals: expanded });
        wx.showToast({ title: '已删除', icon: 'none' });
      }
    });
  }
});

// 将 steps 按每组 size 个拆成多组，每组有 title + steps
function chunkSteps(steps, size) {
  if (!steps || steps.length === 0) return [];
  const groups = [];
  for (let i = 0; i < steps.length; i += size) {
    const chunk = steps.slice(i, i + size);
    const n = groups.length + 1;
    groups.push({
      title: n === 1 ? '子目标' : '阶段' + n,
      steps: chunk
    });
  }
  return groups;
}
