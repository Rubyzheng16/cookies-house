// 自定义tabBar
Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '饼干屋',
        icon: '🍪'
      },
      {
        pagePath: '/pages/lab/lab',
        text: '品鉴室',
        icon: '🔬'
      },
      {
        pagePath: '/pages/future/future',
        text: '糖果罐',
        icon: '🍬'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        icon: '👤'
      }
    ]
  },

  attached() {
    this.setSelected();
  },

  methods: {
    setSelected() {
      const pages = getCurrentPages();
      if (pages.length === 0) {
        return;
      }
      const currentPage = pages[pages.length - 1];
      if (!currentPage || !currentPage.route) {
        return;
      }
      const url = currentPage.route;
      
      const index = this.data.list.findIndex(item => item.pagePath === `/${url}`);
      this.setData({
        selected: index >= 0 ? index : 0
      });
    },

    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const url = this.data.list[index].pagePath;
      
      wx.switchTab({
        url: url
      });
      
      this.setData({
        selected: index
      });
    },

    // 点击加号按钮
    onAddClick() {
      // 触发全局事件，通知当前页面显示输入框
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage) {
        // 尝试调用页面的onAddButtonClick方法
        if (typeof currentPage.onAddButtonClick === 'function') {
          currentPage.onAddButtonClick();
        } else if (typeof currentPage.setData === 'function') {
          // 如果方法不存在，直接设置showInputModal
          currentPage.setData({
            showInputModal: true
          });
        }
      }
    }
  }
});
