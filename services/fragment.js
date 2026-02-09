// 碎片管理服务
import { CookieType } from '../types/index.js';
import { storage } from '../utils/storage.js';
import { dateUtils } from '../utils/date.js';

export const fragmentService = {
  // 获取所有文件夹（合并多个日期的数据，不会覆盖已有数据）
  getFolders() {
    const saved = storage.getCookies();
    if (!Array.isArray(saved) || saved.length === 0) {
      return [{ date: dateUtils.getTodayString(), entries: [] }];
    }
    // 自动修复旧数据（避免使用对象展开语法，改用Object.assign）
    const folders = saved.map((folder) => {
      const fixedFolder = Object.assign({}, folder);
      fixedFolder.entries = (folder.entries || []).map((entry) => {
        const fixedEntry = Object.assign({}, entry);
        if (!fixedEntry.timestamp) {
          fixedEntry.timestamp = Date.now();
        }
        return fixedEntry;
      });
      return fixedFolder;
    });
    return folders;
  },

  // 保存文件夹
  saveFolders(folders) {
    storage.saveCookies(folders);
  },

  // 添加碎片（会合并到现有文件夹，不会覆盖其他日期的数据）
  // options: { startTime?, endTime?, date?, images?, voicePath? }
  addEntry(text, type, options = {}) {
    const folders = this.getFolders();
    const targetDate = options.date || dateUtils.getTodayString();
    
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      text: text || '',
      type,
      timestamp: Date.now()
    };

    if (options.startTime && options.endTime) {
      newEntry.startTime = options.startTime;
      newEntry.endTime = options.endTime;
    }
    if (options.images && options.images.length > 0) {
      newEntry.images = options.images;
    }
    if (options.voicePath) {
      newEntry.voicePath = options.voicePath;
    }

    const existingFolderIndex = folders.findIndex(f => f.date === targetDate);
    
    if (existingFolderIndex > -1) {
      folders[existingFolderIndex].entries.unshift(newEntry);
    } else {
      folders.unshift({ date: targetDate, entries: [newEntry] });
    }

    this.saveFolders(folders);
    return folders;
  },

  // 删除单条碎碎念/任务
  deleteEntry(date, entryId) {
    const folders = this.getFolders();
    const folder = folders.find(f => f.date === date);
    if (!folder) return folders;
    folder.entries = folder.entries.filter(e => e.id !== entryId);
    this.saveFolders(folders);
    return folders;
  },

  // 更新条目的时间范围
  updateEntryTime(date, entryId, startTime, endTime) {
    const folders = this.getFolders();
    const folder = folders.find(f => f.date === date);
    if (!folder) return folders;
    const entry = folder.entries.find(e => e.id === entryId);
    if (!entry) return folders;
    entry.startTime = startTime;
    entry.endTime = endTime;
    this.saveFolders(folders);
    return folders;
  },

  // 更新文件夹分析
  updateAnalysis(date, analysis) {
    const folders = this.getFolders();
    const folder = folders.find(f => f.date === date);
    if (folder) {
      folder.analysis = analysis;
      this.saveFolders(folders);
    }
    return folders;
  },

  // 更新日记分析（diary, keyPoints, insights）
  updateDiaryAnalysis(date, diaryAnalysis) {
    const folders = this.getFolders();
    const folder = folders.find(f => f.date === date);
    if (folder) {
      folder.diaryAnalysis = diaryAnalysis;
      this.saveFolders(folders);
    }
    return folders;
  },

  // 删除文件夹
  deleteFolder(date) {
    const folders = this.getFolders();
    const filtered = folders.filter(f => f.date !== date);
    this.saveFolders(filtered);
    return filtered;
  },

  // 清空所有数据
  clearAllData() {
    storage.saveCookies([]);
  },

  // 修复旧数据：为缺少timestamp的条目添加timestamp
  fixOldData() {
    const folders = this.getFolders();
    let hasChanges = false;
    
    folders.forEach(folder => {
      folder.entries.forEach(entry => {
        if (!entry.timestamp) {
          entry.timestamp = Date.now();
          hasChanges = true;
        }
      });
    });
    
    if (hasChanges) {
      this.saveFolders(folders);
    }
    
    return folders;
  }
};
