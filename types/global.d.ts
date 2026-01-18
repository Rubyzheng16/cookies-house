// 微信小程序全局类型定义
declare const Page: (options: any) => void;
declare const Component: (options: any) => void;
declare const App: (options: any) => void;
declare const getApp: () => any;
declare const getCurrentPages: () => any[];

declare namespace wx {
  function navigateTo(options: { url: string; success?: () => void; fail?: () => void; complete?: () => void }): void;
  function navigateBack(options?: { delta?: number }): void;
  function showToast(options: { title: string; icon?: 'success' | 'loading' | 'none'; duration?: number; mask?: boolean }): void;
  function showLoading(options: { title: string; mask?: boolean }): void;
  function hideLoading(): void;
  function getStorageSync(key: string): any;
  function setStorageSync(key: string, data: any): void;
  function chooseImage(options: { count?: number; success?: (res: any) => void; fail?: () => void }): void;
  function createAnimation(options?: { duration?: number; timingFunction?: string; delay?: number; transformOrigin?: string }): {
    scale: (value: number) => any;
    opacity: (value: number) => any;
    step: (options?: any) => any;
    export: () => any;
  };
}

declare function setTimeout(callback: () => void, delay: number): number;
declare function clearTimeout(id: number): void;
