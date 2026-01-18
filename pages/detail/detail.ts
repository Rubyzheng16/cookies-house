// 详情页面
import { DayFolder, CookieEntry, CookieType } from '../../types';
import { fragmentService } from '../../services/fragment';
import { dateUtils } from '../../utils/date';
import { COOKIE_METADATA } from '../../constants';

Page({
  data: {
    date: '',
    dateLabel: '',
    currentTime: '',
    entries: [] as CookieEntry[],
    allDayEntries: [] as CookieEntry[],
    timelineEntries: [] as any[],
    timeSlots: [] as any[],
    entryColors: {} as Record<CookieType, string>,
    entryIcons: {} as Record<CookieType, string>,
    showInputModal: false
  },

  onLoad(options: any) {
    const date = options.date || dateUtils.getTodayString();
    this.setData({ date });
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const folders = fragmentService.getFolders();
    const folder = folders.find(f => f.date === this.data.date);
    
    if (!folder) {
      wx.showToast({
        title: '暂无数据',
        icon: 'none'
      });
      setTimeout(() => {
        this.goBack();
      }, 1500);
      return;
    }

    // 格式化日期标签
    const dateParts = this.data.date.split('/');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    const date = new Date(year, month - 1, day);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    const dateLabel = `周${weekday} ${month}月${day}日`;
    
    // 获取当前时间
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 分离全天事件和有时间的事件
    const allDayEntries: CookieEntry[] = [];
    const timeEntries: CookieEntry[] = [];

    folder.entries.forEach(entry => {
      // 这里可以根据需要判断是否为全天事件
      // 暂时将所有事件都按时间排列
      timeEntries.push(entry);
    });

    // 按时间排序
    timeEntries.sort((a, b) => a.timestamp - b.timestamp);

    // 生成时间轴刻度（从早上6点到晚上24点）
    const timeSlots = [];
    const startHour = 6;
    const endHour = 24;
    for (let hour = startHour; hour <= endHour; hour++) {
      timeSlots.push({
        hour,
        label: `${String(hour).padStart(2, '0')}:00`,
        top: (hour - startHour) * 120 // 每个小时120rpx
      });
    }

    // 计算每个事件的位置（从早上6点开始）
    const startHour = 6;
    const timelineEntries = timeEntries.map(entry => {
      const date = new Date(entry.timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      // 如果时间早于6点，放在6点位置
      const adjustedHours = hours < startHour ? startHour : hours;
      const top = (adjustedHours - startHour) * 120 + (minutes / 60) * 120;
      
      return {
        ...entry,
        top
      };
    });

    // 生成颜色和图标映射
    const entryColors: Record<CookieType, string> = {} as any;
    const entryIcons: Record<CookieType, string> = {} as any;
    Object.values(CookieType).forEach(type => {
      const metadata = COOKIE_METADATA[type];
      entryColors[type] = metadata ? metadata.color + '80' : '#E0E0E080';
      entryIcons[type] = metadata ? metadata.icon : '💭';
    });

    this.setData({
      dateLabel,
      currentTime,
      entries: folder.entries,
      allDayEntries,
      timelineEntries,
      timeSlots,
      entryColors,
      entryIcons
    });
  },

  // 格式化时间
  formatTime(timestamp: number): string {
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
  handleInputConfirm(e: any) {
    const { text, type } = e.detail;
    const folders = fragmentService.addEntry(text, type);
    
    // 重新加载数据
    this.loadData();
    
    wx.showToast({
      title: '已记录',
      icon: 'success'
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
