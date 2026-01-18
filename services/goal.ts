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
      goals[index] = { ...goals[index], ...updates };
      this.saveGoals(goals);
    }
    return goals;
  },

  // 完成步骤
  completeStep(goalId: string, stepId: string): Goal[] {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const step = goal.steps.find(s => s.id === stepId);
      if (step && !step.completed) {
        step.completed = true;
        goal.candyCount = goal.candyCount + 1;
        goal.isCompleted = goal.steps.every(s => s.completed);
        this.saveGoals(goals);
      }
    }
    return goals;
  }
};
