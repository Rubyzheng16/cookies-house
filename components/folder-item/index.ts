// 文件夹组件
import { DayFolder, CookieType } from '../../types';
import { COOKIE_METADATA } from '../../constants';
import { dateUtils } from '../../utils/date';

Component({
  properties: {
    folder: {
      type: Object,
      value: {} as DayFolder
    }
  },

  data: {
    isOpen: true
  },

  methods: {
    toggleOpen() {
      this.setData({
        isOpen: !this.data.isOpen
      });
    },

    getEntriesByType(type: CookieType) {
      return this.properties.folder.entries.filter((e: any) => e.type === type);
    },

    formatTime(timestamp: number) {
      return dateUtils.formatTime(timestamp);
    },

    getCookieMetadata(type: CookieType) {
      return COOKIE_METADATA[type];
    },

    handleAnalyze() {
      this.triggerEvent('analyze', { date: this.properties.folder.date });
    }
  }
});
