// 输入弹窗组件
import { CookieType } from '../../types';
import { saveImages, saveTempFile } from '../../utils/file';

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  observers: {
    'show': function(newVal: boolean) {
      if (!newVal) {
        (this as any).setData({
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
    selectedType: null as CookieType | null,
    showRef: false,
    isBaking: false,
    canConfirm: false,
    selectedImages: [] as string[],
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
    _updateCanConfirm(this: any) {
      const hasText = this.data.inputValue && this.data.inputValue.trim().length > 0;
      const hasImages = this.data.selectedImages && this.data.selectedImages.length > 0;
      const hasVoice = !!this.data.voicePath;
      this.setData({ canConfirm: hasText || hasImages || hasVoice });
    },

    onInputChange(e: any) {
      const value = e.detail.value || '';
      this.setData({ inputValue: value });
      (this as any)._updateCanConfirm();
    },

    toggleType(e: any) {
      const type = e.currentTarget.dataset.type as CookieType;
      this.setData({ selectedType: this.data.selectedType === type ? null : type });
    },

    toggleRef() {
      this.setData({ showRef: !this.data.showRef });
    },

    closeModal() {
      if (this.data.isRecording) (this as any)._stopRecord();
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
        success: async (res: any) => {
          const tempPaths = res.tempFilePaths || [];
          if (tempPaths.length === 0) return;
          wx.showLoading({ title: '保存中...' });
          try {
            const savedPaths = await saveImages(tempPaths);
            const merged = [...(this.data.selectedImages || []), ...savedPaths];
            this.setData({ selectedImages: merged });
            (this as any)._updateCanConfirm();
            wx.showToast({ title: `已添加 ${savedPaths.length} 张`, icon: 'success' });
          } catch (e) {
            wx.showToast({ title: '保存失败', icon: 'none' });
          }
        }
      });
    },

    removeImage(e: any) {
      const idx = e.currentTarget.dataset.index;
      const arr = [...(this.data.selectedImages || [])];
      arr.splice(idx, 1);
      this.setData({ selectedImages: arr });
      (this as any)._updateCanConfirm();
    },

    startRecord() {
      if (this.data.isRecording) {
        (this as any)._stopRecord();
        return;
      }
      (this as any)._recorder = (this as any)._recorder || wx.getRecorderManager();
      const recorder = (this as any)._recorder;
      recorder.onStop(async (res: any) => {
        if (!res.tempFilePath) return;
        wx.showLoading({ title: '保存中...' });
        try {
          const saved = await saveTempFile(res.tempFilePath, 'voice', '.mp3');
          this.setData({ voicePath: saved, isRecording: false });
          (this as any)._updateCanConfirm();
          wx.showToast({ title: '录音已保存', icon: 'success' });
        } catch (e) {
          this.setData({ isRecording: false });
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      });
      recorder.onError(() => {
        this.setData({ isRecording: false });
        wx.showToast({ title: '录音失败', icon: 'none' });
      });
      recorder.start({ duration: 60000, format: 'mp3' });
      this.setData({ isRecording: true });
      wx.showToast({ title: '录音中，再次点击结束', icon: 'none' });
    },

    _stopRecord() {
      const r = (this as any)._recorder;
      if (r && this.data.isRecording) r.stop();
    },

    removeVoice() {
      this.setData({ voicePath: '' });
      (this as any)._updateCanConfirm();
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
