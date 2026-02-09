// 详情页面
const { fragmentService } = require('../../services/fragment.js');
const { dateUtils } = require('../../utils/date.js');
const { COOKIE_METADATA, ADD_BTN_IMAGE } = require('../../constants/index.js');
const { CookieType } = require('../../types/index.js');

Page({
  data: {
    addBtnImage: ADD_BTN_IMAGE,
    date: '',
    dateLabel: '',
    currentTime: '',
    entries: [],
    allDayEntries: [],
    taskBlocksWithMumblings: [],
    timelineEntries: [],
    timeSlots: [],
    minuteGroups: [],
    hourGroups: [],
    entryColors: {},
    entryIcons: {},
    quadrantDots: [[], [], [], []],
    isEditMode: false,
    showInputModal: false,
    showTimeModal: false,
    editingEntryId: '',
    editingStartTime: '',
    editingEndTime: '',
    hourList: ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
    minuteList: ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59'],
    startPickerValue: [0, 0],
    endPickerValue: [0, 0],
    previewImages: [],
    previewIndex: 0,
    showImagePreview: false,
    playingVoice: ''
  },

  onLoad(options) {
    const date = options.date || dateUtils.getTodayString();
    this.setData({ date: date });
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onUnload() {
    if (this._voiceContext) {
      this._voiceContext.destroy();
      this._voiceContext = null;
    }
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
        taskBlocksWithMumblings: [],
        timelineEntries: [],
        timeSlots: [],
        quadrantDots: [[], [], [], []],
        entryColors: {},
        entryIcons: {},
        diaryAnalysis: null
      });
      return;
    }

    // 统计各象限的任务数量，用于显示圆点
    // [0]=紧急重要, [1]=重要不紧急, [2]=紧急不重要, [3]=不重要不紧急
    const quadrantCounts = [0, 0, 0, 0];
    const typeToQuadrant = {
      [CookieType.IMPORTANT_URGENT]: 0,
      [CookieType.IMPORTANT_NOT_URGENT]: 1,
      [CookieType.URGENT_NOT_IMPORTANT]: 2,
      [CookieType.NOT_IMPORTANT_NOT_URGENT]: 3
    };
    folder.entries.forEach(entry => {
      const idx = typeToQuadrant[entry.type];
      if (idx !== undefined) {
        quadrantCounts[idx]++;
      }
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

    // 时间轴：所有条目按记录时间（timestamp）显示，不排除已添加完成时间的任务
    const allDayEntries = [];
    const timeEntries = [];

    const formatTimeStr = (ts) => {
      if (!ts) return '';
      const d = new Date(ts);
      return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    };

    const parseTimeToMinutes = (t) => {
      if (!t) return 0;
      const p = t.split(':').map(Number);
      return (p[0] || 0) * 60 + (p[1] || 0);
    };

    const formatDurationHours = (startTime, endTime) => {
      if (!startTime || !endTime) return '';
      const s = parseTimeToMinutes(startTime);
      const e = parseTimeToMinutes(endTime);
      const mins = Math.max(0, e - s);
      const hours = mins / 60;
      if (hours < 1) return '用时 约0.5小时';
      if (hours % 1 === 0) return '用时 ' + hours + '小时';
      return '用时 ' + hours.toFixed(1) + '小时';
    };

    folder.entries.forEach(entry => {
      if (!entry.timestamp) entry.timestamp = Date.now();
      timeEntries.push(entry);
    });

    timeEntries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    const minuteGroupMap = {};
    timeEntries.forEach(entry => {
      const timestamp = entry.timestamp || Date.now();
      const dateObj = new Date(timestamp);
      const hourStr = String(dateObj.getHours()).padStart(2, '0');
      const minuteStr = String(dateObj.getMinutes()).padStart(2, '0');
      const key = hourStr + ':' + minuteStr;
      const timeStr = formatTimeStr(timestamp);
      const durationStr = entry.type !== CookieType.MUMBLING && entry.startTime && entry.endTime
        ? formatDurationHours(entry.startTime, entry.endTime) : '';

      if (!minuteGroupMap[key]) minuteGroupMap[key] = [];
      minuteGroupMap[key].push(Object.assign({}, entry, {
        timestamp: timestamp,
        timeStr: timeStr,
        durationStr: durationStr
      }));
    });

    const sortedKeys = Object.keys(minuteGroupMap).sort();
    const minuteGroups = sortedKeys.map(timeLabel => ({
      timeLabel: timeLabel,
      entries: minuteGroupMap[timeLabel]
    }));

    // 全天 0:00–24:00；无事件的时段不显示白色方框
    const hourGroups = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = String(hour).padStart(2, '0');
      const minutesInHour = minuteGroups.filter(group => group.timeLabel.startsWith(hourStr + ':'));
      const hasEntries = minutesInHour.length > 0;
      hourGroups.push({
        hourLabel: hourStr + ':00',
        minutes: hasEntries ? minutesInHour : [],
        hasEntries: hasEntries
      });
    }

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
      taskBlocksWithMumblings: [],
      timelineEntries: [],
      timeSlots: [],
      minuteGroups: minuteGroups,
      hourGroups: hourGroups,
      quadrantDots: quadrantDots,
      entryColors: entryColors,
      entryIcons: entryIcons,
      diaryAnalysis: folder.diaryAnalysis || null
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

  // 长按打开时间弹窗（添加/修改时间）
  showTimeModalByLongPress(e) {
    const id = e.currentTarget.dataset.id;
    if (!id || id.indexOf('empty-') === 0) return;
    const entry = (this.data.entries || []).find(ent => ent.id === id);
    const now = new Date();
    let startH = now.getHours();
    let startM = now.getMinutes();
    let endH = (startH + 1) % 24;
    let endM = startM;
    if (entry && entry.startTime && entry.endTime) {
      const [sh, sm] = entry.startTime.split(':').map(Number);
      const [eh, em] = entry.endTime.split(':').map(Number);
      startH = sh;
      startM = sm;
      endH = eh;
      endM = em;
    }
    const hourList = this.data.hourList;
    const minuteList = this.data.minuteList;
    const startPickerValue = [hourList.indexOf(String(startH).padStart(2, '0')), minuteList.indexOf(String(startM).padStart(2, '0'))];
    const endPickerValue = [hourList.indexOf(String(endH).padStart(2, '0')), minuteList.indexOf(String(endM).padStart(2, '0'))];
    const editingStartTime = String(startH).padStart(2, '0') + ':' + String(startM).padStart(2, '0');
    const editingEndTime = String(endH).padStart(2, '0') + ':' + String(endM).padStart(2, '0');
    this.setData({
      showTimeModal: true,
      editingEntryId: id,
      editingStartTime: editingStartTime,
      editingEndTime: editingEndTime,
      startPickerValue: startPickerValue.map(v => Math.max(0, v)),
      endPickerValue: endPickerValue.map(v => Math.max(0, v))
    });
  },

  showAddTimeModal(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    this.showTimeModalByLongPress(e);
  },

  hideAddTimeModal() {
    this.setData({
      showTimeModal: false,
      editingEntryId: '',
      editingStartTime: '',
      editingEndTime: ''
    });
  },

  onStartPickerChange(e) {
    const val = e.detail.value;
    const h = this.data.hourList[val[0]];
    const m = this.data.minuteList[val[1]];
    this.setData({
      startPickerValue: val,
      editingStartTime: h + ':' + m
    });
  },

  onEndPickerChange(e) {
    const val = e.detail.value;
    const h = this.data.hourList[val[0]];
    const m = this.data.minuteList[val[1]];
    this.setData({
      endPickerValue: val,
      editingEndTime: h + ':' + m
    });
  },

  saveEntryTime() {
    const { editingEntryId, editingStartTime, editingEndTime } = this.data;
    if (!editingStartTime || !editingEndTime) {
      wx.showToast({ title: '请选择开始和结束时间', icon: 'none' });
      return;
    }
    try {
      fragmentService.updateEntryTime(this.data.date, editingEntryId, editingStartTime, editingEndTime);
      this.hideAddTimeModal();
      this.loadData();
      wx.showToast({ title: '已保存时间', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  toggleEditMode() {
    this.setData({ isEditMode: !this.data.isEditMode });
  },

  deleteEntry(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.showModal({
      title: '删除',
      content: '确定删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          fragmentService.deleteEntry(this.data.date, id);
          this.loadData();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
  },

  // 处理输入确认
  handleInputConfirm(e) {
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
      const options = { date: this.data.date, images, voicePath };
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
  previewImage(e) {
    const { images, index } = e.currentTarget.dataset;
    if (!images || images.length === 0) {
      return;
    }
    
    wx.previewImage({
      urls: images,
      current: images[index || 0]
    });
  },

  // 播放/暂停语音
  playVoice(e) {
    const path = e.currentTarget.dataset.path;
    if (!path) return;

    if (this._voiceContext && this.data.playingVoice === path) {
      this._voiceContext.pause();
      this.setData({ playingVoice: '' });
      return;
    }

    if (this._voiceContext) {
      this._voiceContext.stop();
      this._voiceContext.destroy();
    }

    const ctx = wx.createInnerAudioContext();
    ctx.src = path;
    ctx.obeyMuteSwitch = false;
    ctx.onPlay(() => this.setData({ playingVoice: path }));
    ctx.onEnded(() => this.setData({ playingVoice: '' }));
    ctx.onError(() => {
      this.setData({ playingVoice: '' });
      wx.showToast({ title: '播放失败', icon: 'none' });
    });
    ctx.play();
    this._voiceContext = ctx;
    this.setData({ playingVoice: path });
  }
});
