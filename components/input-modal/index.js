// 输入弹窗组件
import { CookieType } from '../../types/index.js';

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  observers: {
    'show': function(newVal) {
      const that = this;
      if (!newVal) {
        // 关闭时重置状态
        that.setData({
          inputValue: '',
          selectedType: null,
          showRef: false,
          isBaking: false,
          canConfirm: false
        });
      }
    },
    'inputValue': function(newVal) {
      const that = this;
      const canConfirm = newVal && newVal.trim().length > 0;
      that.setData({ canConfirm: canConfirm });
    }
  },

  data: {
    inputValue: '',
    selectedType: null,
    showRef: false,
    isBaking: false,
    canConfirm: false,
    // 按象限布局排列：左上2、右上1、左下4、右下3
    quadrantTypes: [
      { type: CookieType.IMPORTANT_NOT_URGENT, color: '#81C784', icon: '🍵', label: '重要不紧急' },
      { type: CookieType.IMPORTANT_URGENT, color: '#FF80AB', icon: '🍓', label: '紧急重要' },
      { type: CookieType.NOT_IMPORTANT_NOT_URGENT, color: '#B39DDB', icon: '🫐', label: '不重要不紧急' },
      { type: CookieType.URGENT_NOT_IMPORTANT, color: '#FFF176', icon: '🍋', label: '紧急不重要' }
    ]
  },

  methods: {
    // 输入框内容变化
    onInputChange(e) {
      const value = e.detail.value || '';
      const canConfirm = value.trim().length > 0;
      this.setData({ 
        inputValue: value,
        canConfirm: canConfirm
      });
    },

    // 切换分类类型
    toggleType(e) {
      const type = e.currentTarget.dataset.type;
      this.setData({
        selectedType: this.data.selectedType === type ? null : type
      });
    },

    // 切换分类秘籍显示
    toggleRef() {
      this.setData({ showRef: !this.data.showRef });
    },

    // 关闭弹窗
    closeModal() {
      this.setData({ 
        show: false,
        inputValue: '',
        selectedType: null,
        showRef: false,
        isBaking: false,
        canConfirm: false
      });
      this.triggerEvent('close');
    },

    // 阻止事件冒泡
    stopPropagation() {
      // 空函数，用于阻止事件冒泡
    },

    // 选择图片
    chooseImage() {
      wx.chooseImage({
        count: 1,
        success: (res) => {
          // TODO: 处理图片选择
          wx.showToast({
            title: '图片功能待实现',
            icon: 'none'
          });
        }
      });
    },

    // 选择文件
    chooseFile() {
      wx.showToast({
        title: '文件功能待实现',
        icon: 'none'
      });
    },

    // 开始录音
    startRecord() {
      wx.showToast({
        title: '录音功能待实现',
        icon: 'none'
      });
    },

    // 确认添加
    handleConfirm() {
      if (!this.data.canConfirm || !this.data.inputValue.trim()) {
        wx.showToast({
          title: '请输入内容',
          icon: 'none'
        });
        return;
      }

      if (this.data.isBaking) {
        return;
      }

      this.setData({ isBaking: true });

      setTimeout(() => {
        const type = this.data.selectedType || CookieType.MUMBLING;
        const inputValue = this.data.inputValue;
        
        this.setData({
          inputValue: '',
          selectedType: null,
          isBaking: false,
          show: false,
          canConfirm: false
        });

        // 触发确认事件，传递数据给父组件
        this.triggerEvent('confirm', {
          text: inputValue,
          type: type
        });
      }, 800);
    }
  }
});
