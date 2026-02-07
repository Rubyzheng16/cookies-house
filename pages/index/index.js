// 碎片收纳主界面
// 注意：这是从 index.ts 编译生成的临时文件
// 实际开发请使用 index.ts

import { fragmentService } from '../../services/fragment.js';
import { dateUtils } from '../../utils/date.js';
import { aiService } from '../../utils/ai.js';
import { CookieType } from '../../types/index.js';
import { FOLDER_IMAGES, getFolderStyleIndex } from '../../constants/index.js';

Page({
  data: {
    folders: [],
    inputValue: '',
    hasInput: false,
    selectedType: null,
    showRef: false,
    isBaking: false,
    showCalendarModal: false,
    selectedDate: '',
    searchDate: '',
    calendarDays: [],
    currentMonth: '',
    calendarYear: 0,
    calendarMonth: 0,
    isEditMode: false,
    showInputModal: false,
    quadrantTypes: [
      { type: CookieType.IMPORTANT_URGENT, color: '#FF80AB', icon: '🍓', label: '紧急重要', order: 1 },
      { type: CookieType.IMPORTANT_NOT_URGENT, color: '#81C784', icon: '🍵', label: '重要不紧急', order: 2 },
      { type: CookieType.URGENT_NOT_IMPORTANT, color: '#FFF176', icon: '🍋', label: '紧急不重要', order: 3 },
      { type: CookieType.NOT_IMPORTANT_NOT_URGENT, color: '#B39DDB', icon: '🫐', label: '不重要不紧急', order: 4 }
    ],
    quadrantRefs: [
      {
        order: 2,
        label: '重要但不紧急',
        color: '#81C784',
        examples: '发掘新机会、规划职业前程、防患于未然',
        principle: '投资此象限，避免工作落入第一象限',
        thinking: '如何避免更多的事情落入第一象限',
        impact: '忙碌但不盲目'
      },
      {
        order: 1,
        label: '既紧急又重要',
        color: '#FF80AB',
        examples: '工作危机、急迫的问题、有期限压力的计划',
        principle: '越少越好，多是因为第二象限没处理好',
        thinking: '真的有那么重要和紧急吗？',
        impact: '增加压力，产生危机'
      },
      {
        order: 4,
        label: '不重要不紧急',
        color: '#B39DDB',
        examples: '可做可不做的杂事、不必要的应酬、上网聊天玩游戏',
        principle: '偶尔放松一下，但不可沉溺于此',
        thinking: '这些事情对我来说真的有必要吗？',
        impact: '浪费时间'
      },
      {
        order: 3,
        label: '紧急但不重要',
        color: '#FFF176',
        examples: '不速之客的到访、临时安排的工作、不必要的微博微信回复',
        principle: '放权交给别人去做',
        thinking: '如何减少第三象限的事物',
        impact: '忙碌且盲目'
      }
    ]
  },

  onLoad() {
    this.loadFolders();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    this.setData({
      currentMonth: `${year}年${month + 1}月`,
      selectedDate: dateUtils.getTodayString(),
      calendarYear: year,
      calendarMonth: month
    });
    this.generateCalendar(year, month);
  },

  onShow() {
    this.loadFolders();
  },

  _addFolderImages(rawFolders) {
    return rawFolders.map((f) => ({
      ...f,
      folderImage: FOLDER_IMAGES[getFolderStyleIndex(f.date)]
    }));
  },

  loadFolders() {
    const rawFolders = fragmentService.getFolders();
    const folders = this._addFolderImages(rawFolders);
    this.setData({ folders });
    // 如果日历已打开，更新日历显示
    if (this.data.showCalendarModal) {
      const year = this.data.calendarYear || new Date().getFullYear();
      const month = this.data.calendarMonth ?? new Date().getMonth();
      this.generateCalendar(year, month);
    }
  },

  onInputChange(e) {
    const value = e.detail.value;
    this.setData({ 
      inputValue: value,
      hasInput: value.trim().length > 0
    });
  },

  toggleType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: this.data.selectedType === type ? null : type
    });
  },

  toggleRef() {
    this.setData({ showRef: !this.data.showRef });
  },

  handleConfirm() {
    if (!this.data.inputValue.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    if (this.data.isBaking) {
      return;
    }

    this.setData({ isBaking: true });

    setTimeout(() => {
      const type = this.data.selectedType || CookieType.MUMBLING;
      const rawFolders = fragmentService.addEntry(this.data.inputValue, type);
      const folders = this._addFolderImages(rawFolders);
      
      this.setData({
        folders,
        inputValue: '',
        hasInput: false,
        selectedType: null,
        isBaking: false
      });

      wx.showToast({
        title: '已记录',
        icon: 'success'
      });
    }, 800);
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 这里可以上传图片或添加到输入内容
        wx.showToast({
          title: '图片已选择',
          icon: 'success'
        });
        // 可以将图片路径添加到输入内容
        // this.setData({ inputValue: this.data.inputValue + '\n[图片]' });
      },
      fail: (err) => {
        console.error('选择图片失败', err);
      }
    });
  },

  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        wx.showToast({
          title: '文件已选择',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('选择文件失败', err);
      }
    });
  },

  // 开始录音
  startRecord() {
    const recorderManager = wx.getRecorderManager();
    
    recorderManager.onStart(() => {
      wx.showToast({
        title: '开始录音',
        icon: 'none',
        duration: 1000
      });
    });

    recorderManager.onStop((res) => {
      // 这里可以将录音转换为文字（需要调用语音识别API）
      wx.showToast({
        title: '录音完成',
        icon: 'success'
      });
      // 可以将识别结果添加到输入内容
      // this.setData({ inputValue: this.data.inputValue + '\n[语音]' });
    });

    recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3'
    });

    // 3秒后自动停止（可以改为手动停止）
    setTimeout(() => {
      recorderManager.stop();
    }, 3000);
  },

  // 显示日历
  showCalendar() {
    const year = this.data.calendarYear || new Date().getFullYear();
    const month = this.data.calendarMonth ?? new Date().getMonth();
    this.generateCalendar(year, month);
    this.setData({
      showCalendarModal: true,
      currentMonth: `${year}年${month + 1}月`
    });
  },

  // 上个月
  prevMonth() {
    let { calendarYear, calendarMonth } = this.data;
    if (calendarMonth === 0) {
      calendarYear--;
      calendarMonth = 11;
    } else {
      calendarMonth--;
    }
    this.setData({
      calendarYear,
      calendarMonth,
      currentMonth: `${calendarYear}年${calendarMonth + 1}月`
    });
    this.generateCalendar(calendarYear, calendarMonth);
  },

  // 下个月
  nextMonth() {
    let { calendarYear, calendarMonth } = this.data;
    if (calendarMonth === 11) {
      calendarYear++;
      calendarMonth = 0;
    } else {
      calendarMonth++;
    }
    this.setData({
      calendarYear,
      calendarMonth,
      currentMonth: `${calendarYear}年${calendarMonth + 1}月`
    });
    this.generateCalendar(calendarYear, calendarMonth);
  },

  // 上一年
  prevYear() {
    const calendarYear = this.data.calendarYear - 1;
    const calendarMonth = this.data.calendarMonth;
    this.setData({
      calendarYear,
      currentMonth: `${calendarYear}年${calendarMonth + 1}月`
    });
    this.generateCalendar(calendarYear, calendarMonth);
  },

  // 下一年
  nextYear() {
    const calendarYear = this.data.calendarYear + 1;
    const calendarMonth = this.data.calendarMonth;
    this.setData({
      calendarYear,
      currentMonth: `${calendarYear}年${calendarMonth + 1}月`
    });
    this.generateCalendar(calendarYear, calendarMonth);
  },

  // 切换编辑模式
  toggleEditMode() {
    this.setData({ isEditMode: !this.data.isEditMode });
  },

  // 生成日历
  generateCalendar(year, month) {
    const y = year ?? new Date().getFullYear();
    const m = month ?? new Date().getMonth();
    
    // 获取当月第一天是星期几
    const firstDay = new Date(y, m, 1);
    const firstDayWeek = firstDay.getDay();
    
    // 获取当月天数
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    
    // 获取上个月最后几天
    const prevMonthDays = new Date(y, m, 0).getDate();
    
    const days = [];
    const todayStr = dateUtils.getTodayString();
    
    // 添加上个月的最后几天
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(y, m - 1, day);
      const dateStr = dateUtils.formatDate(date);
      const folder = this.data.folders.find(f => f.date === dateStr);
      const entryCount = folder ? folder.entries.length : 0;
      
      days.push({
        day: day,
        date: dateStr,
        isCurrentMonth: false,
        isToday: false,
        hasContent: entryCount > 0,
        bgColor: this.getDateColor(entryCount),
        isDark: entryCount > 8
      });
    }
    
    // 添加当月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(y, m, day);
      const dateStr = dateUtils.formatDate(date);
      const folder = this.data.folders.find(f => f.date === dateStr);
      const entryCount = folder ? folder.entries.length : 0;
      const isToday = dateStr === todayStr;
      
      days.push({
        day: day,
        date: dateStr,
        isCurrentMonth: true,
        isToday: isToday,
        hasContent: entryCount > 0,
        bgColor: this.getDateColor(entryCount),
        isDark: entryCount > 8
      });
    }
    
    // 补充下个月的前几天，使日历完整
    const remainingDays = 42 - days.length; // 6行 x 7天 = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(y, m + 1, day);
      const dateStr = dateUtils.formatDate(date);
      const folder = this.data.folders.find(f => f.date === dateStr);
      const entryCount = folder ? folder.entries.length : 0;
      
      days.push({
        day: day,
        date: dateStr,
        isCurrentMonth: false,
        isToday: false,
        hasContent: entryCount > 0,
        bgColor: this.getDateColor(entryCount),
        isDark: entryCount > 8
      });
    }
    
    this.setData({ 
      calendarDays: days,
      currentMonth: `${y}年${m + 1}月`
    });
  },

  // 根据记录数量获取日期背景色，数量越多颜色越深
  getDateColor(entryCount) {
    if (entryCount === 0) {
      return '#FFFFFF';
    } else if (entryCount === 1) {
      return '#FFE8F0'; // 极淡粉
    } else if (entryCount <= 3) {
      return '#FFD1E3'; // 淡粉
    } else if (entryCount <= 5) {
      return '#FFB3D9'; // 中淡粉
    } else if (entryCount <= 8) {
      return '#FF94CF'; // 中粉
    } else if (entryCount <= 12) {
      return '#FF80AB'; // 深粉
    } else {
      return '#E91E63'; // 最深粉
    }
  },

  // 选择日历日期 - 直接进入详情页
  selectCalendarDate(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date });
    this.hideCalendar();
    wx.navigateTo({
      url: `/pages/detail/detail?date=${date}`
    });
  },

  // 隐藏日历
  hideCalendar() {
    this.setData({ showCalendarModal: false });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 日期选择变化（保留picker作为备用）
  onDateChange(e) {
    const date = e.detail.value;
    // 将日期格式转换为 YYYY/MM/DD
    const formattedDate = date.replace(/-/g, '/');
    this.setData({ selectedDate: formattedDate });
  },

  // 按日期搜索
  searchByDate() {
    if (!this.data.selectedDate) {
      return;
    }

    // 滚动到对应日期的文件夹
    const folder = this.data.folders.find(f => f.date === this.data.selectedDate);
    if (folder) {
      this.setData({ 
        searchDate: this.data.selectedDate,
        showCalendarModal: false 
      });
      wx.showToast({
        title: `找到 ${this.data.selectedDate} 的记录`,
        icon: 'success',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: `${this.data.selectedDate} 暂无记录`,
        icon: 'none',
        duration: 1500
      });
    }
  },

  async handleAnalyze(e) {
    const date = e.currentTarget.dataset.date || dateUtils.getTodayString();
    const folder = this.data.folders.find(f => f.date === date);
    
    if (!folder || folder.entries.length === 0) {
      wx.showToast({
        title: '暂无内容可分析',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '分析中...' });

    try {
      const analysis = await aiService.analyzeToday(folder.entries);
      const rawFolders = fragmentService.updateAnalysis(date, analysis);
      const folders = this._addFolderImages(rawFolders);
      this.setData({ folders });
    } catch (error) {
      wx.showToast({
        title: '分析失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 打开文件夹
  openFolder(e) {
    if (this.data.isEditMode) return;
    const date = e.currentTarget.dataset.date;
    wx.navigateTo({
      url: `/pages/detail/detail?date=${date}`
    });
  },

  // 删除文件夹
  deleteFolder(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) {
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${date} 的数据吗？`,
      success: (res) => {
        if (res.confirm) {
          try {
            const rawFolders = fragmentService.deleteFolder(date);
            const folders = this._addFolderImages(rawFolders);
            this.setData({ folders });
            wx.showToast({
              title: '已删除',
              icon: 'success'
            });
          } catch (error) {
            console.error('删除失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
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
  handleInputConfirm(e) {
    const { text, type } = e.detail;
    
    if (!text || !text.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }
    
    try {
      const rawFolders = fragmentService.addEntry(text.trim(), type);
      const folders = this._addFolderImages(rawFolders);
      
      // 关闭输入弹窗
      this.setData({ 
        folders,
        showInputModal: false
      });
      
      wx.showToast({
        title: '已记录',
        icon: 'success'
      });
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  }
});
