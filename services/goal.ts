// 目标管理服务
import { Goal, GoalStep } from '../types';
import { storage } from '../utils/storage';

export const goalService = {
  // 获取所有目标
  getGoals(): Goal[] {
    return storage.getGoals();
  },

  // 保存目标
  saveGoals(goals: Goal[]) {
    storage.saveGoals(goals);
  },

  // 添加目标
  addGoal(goal: Goal): Goal[] {
    const goals = this.getGoals();
    goals.unshift(goal);
    this.saveGoals(goals);
    return goals;
  },

  // 更新目标
  updateGoal(goalId: string, updates: Partial<Goal>): Goal[] {
    const goals = this.getGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index > -1) {
      goals[index] = Object.assign({}, goals[index], updates);
      this.saveGoals(goals);
    }
    return goals;
  },

  // 切换步骤完成状态（可重复打勾/取消）
  toggleStep(goalId: string, stepId: string): Goal[] {
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

  // 删除整个目标
  deleteGoal(goalId: string): Goal[] {
    const goals = this.getGoals().filter(g => g.id !== goalId);
    this.saveGoals(goals);
    return goals;
  },

  // 编辑步骤文案
  updateStepText(goalId: string, stepId: string, text: string): Goal[] {
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
  }
};
