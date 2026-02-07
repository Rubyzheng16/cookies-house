// 输入弹窗组件
import { CookieType } from '../../types/index.js';
import { saveImages, saveTempFile } from '../../utils/file.js';

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  observers: {
    'show': function(newVal) {
      if (!newVal) {
        this.setData({
          inputValue: '',
          selectedType: null,
          showRef: false,
          isBaking: false,
          canConfirm: false,
          selectedImages: [],
          voicePath: ''
        });
      }
    }
  },

  data: {
    inputValue: '',
    selectedType: null,
    showRef: false,
    isBaking: false,
    canConfirm: false,
    selectedImages: [],
    voicePath: '',
    isRecording: false,
    quadrantTypes: [
      { type: CookieType.IMPORTANT_NOT_URGENT, color: '#81C784', icon: '🍵', label: '重要不紧急' },
      { type: CookieType.IMPORTANT_URGENT, color: '#FF80AB', icon: '🍓', label: '紧急重要' },
      { type: CookieType.NOT_IMPORTANT_NOT_URGENT, color: '#B39DDB', icon: '🫐', label: '不重要不紧急' },
      { type: CookieType.URGENT_NOT_IMPORTANT, color: '#FFF176', icon: '🍋', label: '紧急不重要' }
    ]
  },

  methods: {
    _updateCanConfirm() {
      const hasText = this.data.inputValue && this.data.inputValue.trim().length > 0;
      const hasImages = this.data.selectedImages && this.data.selectedImages.length > 0;
      const hasVoice = !!this.data.voicePath;
      this.setData({ canConfirm: hasText || hasImages || hasVoice });
    },

    onInputChange(e) {
      const value = e.detail.value || '';
      this.setData({ inputValue: value });
      this._updateCanConfirm();
    },

    toggleType(e) {
      const type = e.currentTarget.dataset.type;
      this.setData({ selectedType: this.data.selectedType === type ? null : type });
    },

    toggleRef() {
      this.setData({ showRef: !this.data.showRef });
    },

    closeModal() {
      if (this.data.isRecording) {
        this._stopRecord();
      }
      this.setData({
        show: false,
        inputValue: '',
        selectedType: null,
        showRef: false,
        isBaking: false,
        canConfirm: false,
        selectedImages: [],
        voicePath: ''
      });
      this.triggerEvent('close');
    },

    stopPropagation() {},

    // 选择图片：选多张，保存到本地
    async chooseImage() {
      const remain = 9 - (this.data.selectedImages?.length || 0);
      if (remain <= 0) {
        wx.showToast({ title: '最多 9 张图片', icon: 'none' });
        return;
      }
      wx.chooseImage({
        count: remain,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempPaths = res.tempFilePaths || [];
          if (tempPaths.length === 0) return;
          wx.showLoading({ title: '保存中...' });
          try {
            const savedPaths = await saveImages(tempPaths);
            const merged = [...(this.data.selectedImages || []), ...savedPaths];
            this.setData({ selectedImages: merged });
            this._updateCanConfirm();
            wx.showToast({ title: `已添加 ${savedPaths.length} 张`, icon: 'success' });
          } catch (e) {
            wx.showToast({ title: '保存失败', icon: 'none' });
          }
        }
      });
    },

    removeImage(e) {
      const idx = e.currentTarget.dataset.index;
      const arr = [...(this.data.selectedImages || [])];
      arr.splice(idx, 1);
      this.setData({ selectedImages: arr });
      this._updateCanConfirm();
    },

    // 开始/停止录音
    startRecord() {
      if (this.data.isRecording) {
        this._stopRecord();
        return;
      }
      this._recorder = this._recorder || wx.getRecorderManager();
      this._recorder.onStop(async (res) => {
        if (!res.tempFilePath) return;
        wx.showLoading({ title: '保存中...' });
        try {
          const saved = await saveTempFile(res.tempFilePath, 'voice', '.mp3');
          this.setData({ voicePath: saved, isRecording: false });
          this._updateCanConfirm();
          wx.showToast({ title: '录音已保存', icon: 'success' });
        } catch (e) {
          this.setData({ isRecording: false });
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      });
      this._recorder.onError(() => {
        this.setData({ isRecording: false });
        wx.showToast({ title: '录音失败', icon: 'none' });
      });
      this._recorder.start({ duration: 60000, format: 'mp3' });
      this.setData({ isRecording: true });
      wx.showToast({ title: '录音中，再次点击结束', icon: 'none' });
    },

    _stopRecord() {
      if (this._recorder && this.data.isRecording) {
        this._recorder.stop();
      }
    },

    // 移除语音
    removeVoice() {
      this.setData({ voicePath: '' });
      this._updateCanConfirm();
    },

    async handleConfirm() {
      if (!this.data.canConfirm) {
        wx.showToast({ title: '请输入文字、选择图片或录制语音', icon: 'none' });
        return;
      }
      if (this.data.isBaking) return;
      if (this.data.isRecording) {
        wx.showToast({ title: '请先结束录音', icon: 'none' });
        return;
      }

      this.setData({ isBaking: true });

      const type = this.data.selectedType || CookieType.MUMBLING;
      const text = (this.data.inputValue || '').trim() || (this.data.voicePath ? '[语音]' : '');
      const images = this.data.selectedImages || [];
      const voicePath = this.data.voicePath || '';

      this.setData({
        inputValue: '',
        selectedType: null,
        selectedImages: [],
        voicePath: '',
        isBaking: false,
        show: false,
        canConfirm: false
      });

      this.triggerEvent('confirm', {
        text,
        type,
        images: images.length > 0 ? images : undefined,
        voicePath: voicePath || undefined
      });
    }
  }
});
