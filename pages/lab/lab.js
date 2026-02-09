// 可视化状态感知页面
import { fragmentService } from '../../services/fragment.js';
import { dateUtils } from '../../utils/date.js';
import { aiService } from '../../utils/ai.js';
import { enrichmentService } from '../../services/enrichment.js';
import { storage } from '../../utils/storage.js';

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
    counselorLoading: false,
    longTermAnalysis: null,
    longTermLoading: false
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

  // 幸运饼干：用户点击抽取（每天最多 5 个，内容由 AI 生成）
  async onFortuneFetch() {
    if (this.data.fortuneLoading) return;
    if (!enrichmentService.canFetchMoreFortune()) {
      wx.showToast({ title: '今日已生成 5 个，明天再来吧', icon: 'none' });
      return;
    }
    this.setData({ fortuneLoading: true });

    const result = await aiService.generateFortune();
    if (!result || !result.content) {
      wx.showToast({ title: '生成失败，请检查 AI 配置或稍后重试', icon: 'none' });
      this.setData({ fortuneLoading: false });
      return;
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

  // 心理日记（长期分析）：调取所有文件夹内容进行生成
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
    wx.navigateTo({
      url: `/pages/enrichment-detail/enrichment-detail?category=${category}`
    });
  },

  // 生成长期分析（结合全部记录 / 丰容 / 技能树）
  async generateLongTermAnalysis() {
    if (this.data.longTermLoading) return;
    const folders = this.data.folders.filter(
      (f) => f.entries && f.entries.length > 0
    );
    const enrichment = storage.getEnrichmentData
      ? storage.getEnrichmentData()
      : {};
    const skillTree = storage.getSkillTreeData
      ? storage.getSkillTreeData()
      : { items: [] };

    if (
      folders.length === 0 &&
      (!enrichment || !enrichment.litPanels) &&
      (!skillTree || !skillTree.items || skillTree.items.length === 0)
    ) {
      wx.showToast({ title: '暂无足够数据可生成长期分析', icon: 'none' });
      return;
    }

    this.setData({ longTermLoading: true });
    wx.showLoading({ title: '生成长期分析中...' });
    try {
      const result = await aiService.generateLongTermAnalysis({
        folders,
        enrichment,
        skillTree
      });
      if (result) {
        this.setData({ longTermAnalysis: result });
        wx.showToast({ title: '长期分析已生成 ✨', icon: 'success' });
      }
    } finally {
      this.setData({ longTermLoading: false });
      wx.hideLoading();
    }
  },

  // 导出长期分析为图片（长图）
  exportLongTermImage() {
    const analysis = this.data.longTermAnalysis;
    if (!analysis) {
      wx.showToast({ title: '请先生成长期分析', icon: 'none' });
      return;
    }
    const ctx = wx.createCanvasContext('longTermCanvas', this);

    const width = 600;  // rpx 对应到画布时不严格按像素算，这里用一个固定宽度即可
    const height = 1000;

    // 背景
    ctx.setFillStyle('#FFF9C4');
    ctx.fillRect(0, 0, width, height);

    ctx.setFillStyle('#3E2723');
    ctx.setFontSize(20);
    ctx.setTextAlign('left');
    ctx.fillText('情绪饼干屋 · 长期分析', 20, 40);

    let y = 80;
    const lineHeight = 24;

    function wrapText(text, maxCharsPerLine) {
      const lines = [];
      let line = '';
      for (const ch of text) {
        if (line.length >= maxCharsPerLine) {
          lines.push(line);
          line = ch;
        } else {
          line += ch;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    // 关键要点
    ctx.setFontSize(18);
    ctx.fillText('一、关键要点', 20, y);
    y += lineHeight;
    ctx.setFontSize(16);
    (analysis.summary && analysis.summary.keyPoints
      ? analysis.summary.keyPoints
      : []
    )
      .slice(0, 4)
      .forEach((kp) => {
        const lines = wrapText('• ' + kp, 20);
        lines.forEach((ln) => {
          ctx.fillText(ln, 20, y);
          y += lineHeight;
        });
      });

    y += lineHeight * 2;
    ctx.setFontSize(18);
    ctx.fillText('二、重点主题', 20, y);
    y += lineHeight;
    ctx.setFontSize(16);
    const themes =
      (analysis.psychologicalInsight && analysis.psychologicalInsight.themes) ||
      [];
    (themes || []).slice(0, 4).forEach((th) => {
      wrapText('• ' + th, 20).forEach((ln) => {
        ctx.fillText(ln, 20, y);
        y += lineHeight;
      });
    });

    y += lineHeight * 2;
    ctx.setFontSize(18);
    ctx.fillText('三、行动建议', 20, y);
    y += lineHeight;
    ctx.setFontSize(16);
    const blocks =
      (analysis.lifeAdvice && analysis.lifeAdvice.adviceBlocks) || [];
    blocks.slice(0, 3).forEach((block) => {
      const title = block.title || '';
      const content = (block.content || '').slice(0, 80);
      wrapText('· ' + title + '：' + content, 18).forEach((ln) => {
        ctx.fillText(ln, 20, y);
        y += lineHeight;
      });
      y += lineHeight;
    });

    ctx.draw(false, () => {
      wx.canvasToTempFilePath(
        {
          canvasId: 'longTermCanvas',
          success: (res2) => {
            const path = res2.tempFilePath;
            wx.previewImage({ urls: [path] });
          },
          fail: (err) => {
            console.error('导出图片失败', err);
            wx.showToast({ title: '导出失败', icon: 'none' });
          }
        },
        this
      );
    });
  }
});
