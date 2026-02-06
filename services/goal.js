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

  // 完成步骤
  completeStep(goalId, stepId) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const step = goal.steps.find(s => s.id === stepId);
      if (step) {
        step.completed = true;
        goal.candyCount += 1;
        
        // 检查是否所有步骤都完成了
        if (goal.steps.every(s => s.completed)) {
          goal.isCompleted = true;
        }
        
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
