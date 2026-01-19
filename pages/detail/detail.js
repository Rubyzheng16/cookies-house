// 详情页面
const { fragmentService } = require('../../services/fragment.js');
const { dateUtils } = require('../../utils/date.js');
const { COOKIE_METADATA } = require('../../constants/index.js');
const { CookieType } = require('../../types/index.js');

Page({
  data: {
    date: '',
    dateLabel: '',
    currentTime: '',
    entries: [],
    allDayEntries: [],
    timelineEntries: [],
    timeSlots: [],
    entryColors: {},
    entryIcons: {},
    showInputModal: false,
    previewImages: [],
    previewIndex: 0,
    showImagePreview: false
  },

  onLoad(options) {
    const date = options.date || dateUtils.getTodayString();
    this.setData({ date: date });
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const folders = fragmentService.getFolders();
    const folder = folders.find(f => f.date === this.data.date);
    
    // 如果没有找到文件夹，创建一个空的用于显示
    if (!folder) {
      this.setData({
        dateLabel: this.data.date || '今天',
        currentTime: this.getCurrentTime(),
        entries: [],
        allDayEntries: [],
        timelineEntries: [],
        timeSlots: [],
        entryColors: {},
        entryIcons: {}
      });
      return;
    }

    // 格式化日期标签
    let dateLabel = '';
    let currentTime = '';
    
    try {
      const dateParts = this.data.date.split('/');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);
        const date = new Date(year, month - 1, day);
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekday = weekdays[date.getDay()];
        
        // 判断是否为今天
        const today = new Date();
        const isToday = year === today.getFullYear() && 
                        month === today.getMonth() + 1 && 
                        day === today.getDate();
        
        dateLabel = isToday ? '今天' : '周' + weekday + ' ' + month + '月' + day + '日';
      } else {
        dateLabel = this.data.date || '今天';
      }
      
      // 获取当前时间
      currentTime = this.getCurrentTime();
    } catch (error) {
      console.error('日期格式化错误:', error);
      dateLabel = '今天';
      currentTime = this.getCurrentTime();
    }

    // 分离全天事件和有时间的事件
    const allDayEntries = [];
    const timeEntries = [];

    folder.entries.forEach(entry => {
      // 兼容旧数据：如果没有timestamp，使用当前时间
      if (!entry.timestamp) {
        entry.timestamp = Date.now();
      }
      // 暂时将所有事件都按时间排列
      timeEntries.push(entry);
    });

    // 按时间排序
    timeEntries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // 生成时间轴刻度（从早上6点到晚上24点）
    const timeSlots = [];
    const startHour = 6;
    const endHour = 24;
    for (let hour = startHour; hour <= endHour; hour++) {
      timeSlots.push({
        hour: hour,
        label: String(hour).padStart(2, '0') + ':00',
        top: (hour - startHour) * 120 // 每个小时120rpx
      });
    }

    // 计算每个事件的位置（从早上6点开始）
    const timelineEntries = timeEntries.map(entry => {
      // 兼容旧数据：如果没有timestamp，使用当前时间
      const timestamp = entry.timestamp || Date.now();
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      // 如果时间早于6点，放在6点位置
      const adjustedHours = hours < startHour ? startHour : hours;
      const top = (adjustedHours - startHour) * 120 + (minutes / 60) * 120;
      
      // 避免使用对象展开语法，改用Object.assign
      return Object.assign({}, entry, {
        timestamp: timestamp, // 确保timestamp存在
        top: top
      });
    });

    // 生成颜色和图标映射
    const entryColors = {};
    const entryIcons = {};
    Object.values(CookieType).forEach(type => {
      const metadata = COOKIE_METADATA[type];
      entryColors[type] = metadata ? metadata.color + '80' : '#E0E0E080';
      entryIcons[type] = metadata ? metadata.icon : '💭';
    });

    this.setData({
      dateLabel: dateLabel,
      currentTime: currentTime,
      entries: folder.entries,
      allDayEntries: allDayEntries,
      timelineEntries: timelineEntries,
      timeSlots: timeSlots,
      entryColors: entryColors,
      entryIcons: entryIcons
    });
  },

  // 获取当前时间
  getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return hours + ':' + minutes;
  },

  // 格式化时间
  formatTime(timestamp) {
    return dateUtils.formatTime(timestamp);
  },

  // 显示日历
  showCalendar() {
    // TODO: 实现日历选择
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
      const folders = fragmentService.addEntry(text.trim(), type);
      
      // 关闭输入弹窗
      this.setData({ showInputModal: false });
      
      // 重新加载数据
      this.loadData();
      
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
  },

  // 返回
  goBack() {
    try {
      wx.navigateBack({
        delta: 1
      });
    } catch (error) {
      console.error('返回失败:', error);
      // 如果返回失败，尝试使用 switchTab 或其他方式
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  // 预览图片
  previewImage(e) {
    const { images, index } = e.currentTarget.dataset;
    if (!images || images.length === 0) {
      return;
    }
    
    wx.previewImage({
      urls: images,
      current: images[index || 0]
    });
  }
});
