// 文件夹组件
import { CookieType } from '../../types/index.js';
import { COOKIE_METADATA } from '../../constants/index.js';
import { dateUtils } from '../../utils/date.js';

Component({
  properties: {
    folder: {
      type: Object,
      value: {}
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

    getEntriesByType(type) {
      return this.properties.folder.entries.filter(e => e.type === type);
    },

    formatTime(timestamp) {
      return dateUtils.formatTime(timestamp);
    },

    getCookieMetadata(type) {
      return COOKIE_METADATA[type];
    },

    handleAnalyze() {
      this.triggerEvent('analyze', { date: this.properties.folder.date });
    }
  }
});
