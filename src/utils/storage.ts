import type { ProjectInfo } from '../types';

// 本地存储键名
export const STORAGE_KEY = 'account_management_data';

// 存储数据结构
export interface StorageData {
  customers: string[];
  projects: Record<string, string[]>;
  accounts: ProjectInfo[];
}

// 保存数据到本地存储
export function saveData(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 从本地存储加载数据
export function loadData(): StorageData {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data) as StorageData;
  }
  return {
    customers: [],
    projects: {},
    accounts: []
  };
}
