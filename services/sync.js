// 云端同步：自动上传 / 手动备份与恢复（与后端 /api/sync 对接）
const { API_BASE_URL } = require('../config/index.js');
const auth = require('./auth.js');

const SYNC_KEYS = [
  'emotion_cookies',
  'cookie_goals',
  'user_info',
  'enrichment_data',
  'skill_tree_data',
  'diary_prompt_custom',
  'user_vip',
  'counselor_diary',
];

function getSnapshot() {
  const snapshot = {};
  for (const key of SYNC_KEYS) {
    try {
      const val = wx.getStorageSync(key);
      if (val !== undefined && val !== '') snapshot[key] = val;
    } catch (e) {
      // skip
    }
  }
  return snapshot;
}

function applySnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;
  for (const key of SYNC_KEYS) {
    if (snapshot[key] !== undefined) {
      try {
        wx.setStorageSync(key, snapshot[key]);
      } catch (e) {
        console.error('applySnapshot key:', key, e);
      }
    }
  }
}

/**
 * 上传当前本地数据到云端（手动「备份到云端」或自动上传时调用）
 */
function uploadSnapshot() {
  const token = auth.getToken();
  if (!token) return Promise.resolve();

  const snapshot = getSnapshot();
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/api/sync/upload`,
      method: 'POST',
      data: snapshot,
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      success: (res) => {
        const data = res.data || {};
        if (res.statusCode === 200 && data.code === 0) {
          resolve(data.data);
        } else {
          reject(new Error(data.message || '上传失败'));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

/**
 * 从云端拉取数据并合并到本地（启动时或手动「从云端恢复」时调用）
 * 若云端有数据则覆盖本地对应 key
 */
function downloadAndRestore() {
  const token = auth.getToken();
  if (!token) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/api/sync/download`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}` },
      success: (res) => {
        const data = res.data || {};
        if (res.statusCode === 200 && data.code === 0 && data.data) {
          const { snapshot, updatedAt } = data.data;
          if (snapshot && Object.keys(snapshot).length > 0) {
            applySnapshot(snapshot);
          }
          resolve({ updatedAt, hasData: snapshot && Object.keys(snapshot).length > 0 });
        } else {
          reject(new Error(data.message || '拉取失败'));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

module.exports = { uploadSnapshot, downloadAndRestore };
