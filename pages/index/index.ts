// 碎片收纳主界面
import { DayFolder } from '../../types';
import { fragmentService } from '../../services/fragment';
import { dateUtils } from '../../utils/date';

Page({
  data: {
    folders: [] as DayFolder[],
    showCalendarModal: false,
    currentMonth: '',
    calendarDays: [] as any[],
    selectedDate: '',
    showInputModal: false,
    animationData: {} as any
  },

  onLoad() {
    this.loadFolders();
    this.initCalendar();
  },

  onShow() {
    this.loadFolders();
    // 更新自定义tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  },

  loadFolders() {
    const folders = fragmentService.getFolders();
    this.setData({ folders });
  },

  // 初始化日历
  initCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    this.setData({
      currentMonth: `${year}年${month + 1}月`,
      selectedDate: dateUtils.getTodayString()
    });
    this.generateCalendarDays(year, month);
  },

  // 生成日历天数
  generateCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();
    
    const days: any[] = [];
    const todayStr = dateUtils.getTodayString();
    
    // 上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dateStr = dateUtils.formatDate(new Date(year, month - 1, day));
      days.push({
        day,
        date: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        hasContent: this.hasContentForDate(dateStr)
      });
    }
    
    // 当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = dateUtils.formatDate(new Date(year, month, day));
      days.push({
        day,
        date: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        hasContent: this.hasContentForDate(dateStr)
      });
    }
    
    // 下个月的日期（填满6行）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const dateStr = dateUtils.formatDate(new Date(year, month + 1, day));
      days.push({
        day,
        date: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        hasContent: this.hasContentForDate(dateStr)
      });
    }
    
    this.setData({ calendarDays: days });
  },

  // 检查日期是否有内容
  hasContentForDate(date: string): boolean {
    const folders = fragmentService.getFolders();
    const folder = folders.find(f => f.date === date);
    return folder ? folder.entries.length > 0 : false;
  },

  // 显示日历
  showCalendar() {
    this.setData({ showCalendarModal: true });
  },

  // 隐藏日历
  hideCalendar() {
    this.setData({ showCalendarModal: false });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 选择日历日期
  selectCalendarDate(e: any) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date });
    this.hideCalendar();
    // 跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/detail?date=${date}`
    });
  },

  // 打开文件夹
  openFolder(e: any) {
    const date = e.currentTarget.dataset.date;
    wx.navigateTo({
      url: `/pages/detail/detail?date=${date}`
    });
  },

  // 删除文件夹
  deleteFolder(e: any) {
    const date = e.currentTarget.dataset.date;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${date} 的数据吗？`,
      success: (res) => {
        if (res.confirm) {
          const folders = fragmentService.deleteFolder(date);
          this.setData({ folders });
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 格式化日期显示
  formatDateLabel(date: string): string {
    const dateParts = date.split('/');
    if (dateParts.length === 3) {
      const month = parseInt(dateParts[1]);
      const day = parseInt(dateParts[2]);
      return `${month}/${day}`;
    }
    return date;
  },

  // 显示输入弹窗
  showInputModal() {
    this.setData({ showInputModal: true });
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
    
    if (!text || !text.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }
    
    try {
      const folders = fragmentService.addEntry(text.trim(), type);
      
      // 触发动画效果
      this.playAddAnimation();
      
      this.setData({ folders });
      
      // 关闭输入弹窗
      this.setData({ showInputModal: false });
      
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

  // 播放添加动画
  playAddAnimation() {
    const animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease-out'
    });
    
    animation.scale(1.5).opacity(0).step();
    
    this.setData({
      animationData: animation.export()
    });
    
    setTimeout(() => {
      const resetAnimation = wx.createAnimation({
        duration: 0
      });
      resetAnimation.scale(1).opacity(1).step();
      this.setData({
        animationData: resetAnimation.export()
      });
    }, 1000);
  }
});
