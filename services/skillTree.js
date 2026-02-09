// 技能树服务
import { storage } from '../utils/storage.js';
import { SKILL_TREE_CATEGORIES } from '../constants/index.js';

function genId() {
  return Math.random().toString(36).substr(2, 9);
}

function getNowStr() {
  const d = new Date();
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export const skillTreeService = {
  /** 获取技能列表，可按分类筛选 */
  getItems(categoryId) {
    const data = storage.getSkillTreeData();
    let items = data.items || [];
    if (categoryId) {
      items = items.filter((i) => i.categoryId === categoryId);
    }
    return items;
  },

  /** 新增技能 */
  addItem(item) {
    const data = storage.getSkillTreeData();
    if (!data.items) data.items = [];
    const newItem = {
      id: genId(),
      name: item.name || '',
      categoryId: item.categoryId || 'sports',
      subCategoryId: item.subCategoryId || undefined,
      loveStars: item.loveStars != null ? item.loveStars : 1,
      masteryStars: item.masteryStars != null ? item.masteryStars : 1,
      note: item.note || undefined,
      decision: item.decision || undefined,
      createdAt: getNowStr(),
      updatedAt: getNowStr()
    };
    data.items.push(newItem);
    storage.saveSkillTreeData(data);
    return newItem;
  },

  /** 更新技能 */
  updateItem(id, updates) {
    const data = storage.getSkillTreeData();
    const idx = (data.items || []).findIndex((i) => i.id === id);
    if (idx < 0) return null;
    const item = { ...data.items[idx], ...updates, updatedAt: getNowStr() };
    data.items[idx] = item;
    storage.saveSkillTreeData(data);
    return item;
  },

  /** 删除技能 */
  deleteItem(id) {
    const data = storage.getSkillTreeData();
    data.items = (data.items || []).filter((i) => i.id !== id);
    storage.saveSkillTreeData(data);
    return true;
  },

  /** 各分类统计 */
  getStatsByCategory() {
    const items = this.getItems();
    return SKILL_TREE_CATEGORIES.map((cat) => {
      const count = items.filter((i) => i.categoryId === cat.id).length;
      return { ...cat, count };
    });
  },

  /** 分析页所需聚合数据 */
  getAnalysisData() {
    const items = this.getItems();
    const byCategory = {};
    SKILL_TREE_CATEGORIES.forEach((c) => {
      byCategory[c.id] = { id: c.id, name: c.name, icon: c.icon, items: [], count: 0 };
    });
    items.forEach((i) => {
      const cat = byCategory[i.categoryId];
      if (cat) {
        cat.items.push(i);
        cat.count++;
      }
    });
    return {
      total: items.length,
      byCategory: Object.values(byCategory),
      continueCount: items.filter((i) => i.decision === 'continue').length,
      letGoCount: items.filter((i) => i.decision === 'let_go').length
    };
  },

  /** 根据 id 获取分类信息 */
  getCategoryById(id) {
    return SKILL_TREE_CATEGORIES.find((c) => c.id === id) || null;
  }
};
