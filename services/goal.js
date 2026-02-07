// 目标管理服务
import { storage } from '../utils/storage.js';

export const goalService = {
  // 获取所有目标
  getGoals() {
    return storage.getGoals();
  },

  // 保存目标
  saveGoals(goals) {
    storage.saveGoals(goals);
  },

  // 添加目标
  addGoal(goal) {
    const goals = this.getGoals();
    goals.push(goal);
    this.saveGoals(goals);
    return goals;
  },

  // 切换步骤完成状态（可重复打勾/取消）
  toggleStep(goalId, stepId) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const step = goal.steps.find(s => s.id === stepId);
      if (step) {
        step.completed = !step.completed;
        goal.candyCount = Math.max(0, (goal.candyCount || 0) + (step.completed ? 1 : -1));
        goal.isCompleted = goal.steps.every(s => s.completed);
        this.saveGoals(goals);
      }
    }
    return goals;
  },

  // 编辑步骤文案
  updateStepText(goalId, stepId, text) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const step = goal.steps.find(s => s.id === stepId);
      if (step) {
        step.text = text;
        this.saveGoals(goals);
      }
    }
    return goals;
  },

  // 删除整个目标
  deleteGoal(goalId) {
    const goals = this.getGoals().filter(g => g.id !== goalId);
    this.saveGoals(goals);
    return goals;
  }
};
