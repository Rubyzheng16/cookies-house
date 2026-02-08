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
    minuteGroups: [] as any[],
    hourGroups: [] as any[],
    entryColors: {} as Record<CookieType, string>,
    entryIcons: {} as Record<CookieType, string>,
    quadrantDots: [] as number[][],
    showInputModal: false,
    previewImages: [] as string[],
    previewIndex: 0,
    showImagePreview: false
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
    
    // 如果没有找到文件夹，创建一个空的
    if (!folder) {
      // 不显示错误提示，直接创建空文件夹
      const emptyFolder: DayFolder = {
        date: this.data.date,
        entries: []
      };
      // 不保存空文件夹，只是用于显示
      this.setData({
        dateLabel: this.data.date,
        currentTime: '',
        entries: [],
        allDayEntries: [],
        timelineEntries: [],
        timeSlots: [],
        quadrantDots: [[], [], [], []],
        entryColors: {},
        entryIcons: {}
      });
      return;
    }

    // 统计各象限的任务数量，用于显示圆点
    const typeToQuadrant: Record<string, number> = {
      [CookieType.IMPORTANT_URGENT]: 0,
      [CookieType.IMPORTANT_NOT_URGENT]: 1,
      [CookieType.URGENT_NOT_IMPORTANT]: 2,
      [CookieType.NOT_IMPORTANT_NOT_URGENT]: 3
    };
    const quadrantCounts = [0, 0, 0, 0];
    folder.entries.forEach(entry => {
      const idx = typeToQuadrant[entry.type];
      if (idx !== undefined) quadrantCounts[idx]++;
    });
    const quadrantDots = quadrantCounts.map(count => Array(count).fill(1));

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
        
        dateLabel = isToday ? '今天' : `周${weekday} ${month}月${day}日`;
      } else {
        dateLabel = this.data.date || '今天';
      }
      
      // 获取当前时间（显示当前时间，不是条目的时间）
      const now = new Date();
      currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
      console.error('日期格式化错误:', error);
      dateLabel = '今天';
      const now = new Date();
      currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // 分离全天事件和有时间的事件（目前全部按时间分组展示）
    const allDayEntries: CookieEntry[] = [];
    const timeEntries: CookieEntry[] = [];

    folder.entries.forEach(entry => {
      // 兼容旧数据：如果没有timestamp，使用当前时间
      if (!entry.timestamp) {
        entry.timestamp = Date.now();
      }
      timeEntries.push(entry);
    });

    // 按时间排序（先后输入顺序由时间决定）
    timeEntries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // 按分钟分组：同一分钟内的事件放在同一个时间块中
    const minuteGroupMap: { [key: string]: any[] } = {};
    timeEntries.forEach(entry => {
      const timestamp = entry.timestamp || Date.now();
      const dateObj = new Date(timestamp);
      const hourStr = String(dateObj.getHours()).padStart(2, '0');
      const minuteStr = String(dateObj.getMinutes()).padStart(2, '0');
      const key = `${hourStr}:${minuteStr}`;

      if (!minuteGroupMap[key]) {
        minuteGroupMap[key] = [];
      }

      // 避免使用对象展开语法，改用 Object.assign
      const entryWithTime = Object.assign({}, entry, {
        timestamp
      });
      minuteGroupMap[key].push(entryWithTime);
    });

    // 将分组结果转换为有序数组，按时间从早到晚排列（分钟级）
    const sortedKeys = Object.keys(minuteGroupMap).sort();
    const minuteGroups = sortedKeys.map(timeLabel => ({
      timeLabel,
      entries: minuteGroupMap[timeLabel]
    }));

    // 生成按小时分组的数据：每个小时下面挂该小时内的分钟块
    const hourGroups = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = `${String(hour).padStart(2, '0')}`;
      hourGroups.push({
        hourLabel: `${hourStr}:00`,
        minutes: minuteGroups.filter(group => group.timeLabel.startsWith(`${hourStr}:`))
      });
    }

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
      timelineEntries: [],
      timeSlots: [],
      minuteGroups,
      hourGroups,
      quadrantDots,
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

  // 处理输入确认（保存到当前页面的日期）
  handleInputConfirm(e: any) {
    const { text, type, images, voicePath } = e.detail;
    const hasContent = (text && text.trim()) || (images && images.length > 0) || voicePath;
    
    if (!hasContent) {
      wx.showToast({
        title: '请输入内容、选择图片或录制语音',
        icon: 'none'
      });
      return;
    }
    
    try {
      const options = {
        date: this.data.date,
        images: images && images.length > 0 ? images : undefined,
        voicePath: voicePath || undefined
      };
      const folders = fragmentService.addEntry((text || '').trim() || '[图片/语音]', type, options);
      
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
  previewImage(e: any) {
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
