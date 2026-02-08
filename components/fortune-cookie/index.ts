// 幸运饼干组件（丰容板块 AI 生成，图片版）
import { FORTUNE_COOKIE_WHOLE, FORTUNE_COOKIE_BROKEN } from '../../constants/index.js';

Component({
  properties: {
    todayFortune: { type: Object, value: null },
    loading: { type: Boolean, value: false }
  },

  data: {
    isBroken: false,
    awaitingFetch: false,
    imgWhole: FORTUNE_COOKIE_WHOLE,
    imgBroken: FORTUNE_COOKIE_BROKEN
  },

  observers: {
    'todayFortune': function (f) {
      if (f && f.content && this.data.awaitingFetch) {
        this.setData({ isBroken: true, awaitingFetch: false });
      }
    }
  },

  methods: {
    breakCookie() {
      if (this.data.isBroken) {
        this.setData({
          isBroken: false
        });
        return;
      }

      const { todayFortune } = this.properties;

      if (todayFortune && todayFortune.content) {
        this.setData({ isBroken: true });
      } else {
        this.setData({ awaitingFetch: true });
        this.triggerEvent('fetch');
      }
    },

    onComplete() {
      this.setData({ isBroken: false });
      this.triggerEvent('complete');
    }
  }
});
