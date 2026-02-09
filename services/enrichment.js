// 丰容板块服务
import { storage } from '../utils/storage.js';
import { dateUtils } from '../utils/date.js';
import { ENRICHMENT_CATEGORIES } from '../constants/index.js';

const FORTUNES_PER_DAY = 5;

function getTodayFortunesList(data) {
  const todayStr = dateUtils.getTodayString();
  let list = (data.todayFortunes || []).filter(f => f.date === todayStr);
  // 兼容旧格式：todayFortune -> todayFortunes
  if (list.length === 0 && data.todayFortune && data.todayFortune.date === todayStr) {
    list = [data.todayFortune];
    data.todayFortunes = list;
    delete data.todayFortune;
    storage.saveEnrichmentData(data);
  }
  return list;
}

export const enrichmentService = {
  // 获取今日当前幸运饼干（最后一个未完成的，用于展示）
  getTodayFortune() {
    const data = storage.getEnrichmentData();
    const list = getTodayFortunesList(data);
    if (list.length === 0) return null;
    const last = list[list.length - 1];
    return last.completed ? null : last;
  },

  // 今日已生成数量
  getTodayFortuneCount() {
    const data = storage.getEnrichmentData();
    return getTodayFortunesList(data).length;
  },

  // 今日还可生成数量
  canFetchMoreFortune() {
    return this.getTodayFortuneCount() < FORTUNES_PER_DAY;
  },

  // 保存今日幸运饼干（新增一条）
  saveTodayFortune(fortune) {
    const data = storage.getEnrichmentData();
    const todayStr = dateUtils.getTodayString();
    if (!data.todayFortunes) data.todayFortunes = [];
    data.todayFortunes = data.todayFortunes.filter(f => f.date === todayStr);
    if (data.todayFortunes.length >= FORTUNES_PER_DAY) return data;
    fortune.date = todayStr;
    data.todayFortunes.push(fortune);
    storage.saveEnrichmentData(data);
    return data;
  },

  // 标记今日任务完成，并写入 litPanels（标记最后一个未完成的）
  markComplete() {
    const data = storage.getEnrichmentData();
    const list = getTodayFortunesList(data);
    const last = list[list.length - 1];
    if (!last || last.completed) return data;

    const todayStr = dateUtils.getTodayString();
    last.completed = true;
    last.completedAt = Date.now();

    const category = last.category;
    if (!data.litPanels) data.litPanels = {};
    if (!data.litPanels[category]) data.litPanels[category] = [];

    data.litPanels[category].unshift({
      date: todayStr,
      content: last.content,
      completed: true
    });

    storage.saveEnrichmentData(data);
    return data;
  },

  // 获取各板块点亮状态及完成次数
  getLitPanels() {
    const data = storage.getEnrichmentData();
    const litPanels = data.litPanels || {};

    return ENRICHMENT_CATEGORIES.map((cat) => {
      const records = litPanels[cat.id] || [];
      return {
        ...cat,
        lit: records.length > 0,
        count: records.length
      };
    });
  },

  // 获取某板块的历史完成记录
  getPanelHistory(category) {
    const data = storage.getEnrichmentData();
    return (data.litPanels && data.litPanels[category]) || [];
  },

  // 为某个丰容板块新增一条记录（手动或 AI 生成），直接记入历史列表
  addPanelRecord(category, content) {
    const data = storage.getEnrichmentData();
    const todayStr = dateUtils.getTodayString();
    if (!data.litPanels) data.litPanels = {};
    if (!data.litPanels[category]) data.litPanels[category] = [];
    data.litPanels[category].unshift({
      date: todayStr,
      content,
      completed: true
    });
    storage.saveEnrichmentData(data);
    return data.litPanels[category];
  },

  // 删除某板块的一条记录（按索引）
  deletePanelRecord(category, index) {
    const data = storage.getEnrichmentData();
    if (!data.litPanels || !data.litPanels[category]) return [];
    const list = data.litPanels[category];
    if (index < 0 || index >= list.length) return list;
    list.splice(index, 1);
    storage.saveEnrichmentData(data);
    return list;
  },

  // 根据 id 获取板块信息
  getCategoryById(id) {
    return ENRICHMENT_CATEGORIES.find((c) => c.id === id) || null;
  }
};
