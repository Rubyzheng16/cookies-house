// 可视化状态感知页面
import { fragmentService } from '../../services/fragment.js';
import { dateUtils } from '../../utils/date.js';
import { aiService } from '../../utils/ai.js';
import { enrichmentService } from '../../services/enrichment.js';
import { storage } from '../../utils/storage.js';

// AI 失败时的降级任务列表
const FALLBACK_TASKS = [
  '数一数地板上有多少块瓷砖。',
  '对着窗户发呆5分钟，寻找一朵像猫的云。',
  '给家里的每一盆绿植取个名字。',
  '尝试用非惯用手画一个完美的圆。',
  '闭上眼，仔细分辨空气中可以闻到的三种味道。'
];

Page({
  data: {
    folders: [],
    tab: 'daily',
    todayFolder: null,
    todayFortune: null,
    fortuneLoading: false,
    enrichmentPanels: [],
    promptInput: '',
    promptCollapsed: true,
    counselorDiary: '',
    counselorLoading: false
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const folders = fragmentService.getFolders();
    const todayStr = dateUtils.getTodayString();
    const todayFolder = folders.find(f => f.date === todayStr);

    const todayFortune = enrichmentService.getTodayFortune();
    const enrichmentPanels = enrichmentService.getLitPanels();
    const promptInput = storage.getDiaryPrompt ? storage.getDiaryPrompt() : '';
    const counselorDiary = storage.getCounselorDiary ? storage.getCounselorDiary() : '';
    
    this.setData({
      folders,
      todayFolder: todayFolder || null,
      todayFortune,
      enrichmentPanels,
      promptInput,
      counselorDiary
    });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
  },

  // 生成今日日记
  async generateDiary() {
    const todayStr = dateUtils.getTodayString();
    const folder = this.data.folders.find(f => f.date === todayStr);
    
    if (!folder || folder.entries.length === 0) {
      wx.showToast({
        title: '暂无内容可生成日记',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '正在生成日记...' });

    try {
      const diaryAnalysis = await aiService.generateDiary(folder.entries);
      if (!diaryAnalysis) {
        wx.showToast({ title: '生成失败，请检查 AI 配置', icon: 'none' });
        return;
      }
      const folders = fragmentService.updateDiaryAnalysis(todayStr, diaryAnalysis);
      this.setData({
        folders,
        todayFolder: folders.find(f => f.date === todayStr) || null
      });
      wx.showToast({ title: '日记已生成 ✨', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '生成失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 幸运饼干：用户点击抽取（每天最多 3 个）
  async onFortuneFetch() {
    if (this.data.fortuneLoading) return;
    if (!enrichmentService.canFetchMoreFortune()) {
      wx.showToast({ title: '今日已生成 3 个，明天再来吧', icon: 'none' });
      return;
    }
    this.setData({ fortuneLoading: true });

    let result = await aiService.generateFortune();
    if (!result) {
      const fallback = FALLBACK_TASKS[Math.floor(Math.random() * FALLBACK_TASKS.length)];
      result = { content: fallback, category: 'selfCare' };
    }

    const todayStr = dateUtils.getTodayString();
    const todayFortune = {
      date: todayStr,
      category: result.category,
      content: result.content,
      completed: false,
      completedAt: null
    };
    enrichmentService.saveTodayFortune(todayFortune);

    this.setData({
      todayFortune,
      fortuneLoading: false
    });
  },

  // 幸运饼干：用户点击完成
  onFortuneComplete() {
    enrichmentService.markComplete();
    this.loadData();
    wx.showToast({ title: '已点亮一个板块 ✨', icon: 'success' });
  },

  togglePromptCollapse() {
    this.setData({ promptCollapsed: !this.data.promptCollapsed });
  },

  onPromptInput(e) {
    this.setData({ promptInput: e.detail.value });
  },

  saveDiaryPrompt() {
    storage.saveDiaryPrompt(this.data.promptInput);
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  clearDiaryPrompt() {
    wx.showModal({
      title: '恢复默认',
      content: '将清空自定义指令，日记生成将使用默认提示词。',
      success: (res) => {
        if (res.confirm) {
          storage.saveDiaryPrompt('');
          this.loadData();
          wx.showToast({ title: '已恢复默认', icon: 'success' });
        }
      }
    });
  },

  // 心理日记：根据所有记录生成
  async generateCounselorDiary() {
    const folders = this.data.folders.filter(f => f.entries && f.entries.length > 0);
    if (folders.length === 0) {
      wx.showToast({ title: '暂无记录可生成', icon: 'none' });
      return;
    }

    this.setData({ counselorLoading: true });
    wx.showLoading({ title: '正在生成心理日记...' });

    try {
      const diary = await aiService.generateCounselorDiary(folders);
      if (diary) {
        storage.saveCounselorDiary && storage.saveCounselorDiary(diary);
        this.setData({
          counselorDiary: diary,
          counselorLoading: false
        });
        wx.showToast({ title: '心理日记已生成 ✨', icon: 'success' });
      } else {
        wx.showToast({ title: '生成失败，请检查 AI 配置', icon: 'none' });
        this.setData({ counselorLoading: false });
      }
    } catch (e) {
      wx.showToast({ title: '生成失败', icon: 'none' });
      this.setData({ counselorLoading: false });
    } finally {
      wx.hideLoading();
    }
  },

  // 进入板块详情
  goToPanelDetail(e) {
    const category = e.currentTarget.dataset.category;
    if (!category) return;
    const panels = this.data.enrichmentPanels;
    const panel = panels.find(p => p.id === category);
    if (!panel) return;
    if (!panel.lit) {
      wx.showToast({ title: '完成今日幸运饼干任务即可点亮', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/enrichment-detail/enrichment-detail?category=${category}`
    });
  }
});
