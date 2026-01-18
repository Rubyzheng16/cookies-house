// 碎片管理服务
import { DayFolder, CookieEntry, CookieType } from '../types';
import { storage } from '../utils/storage';
import { dateUtils } from '../utils/date';

export const fragmentService = {
  // 获取所有文件夹
  getFolders(): DayFolder[] {
    const saved = storage.getCookies();
    if (saved.length === 0) {
      return [{ date: dateUtils.getTodayString(), entries: [] }];
    }
    return saved;
  },

  // 保存文件夹
  saveFolders(folders: DayFolder[]) {
    storage.saveCookies(folders);
  },

  // 添加碎片
  addEntry(text: string, type: CookieType): DayFolder[] {
    const folders = this.getFolders();
    const todayStr = dateUtils.getTodayString();
    
    const newEntry: CookieEntry = {
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
  updateAnalysis(date: string, analysis: string): DayFolder[] {
    const folders = this.getFolders();
    const folder = folders.find(f => f.date === date);
    if (folder) {
      folder.analysis = analysis;
      this.saveFolders(folders);
    }
    return folders;
  }
};
