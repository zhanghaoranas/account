<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import CustomerManager from './components/CustomerManager.vue';
import ProjectManager from './components/ProjectManager.vue';
import AccountManager from './components/AccountManager.vue';
import DialogOverlay from './components/common/DialogOverlay.vue';
import type { ProjectInfo } from './types';
import { loadData, saveData, type StorageData } from './utils/storage';

// 窗口拖拽
async function handleTitleBarMouseDown(e: MouseEvent) {
  if (e.button !== 0) return;
  const target = e.target as HTMLElement;
  if (target.closest('button, a, input, [no-drag]')) return;
  try {
    await getCurrentWindow().startDragging();
  } catch {
    // 非 Tauri 环境
  }
}

// 状态管理
const customers = ref<string[]>([]);
const projects = ref<Record<string, string[]>>({});
const accounts = ref<ProjectInfo[]>([]);

const currentCustomer = ref<string>('');
const currentProject = ref<string>('');

// 自动保存 - 监听数据变化并自动保存
watch(
  [customers, projects, accounts],
  () => {
    saveData({
      customers: customers.value,
      projects: projects.value,
      accounts: accounts.value
    });
  },
  { deep: true }
);

// 客户相关事件处理
function handleSelectCustomer(customer: string) {
  currentCustomer.value = customer;
  const customerProjects = projects.value[customer] || [];
  currentProject.value = customerProjects.length > 0 ? customerProjects[0] : '';
}

function handleAddCustomer(customer: string) {
  customers.value.push(customer);
  projects.value[customer] = [];
  currentCustomer.value = customer;
  currentProject.value = '';
}

function handleEditCustomer(oldName: string, newName: string) {
  // 更新客户名称
  const index = customers.value.indexOf(oldName);
  if (index !== -1) {
    customers.value[index] = newName;
  }

  // 更新项目中的客户名称
  const oldProjects = projects.value[oldName] || [];
  delete projects.value[oldName];
  projects.value[newName] = oldProjects;

  // 更新账号中的客户名称
  accounts.value.forEach(account => {
    if (account.customerName === oldName) {
      account.customerName = newName;
    }
  });

  // 更新当前客户
  if (currentCustomer.value === oldName) {
    currentCustomer.value = newName;
  }
}

function handleDeleteCustomer(customer: string) {
  // 删除客户
  const index = customers.value.indexOf(customer);
  if (index !== -1) {
    customers.value.splice(index, 1);
  }

  // 删除项目
  delete projects.value[customer];

  // 删除账号
  accounts.value = accounts.value.filter(account => account.customerName !== customer);

  // 更新当前客户
  if (currentCustomer.value === customer) {
    currentCustomer.value = customers.value[0] || '';
    currentProject.value = '';
  }
}

// 项目相关事件处理
function handleSelectProject(project: string) {
  currentProject.value = project;
}

function handleAddProject(project: string) {
  if (!projects.value[currentCustomer.value]) {
    projects.value[currentCustomer.value] = [];
  }
  projects.value[currentCustomer.value].push(project);
  currentProject.value = project;
}

function handleEditProject(oldName: string, newName: string) {
  // 更新项目名称
  const customerProjects = projects.value[currentCustomer.value] || [];
  const index = customerProjects.indexOf(oldName);
  if (index !== -1) {
    customerProjects[index] = newName;
    projects.value[currentCustomer.value] = customerProjects;
  }

  // 更新账号中的项目名称
  accounts.value.forEach(account => {
    if (account.customerName === currentCustomer.value && account.projectName === oldName) {
      account.projectName = newName;
    }
  });

  // 更新当前项目
  if (currentProject.value === oldName) {
    currentProject.value = newName;
  }
}

function handleDeleteProject(project: string) {
  // 删除项目
  const customerProjects = projects.value[currentCustomer.value] || [];
  const index = customerProjects.indexOf(project);
  if (index !== -1) {
    customerProjects.splice(index, 1);
    projects.value[currentCustomer.value] = customerProjects;
  }

  // 删除账号
  accounts.value = accounts.value.filter(account =>
    !(account.customerName === currentCustomer.value && account.projectName === project)
  );

  // 更新当前项目
  if (currentProject.value === project) {
    currentProject.value = '';
  }
}

// 账号相关事件处理
function handleAddAccount(account: ProjectInfo) {
  accounts.value.push(account);
}

function handleEditAccount(index: number, account: ProjectInfo) {
  accounts.value[index] = account;
}

function handleDeleteAccount(index: number) {
  accounts.value.splice(index, 1);
}

// 导入/导出
const importMode = ref<'replace' | 'merge' | ''>('');
const pendingImportData = ref<StorageData | null>(null);

async function handleExport() {
  const data: StorageData = {
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  };
  const json = JSON.stringify(data, null, 2);
  try {
    const filePath = await save({
      defaultPath: `account-data-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (filePath) {
      await writeTextFile(filePath, json);
    }
  } catch {
    // 用户取消或非 Tauri 环境
  }
}

function triggerImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as StorageData;
        if (!data.customers || !data.projects || !data.accounts) {
          alert('无效的数据文件');
          return;
        }
        pendingImportData.value = data;
        // 有数据时让用户选择模式
        if (customers.value.length > 0) {
          importMode.value = '';
        } else {
          // 无数据直接替换
          applyImport('replace');
        }
      } catch {
        alert('文件解析失败，请确认是有效的 JSON 文件');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function applyImport(mode: 'replace' | 'merge') {
  const imported = pendingImportData.value;
  if (!imported) return;

  if (mode === 'replace') {
    customers.value = imported.customers;
    projects.value = imported.projects;
    accounts.value = imported.accounts;
  } else {
    // 合并：追加不存在的客户、项目，跳过重复账号
    imported.customers.forEach(c => {
      if (!customers.value.includes(c)) {
        customers.value.push(c);
      }
    });
    for (const [customer, projectList] of Object.entries(imported.projects)) {
      if (!projects.value[customer]) {
        projects.value[customer] = [...projectList];
      } else {
        projectList.forEach(p => {
          if (!projects.value[customer].includes(p)) {
            projects.value[customer].push(p);
          }
        });
      }
    }
    imported.accounts.forEach(acc => {
      const exists = accounts.value.some(
        a => a.customerName === acc.customerName &&
             a.projectName === acc.projectName &&
             a.account === acc.account &&
             a.projectUrl === acc.projectUrl
      );
      if (!exists) {
        accounts.value.push(acc);
      }
    });
  }

  currentCustomer.value = customers.value[0] || '';
  const firstProjects = projects.value[currentCustomer.value] || [];
  currentProject.value = firstProjects[0] || '';
  pendingImportData.value = null;
  importMode.value = '';
}

// 初始化数据
onMounted(() => {
  const data = loadData();
  customers.value = data.customers;
  projects.value = data.projects;
  accounts.value = data.accounts;

  if (customers.value.length > 0) {
    currentCustomer.value = customers.value[0];
  }
});
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-apple-light-gray">
    <!-- 自定义标题栏 -->
    <div
      data-tauri-drag-region
      class="flex-shrink-0 h-[38px] bg-apple-near-black flex items-center justify-between px-4 select-none"
      @mousedown="handleTitleBarMouseDown"
    >
      <div class="w-20"></div>
      <span data-tauri-drag-region class="text-white/40 text-xs font-sf tracking-wide">开发账号管理</span>
      <div class="flex items-center gap-1 no-drag">
        <button
          @click="triggerImport"
          class="p-1.5 text-white/30 hover:text-white/70 transition-colors rounded-md hover:bg-white/10"
          title="导入"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
        <button
          @click="handleExport"
          class="p-1.5 text-white/30 hover:text-white/70 transition-colors rounded-md hover:bg-white/10"
          title="导出"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 三栏内容 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧客户区域 -->
      <div class="w-72 flex-shrink-0 flex flex-col overflow-hidden bg-apple-near-black">
        <CustomerManager
          :customers="customers"
          :current-customer="currentCustomer"
          :projects="projects"
          @select-customer="handleSelectCustomer"
          @add-customer="handleAddCustomer"
          @edit-customer="handleEditCustomer"
          @delete-customer="handleDeleteCustomer"
        />
      </div>

      <!-- 中间项目区域 -->
      <div class="w-72 flex-shrink-0 flex flex-col overflow-hidden bg-white">
        <ProjectManager
          :current-customer="currentCustomer"
          :projects="projects"
          :current-project="currentProject"
          :accounts="accounts"
          @select-project="handleSelectProject"
          @add-project="handleAddProject"
          @edit-project="handleEditProject"
          @delete-project="handleDeleteProject"
        />
      </div>

      <!-- 右侧账号区域 -->
      <div class="flex-1 flex flex-col overflow-hidden bg-apple-light-gray">
        <AccountManager
          :current-customer="currentCustomer"
          :current-project="currentProject"
          :accounts="accounts"
          @add-account="handleAddAccount"
          @edit-account="handleEditAccount"
          @delete-account="handleDeleteAccount"
        />
      </div>
    </div>

    <!-- 导入模式选择对话框 -->
    <DialogOverlay :visible="!!pendingImportData && !importMode" @close="pendingImportData = null">
      <div class="bg-white rounded-apple-lg shadow-apple-card w-full max-w-sm">
        <div class="px-6 py-5">
          <h3 class="text-base font-semibold text-apple-near-black font-sf-display tracking-tight">导入数据</h3>
          <p class="text-sm text-[rgba(0,0,0,0.6)] font-sf mt-2">检测到当前已有数据，请选择导入方式：</p>
        </div>
        <div class="px-6 pb-4 space-y-2">
          <button
            @click="applyImport('replace')"
            class="w-full text-left px-4 py-3 rounded-apple bg-apple-light-gray hover:bg-[#ebebed] transition-colors"
          >
            <div class="text-sm font-medium text-apple-near-black font-sf">替换全部</div>
            <div class="text-xs text-[rgba(0,0,0,0.5)] font-sf mt-0.5">清除当前数据，使用导入的数据</div>
          </button>
          <button
            @click="applyImport('merge')"
            class="w-full text-left px-4 py-3 rounded-apple bg-apple-light-gray hover:bg-[#ebebed] transition-colors"
          >
            <div class="text-sm font-medium text-apple-near-black font-sf">合并数据</div>
            <div class="text-xs text-[rgba(0,0,0,0.5)] font-sf mt-0.5">保留当前数据，追加不重复的项</div>
          </button>
        </div>
        <div class="px-6 py-4 bg-apple-light-gray/60 rounded-b-apple-lg flex justify-end">
          <button
            @click="pendingImportData = null"
            class="apple-btn-default text-xs"
          >
            取消
          </button>
        </div>
      </div>
    </DialogOverlay>
  </div>
</template>
