<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CustomerManager from './components/CustomerManager.vue';
import ProjectManager from './components/ProjectManager.vue';
import AccountManager from './components/AccountManager.vue';
import type { ProjectInfo } from './types';
import { loadData, saveData } from './utils/storage';

// 状态管理
const customers = ref<string[]>([]);
const projects = ref<Record<string, string[]>>({});
const accounts = ref<ProjectInfo[]>([]);

const currentCustomer = ref<string>('');
const currentProject = ref<string>('');

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
  saveData({
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  });
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
  
  saveData({
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  });
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
  
  saveData({
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  });
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
  saveData({
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  });
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
  
  saveData({
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  });
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
  
  saveData({
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  });
}

// 账号相关事件处理
function handleAddAccount(account: ProjectInfo) {
  accounts.value.push(account);
  saveData({
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  });
}

function handleEditAccount(index: number, account: ProjectInfo) {
  accounts.value[index] = account;
  saveData({
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  });
}

function handleDeleteAccount(index: number) {
  accounts.value.splice(index, 1);
  saveData({
    customers: customers.value,
    projects: projects.value,
    accounts: accounts.value
  });
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
  <div class="flex h-screen overflow-hidden bg-[#f5f5f5]">
    <!-- 左侧客户区域 -->
    <div class="w-72 flex-shrink-0 flex flex-col overflow-hidden border-r border-[#e8e8e8]">
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
    <div class="w-72 flex-shrink-0 flex flex-col overflow-hidden border-r border-[#e8e8e8]">
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
    <div class="flex-1 flex flex-col overflow-hidden">
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
</template>