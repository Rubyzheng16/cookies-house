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
    // 自动修复旧数据（避免使用对象展开语法，改用Object.assign）
    const folders = saved.map((folder: any) => {
      const fixedFolder: any = Object.assign({}, folder);
      fixedFolder.entries = (folder.entries || []).map((entry: any) => {
        const fixedEntry: any = Object.assign({}, entry);
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
  saveFolders(folders: DayFolder[]) {
    storage.saveCookies(folders);
  },

  // 添加碎片
  // options: { startTime?, endTime?, date?, images?, voicePath? }
  addEntry(text: string, type: CookieType, options: { startTime?: string; endTime?: string; date?: string; images?: string[]; voicePath?: string } = {}): DayFolder[] {
    const folders = this.getFolders();
    const targetDate = options.date || dateUtils.getTodayString();
    
    const newEntry: CookieEntry = {
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
  deleteEntry(date: string, entryId: string): DayFolder[] {
    const folders = this.getFolders();
    const folder = folders.find(f => f.date === date);
    if (!folder) return folders;
    folder.entries = folder.entries.filter(e => e.id !== entryId);
    this.saveFolders(folders);
    return folders;
  },

  // 更新条目的时间范围
  updateEntryTime(date: string, entryId: string, startTime: string, endTime: string): DayFolder[] {
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
  updateAnalysis(date: string, analysis: string): DayFolder[] {
    const folders = this.getFolders();
    const folder = folders.find(f => f.date === date);
    if (folder) {
      folder.analysis = analysis;
      this.saveFolders(folders);
    }
    return folders;
  },

  // 删除文件夹
  deleteFolder(date: string): DayFolder[] {
    const folders = this.getFolders();
    const filtered = folders.filter(f => f.date !== date);
    this.saveFolders(filtered);
    return filtered;
  },

  // 清空所有数据
  clearAllData(): void {
    storage.saveCookies([]);
  },

  // 修复旧数据：为缺少timestamp的条目添加timestamp
  fixOldData(): DayFolder[] {
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
