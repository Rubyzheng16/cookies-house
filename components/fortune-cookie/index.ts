// 幸运饼干组件
Component({
  data: {
    isBroken: false,
    fortune: '',
    loading: false
  },

  methods: {
    breakCookie() {
      if (this.data.isBroken) {
        this.setData({
          isBroken: false,
          fortune: ''
        });
        return;
      }

      this.setData({ loading: true });

      // 本地任务列表
      const boringTasks = [
        "数一数地板上有多少块瓷砖。",
        "对着窗户发呆5分钟，寻找一朵像猫的云。",
        "给家里的每一盆绿植取个名字。",
        "尝试用非惯用手画一个完美的圆。",
        "闭上眼，仔细分辨空气中可以闻到的三种味道。",
        "整理一下你的袜子，给它们重新配对。",
        "盯着水龙头，等它滴下一滴水。",
        "在纸上写满自己的名字，直到觉得不认识这几个字。",
        "寻找家里最老的一样东西，摸摸它。",
        "做一个深呼吸，屏住5秒后再慢慢吐出来。",
        "看蚂蚁搬家，如果没有蚂蚁就看影子移动。"
      ];

      // 模拟延迟
      setTimeout(() => {
        const fortune = boringTasks[Math.floor(Math.random() * boringTasks.length)];
        this.setData({
          fortune,
          isBroken: true,
          loading: false
        });
      }, 1000);
    }
  }
});
