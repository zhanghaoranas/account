<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ProjectInfo } from '../types';
import ListItem from './common/ListItem.vue';
import InputDialog from './common/InputDialog.vue';
import ConfirmDialog from './common/ConfirmDialog.vue';
import MessageToast from './common/MessageToast.vue';

// 定义 props
const props = defineProps<{
  currentCustomer: string;
  projects: Record<string, string[]>;
  currentProject: string;
  accounts: ProjectInfo[];
}>();

// 定义事件
const emit = defineEmits<{
  'select-project': [project: string];
  'add-project': [project: string];
  'edit-project': [oldName: string, newName: string];
  'delete-project': [project: string];
}>();

// 计算当前客户的项目列表
const currentCustomerProjects = computed(() => {
  return props.projects[props.currentCustomer] || [];
});

// 获取项目的账号数量
const getAccountCount = (project: string) => {
  return props.accounts.filter(
    account => account.customerName === props.currentCustomer && account.projectName === project
  ).length;
};

// 对话框状态
const inputDialogVisible = ref(false);
const inputDialogTitle = ref('');
const inputDialogValue = ref('');
const isEditProject = ref(false);
const currentEditProject = ref('');

// 确认对话框状态
const confirmDialogVisible = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const pendingDeleteProject = ref('');

// 消息提示状态
const messageQueue = ref<Array<{text: string, type: 'success' | 'warning' | 'error'}>>([]);

// 显示消息
function showMessage(text: string, type: 'success' | 'warning' | 'error' = 'success') {
  messageQueue.value.push({ text, type });
}

// 打开新增项目对话框
function openAddDialog() {
  if (!props.currentCustomer) {
    showMessage('请先选择一个客户', 'warning');
    return;
  }
  isEditProject.value = false;
  inputDialogTitle.value = '新增项目';
  inputDialogValue.value = '';
  inputDialogVisible.value = true;
}

// 打开编辑项目对话框
function openEditDialog(project: string) {
  isEditProject.value = true;
  currentEditProject.value = project;
  inputDialogTitle.value = '修改项目';
  inputDialogValue.value = project;
  inputDialogVisible.value = true;
}

// 处理输入对话框确认
function handleInputDialogConfirm(value: string) {
  if (isEditProject.value) {
    if (value !== currentEditProject.value) {
      emit('edit-project', currentEditProject.value, value);
      showMessage('项目修改成功');
    }
  } else {
    if (currentCustomerProjects.value.includes(value)) {
      showMessage('项目名称已存在', 'warning');
      return;
    }
    emit('add-project', value);
    showMessage('项目添加成功');
  }
  inputDialogVisible.value = false;
}

// 处理项目删除
function handleDelete(project: string) {
  pendingDeleteProject.value = project;
  confirmDialogTitle.value = '删除确认';
  confirmDialogMessage.value = `确定要删除项目 "${project}" 吗？这将同时删除该项目下的所有账号。`;
  confirmDialogVisible.value = true;
}

// 确认删除
function handleConfirmDelete() {
  emit('delete-project', pendingDeleteProject.value);
  showMessage('项目删除成功');
  confirmDialogVisible.value = false;
  pendingDeleteProject.value = '';
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- 标题栏 -->
    <div class="flex justify-between items-center px-4 py-2.5 border-b border-[#e8e8e8] bg-gray-50 shadow-sm">
      <h3 class="text-sm font-semibold text-gray-800">项目</h3>
      <button
        @click="openAddDialog"
        :disabled="!currentCustomer"
        class="ant-btn ant-btn-primary flex items-center gap-1 text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增
      </button>
    </div>

    <!-- 项目列表 -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <ListItem
        v-for="project in currentCustomerProjects"
        :key="project"
        :title="project"
        :selected="project === currentProject"
        :count="getAccountCount(project)"
        @click="emit('select-project', project)"
        @edit="openEditDialog(project)"
        @delete="handleDelete(project)"
      />

      <!-- 空状态 -->
      <div v-if="currentCustomerProjects.length === 0" class="flex flex-col items-center justify-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p class="text-sm text-gray-400">{{ currentCustomer ? '暂无项目' : '请先选择客户' }}</p>
      </div>
    </div>
  </div>

  <!-- 输入对话框 -->
  <InputDialog
    v-model:visible="inputDialogVisible"
    :title="inputDialogTitle"
    label="项目名称"
    placeholder="请输入项目名称"
    :value="inputDialogValue"
    @confirm="handleInputDialogConfirm"
  />

  <!-- 确认对话框 -->
  <ConfirmDialog
    v-model:visible="confirmDialogVisible"
    :title="confirmDialogTitle"
    :message="confirmDialogMessage"
    @confirm="handleConfirmDelete"
  />

  <!-- 消息提示 -->
  <MessageToast
    v-for="(msg, index) in messageQueue"
    :key="index"
    :text="msg.text"
    :type="msg.type"
    @close="messageQueue.splice(index, 1)"
  />
</template>
