// 登录/注册：微信 code 登录、token 与用户信息存储（与后端 /api/auth 对接）
// 说明：这是 JS 版本，保证在未正确配置 TypeScript 编译时，小程序也能正常运行。
// 真机调试时需在 config/index.js 中把 localhost 改成电脑局域网 IP
import { API_BASE_URL } from '../config/index.js';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// 使用 wx.login 得到的 code 登录/注册，返回用户信息并写入本地
export function login(code) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/api/auth/login`,
      method: 'POST',
      data: { code },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        const data = res.data || {};
        if (res.statusCode === 200 && data.code === 0 && data.data) {
          wx.setStorageSync(TOKEN_KEY, data.data.token);
          wx.setStorageSync(USER_KEY, data.data.user);
          resolve(data.data.user);
        } else {
          reject(new Error(data.message || `登录失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        const msg = err?.errMsg || err?.message || String(err);
        console.error('[auth] 登录请求失败:', msg);
        reject(new Error(msg));
      },
    });
  });
}

// 拉取当前用户信息（需已登录）
export function getMe() {
  const token = getToken();
  if (!token) return Promise.reject(new Error('未登录'));

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/api/auth/me`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}` },
      success: (res) => {
        const data = res.data || {};
        if (res.statusCode === 200 && data.code === 0 && data.data && data.data.user) {
          wx.setStorageSync(USER_KEY, data.data.user);
          resolve(data.data.user);
        } else {
          if (res.statusCode === 401) {
            clearAuth();
          }
          reject(new Error('获取用户信息失败'));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

// 绑定手机号（需已登录，且小程序已认证）
export function bindPhone(phoneCode) {
  const token = getToken();
  if (!token) return Promise.reject(new Error('未登录'));

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/api/auth/phone`,
      method: 'POST',
      data: { code: phoneCode },
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      success: (res) => {
        const data = res.data || {};
        if (res.statusCode === 200 && data.code === 0 && data.data && data.data.user) {
          wx.setStorageSync(USER_KEY, data.data.user);
          resolve(data.data.user);
        } else {
          reject(new Error(data.message || '绑定手机号失败'));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

export function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || '';
}

export function getUser() {
  return wx.getStorageSync(USER_KEY) || null;
}

export function clearAuth() {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

