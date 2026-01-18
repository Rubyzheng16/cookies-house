// 全局加号按钮组件
Component({
  methods: {
    // 点击加号按钮
    onAddClick() {
      // 触发事件，通知页面显示输入框
      this.triggerEvent('add');
    }
  }
});
