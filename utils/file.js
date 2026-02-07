/**
 * 文件保存工具：将临时文件保存到持久化路径
 * 用于图片、语音等在小程序内长期存储
 */

/**
 * 保存临时文件到用户数据目录
 * @param {string} tempFilePath - wx.chooseImage 或 RecorderManager 返回的临时路径
 * @param {string} subDir - 子目录，如 'images' 或 'voice'
 * @param {string} ext - 扩展名，如 '.jpg' 或 '.mp3'
 * @returns {Promise<string>} 保存后的持久化路径
 */
export function saveTempFile(tempFilePath, subDir = 'images', ext = '.jpg') {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    const baseDir = `${wx.env.USER_DATA_PATH}/${subDir}`;
    
    try {
      fs.mkdirSync(baseDir, { recursive: true });
    } catch (e) {
      // 目录可能已存在，忽略
    }

    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = `${baseDir}/${fileName}`;

    fs.saveFile({
      tempFilePath,
      filePath,
      success: (res) => resolve(res.savedFilePath || filePath),
      fail: reject
    });
  });
}

/**
 * 批量保存多张图片
 * @param {string[]} tempFilePaths - 临时路径数组
 * @returns {Promise<string[]>} 保存后的路径数组
 */
export async function saveImages(tempFilePaths) {
  const results = [];
  for (const path of tempFilePaths) {
    const ext = (path || '').toLowerCase().includes('.png') ? '.png' : '.jpg';
    const saved = await saveTempFile(path, 'images', ext);
    results.push(saved);
  }
  return results;
}
