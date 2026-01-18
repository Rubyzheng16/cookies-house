// 饼干图表组件
import { CookieEntry, CookieType } from '../../types';
import { COOKIE_METADATA } from '../../constants';

Component({
  properties: {
    entries: {
      type: Array,
      value: [] as CookieEntry[]
    }
  },

  data: {
    slices: [] as any[]
  },

  observers: {
    'entries': function(entries: CookieEntry[]) {
      this.calculateSlices(entries);
    }
  },

  methods: {
    calculateSlices(entries: CookieEntry[]) {
      const total = entries.length || 1;
      const counts = {
        [CookieType.IMPORTANT_URGENT]: entries.filter(e => e.type === CookieType.IMPORTANT_URGENT).length,
        [CookieType.IMPORTANT_NOT_URGENT]: entries.filter(e => e.type === CookieType.IMPORTANT_NOT_URGENT).length,
        [CookieType.URGENT_NOT_IMPORTANT]: entries.filter(e => e.type === CookieType.URGENT_NOT_IMPORTANT).length,
        [CookieType.NOT_IMPORTANT_NOT_URGENT]: entries.filter(e => e.type === CookieType.NOT_IMPORTANT_NOT_URGENT).length,
      };

      let cumulativePercent = 0;
      const slices: any[] = [];

      (Object.keys(counts) as CookieType[]).forEach(type => {
        const percent = counts[type] / total;
        if (percent === 0) return;

        const startAngle = cumulativePercent * 2 * Math.PI;
        cumulativePercent += percent;
        const endAngle = cumulativePercent * 2 * Math.PI;

        slices.push({
          type,
          startAngle,
          endAngle,
          percent,
          color: COOKIE_METADATA[type].color
        });
      });

      this.setData({ slices });
    },

    getPathData(slice: any) {
      const radius = 100;
      const startX = Math.cos(slice.startAngle - Math.PI / 2) * radius;
      const startY = Math.sin(slice.startAngle - Math.PI / 2) * radius;
      const endX = Math.cos(slice.endAngle - Math.PI / 2) * radius;
      const endY = Math.sin(slice.endAngle - Math.PI / 2) * radius;
      const largeArcFlag = slice.percent > 0.5 ? 1 : 0;

      return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
    }
  }
});
