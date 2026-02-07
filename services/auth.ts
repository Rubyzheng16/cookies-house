// 登录/注册：微信 code 登录、token 与用户信息存储（与后端 /api/auth 对接）
// 这里直接声明 wx 为 any，避免 TS 对微信小程序全局类型的报错
declare const wx: any;

import { API_BASE_URL } from '../config';
import type { User } from '../types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface LoginRes {
  code: number;
  message: string;
  data?: { token: string; user: User };
}

interface MeRes {
  code: number;
  data?: { user: User };
}

/** 使用 wx.login 得到的 code 登录/注册，返回用户信息并写入本地 */
export function login(code: string): Promise<User> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/api/auth/login`,
      method: 'POST',
      data: { code },
      header: { 'Content-Type': 'application/json' },
      success: (res: any) => {
        const data = res.data as LoginRes;
        if (res.statusCode === 200 && data.code === 0 && data.data) {
          wx.setStorageSync(TOKEN_KEY, data.data.token);
          wx.setStorageSync(USER_KEY, data.data.user);
          resolve(data.data.user);
        } else {
          reject(new Error(data.message || `登录失败: ${res.statusCode}`));
        }
      },
      fail: (err: any) => reject(err),
    });
  });
}

/** 拉取当前用户信息（需已登录） */
export function getMe(): Promise<User> {
  const token = getToken();
  if (!token) return Promise.reject(new Error('未登录'));
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/api/auth/me`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}` },
      success: (res: any) => {
        const data = res.data as MeRes;
        if (res.statusCode === 200 && data.code === 0 && data.data?.user) {
          wx.setStorageSync(USER_KEY, data.data.user);
          resolve(data.data.user);
        } else {
          if (res.statusCode === 401) clearAuth();
          reject(new Error('获取用户信息失败'));
        }
      },
      fail: (err: any) => reject(err),
    });
  });
}

/** 绑定手机号（需已登录，且小程序已认证） */
export function bindPhone(phoneCode: string): Promise<User> {
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
      success: (res: any) => {
        const data = res.data as { code: number; message?: string; data?: { user: User } };
        if (res.statusCode === 200 && data.code === 0 && data.data?.user) {
          wx.setStorageSync(USER_KEY, data.data.user);
          resolve(data.data.user);
        } else {
          reject(new Error(data.message || '绑定手机号失败'));
        }
      },
      fail: (err: any) => reject(err),
    });
  });
}

export function getToken(): string {
  return wx.getStorageSync(TOKEN_KEY) || '';
}

export function getUser(): User | null {
  return wx.getStorageSync(USER_KEY) || null;
}

export function clearAuth(): void {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
