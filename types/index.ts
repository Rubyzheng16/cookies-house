// 类型定义
export enum CookieType {
  IMPORTANT_URGENT = 'IMPORTANT_URGENT',       // 树莓夹心 (Raspberry)
  IMPORTANT_NOT_URGENT = 'IMPORTANT_NOT_URGENT', // 抹茶曲奇 (Matcha)
  URGENT_NOT_IMPORTANT = 'URGENT_NOT_IMPORTANT', // 柠檬塔 (Lemon)
  NOT_IMPORTANT_NOT_URGENT = 'NOT_IMPORTANT_NOT_URGENT', // 蓝莓马卡龙 (Blueberry)
  MUMBLING = 'MUMBLING' // 碎碎念
}

export interface CookieEntry {
  id: string;
  text: string;
  type: CookieType;
  timestamp: number;
  /** 任务开始时间 HH:mm，仅任务类型可选填写 */
  startTime?: string;
  /** 任务结束时间 HH:mm，仅任务类型可选填写 */
  endTime?: string;
  image?: string; // 单张图片（兼容旧数据）
  images?: string[]; // 多张图片
  voicePath?: string; // 语音文件本地路径
}

export interface DayFolder {
  date: string; // YYYY/MM/DD
  entries: CookieEntry[];
  analysis?: string;
  /** 文件夹封面图索引（用于保证每一天的样式稳定不变） */
  folderImageIndex?: number;
  /** 运行时使用的实际封面图片路径 */
  folderImage?: string;
}

export interface GoalStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  steps: GoalStep[];
  candyCount: number;
  isCompleted: boolean;
}

export type AppView = 'workbench' | 'lab' | 'future' | 'profile';

/** 后端返回的用户信息（与 README users 表一致） */
export interface User {
  id: number;
  wxOpenId: string;
  phone?: string;
  vipLevel: 'free' | 'vip';
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
