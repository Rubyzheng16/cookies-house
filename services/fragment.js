// 碎片管理服务
import { CookieType } from '../types/index.js';
import { storage } from '../utils/storage.js';
import { dateUtils } from '../utils/date.js';

export const fragmentService = {
  // 获取所有文件夹
  getFolders() {
    const saved = storage.getCookies();
    if (saved.length === 0) {
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

  // 添加碎片
  addEntry(text, type) {
    const folders = this.getFolders();
    const todayStr = dateUtils.getTodayString();
    
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      timestamp: Date.now()
    };

    const existingFolderIndex = folders.findIndex(f => f.date === todayStr);
    
    if (existingFolderIndex > -1) {
      folders[existingFolderIndex].entries.unshift(newEntry);
    } else {
      folders.unshift({ date: todayStr, entries: [newEntry] });
    }

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
