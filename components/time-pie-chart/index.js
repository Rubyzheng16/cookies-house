// 24 小时环图 - 已记录时间彩色，未记录时间浅巧克力色
import { CookieType } from '../../types/index.js';
import { COOKIE_METADATA } from '../../constants/index.js';

const MINUTES_PER_DAY = 24 * 60;
const DEFAULT_DURATION_MIN = 5; // 无时间范围的条目默认 5 分钟

const TYPE_ORDER = [
  CookieType.IMPORTANT_URGENT,
  CookieType.IMPORTANT_NOT_URGENT,
  CookieType.URGENT_NOT_IMPORTANT,
  CookieType.NOT_IMPORTANT_NOT_URGENT,
  CookieType.MUMBLING
];

function parseTimeToMinutes(t) {
  if (!t || typeof t !== 'string') return 0;
  const p = t.split(':').map(Number);
  return (p[0] || 0) * 60 + (p[1] || 0);
}

function getEntryDurationMinutes(entry) {
  if (entry.startTime && entry.endTime) {
    const start = parseTimeToMinutes(entry.startTime);
    const end = parseTimeToMinutes(entry.endTime);
    const mins = end > start ? end - start : end + (MINUTES_PER_DAY - start);
    return Math.max(1, Math.min(mins, MINUTES_PER_DAY));
  }
  return DEFAULT_DURATION_MIN;
}

Component({
  properties: {
    entries: { type: Array, value: [] }
  },

  data: {
    slices: [],
    hasData: false,
    totalRecordedMinutes: 0,
    totalRecordedText: ''
  },

  observers: {
    'entries': function (entries) {
      this.calculateSlices(entries || []);
    }
  },

  methods: {
    formatDuration(minutes) {
      if (minutes < 60) return minutes + '分钟';
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? h + '小时' + m + '分钟' : h + '小时';
    },

    calculateSlices(entries) {
      if (!entries || entries.length === 0) {
        this.setData({ slices: [], hasData: false, totalRecordedText: '' });
        return;
      }

      let totalRecorded = 0;
      const taskMap = {};
      let mumblingMins = 0;

      entries.forEach((e) => {
        const mins = getEntryDurationMinutes(e);
        const type = TYPE_ORDER.includes(e.type) ? e.type : CookieType.MUMBLING;
        const meta = COOKIE_METADATA[type];

        if (type === CookieType.MUMBLING) {
          mumblingMins += mins;
        } else {
          const label = (e.text && e.text.trim()) ? e.text.trim() : meta.name;
          const shortLabel = label.length > 8 ? label.slice(0, 8) + '…' : label;
          const key = type + '|' + shortLabel;
          if (!taskMap[key]) {
            taskMap[key] = { type, label: shortLabel, color: meta.color, minutes: 0 };
          }
          taskMap[key].minutes += mins;
        }
        totalRecorded += mins;
      });

      const slices = [];

      if (mumblingMins > 0) {
        const meta = COOKIE_METADATA[CookieType.MUMBLING];
        slices.push({
          type: '_mumbling',
          label: '碎碎念',
          color: meta.color,
          minutes: mumblingMins,
          durationText: this.formatDuration(mumblingMins),
          percent: 0,
          startAngle: 0,
          endAngle: 0
        });
      }

      Object.values(taskMap).forEach((t) => {
        slices.push({
          type: t.type + '_' + t.label,
          label: t.label,
          color: t.color,
          minutes: t.minutes,
          durationText: this.formatDuration(t.minutes),
          percent: 0,
          startAngle: 0,
          endAngle: 0
        });
      });

      const unrecorded = Math.max(0, MINUTES_PER_DAY - totalRecorded);
      const totalForChart = totalRecorded + unrecorded;

      let cumulativePercent = 0;
      slices.forEach((s) => {
        s.percent = s.minutes / totalForChart;
        s.startAngle = cumulativePercent * 2 * Math.PI;
        cumulativePercent += s.percent;
        s.endAngle = cumulativePercent * 2 * Math.PI;
      });

      if (unrecorded > 0) {
        const percent = unrecorded / totalForChart;
        const startAngle = cumulativePercent * 2 * Math.PI;
        cumulativePercent += percent;
        slices.push({
          type: '_unrecorded',
          label: '未记录',
          color: '#D4B896',
          minutes: unrecorded,
          durationText: this.formatDuration(unrecorded),
          percent,
          startAngle,
          endAngle: cumulativePercent * 2 * Math.PI
        });
      }

      const totalText = this.formatDuration(totalRecorded);

      this.setData({
        slices,
        hasData: slices.length > 0,
        totalRecordedMinutes: totalRecorded,
        totalRecordedText: totalText
      }, () => {
        if (slices.length > 0) {
          this.drawPie(slices);
        }
      });
    },

    drawPie(slices) {
      const ctx = wx.createCanvasContext('timePieCanvas', this);
      const size = 180; // 对应 360rpx 画布
      const cx = size / 2;
      const cy = size / 2;
      const outerR = size / 2 - 8;
      const innerR = outerR * 0.5;
      let startAngle = -Math.PI / 2;

      slices.forEach((s) => {
        const sweep = s.percent * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep);
        ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle, true);
        ctx.closePath();
        ctx.setFillStyle(s.color);
        ctx.fill();
        startAngle += sweep;
      });

      ctx.draw();
    }
  }
});
