<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ProjectInfo } from '../types';
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

// 缓存账号数量 - 使用 Map 避免每次都过滤
const accountCountMap = computed(() => {
  const map = new Map<string, number>();
  props.accounts.forEach(account => {
    if (account.customerName === props.currentCustomer) {
      const key = account.projectName;
      map.set(key, (map.get(key) || 0) + 1);
    }
  });
  return map;
});

// 获取项目的账号数量 - 从 Map 中读取，性能 O(1)
const getAccountCount = (project: string) => {
  return accountCountMap.value.get(project) || 0;
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
  <div class="flex flex-col h-full">
    <!-- 标题栏 -->
    <div class="flex justify-between items-center px-5 py-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-[rgba(0,0,0,0.4)] font-sf">项目</h3>
      <button
        @click="openAddDialog"
        :disabled="!currentCustomer"
        class="apple-btn text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增
      </button>
    </div>

    <!-- 项目列表 -->
    <div class="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
      <div
        v-for="project in currentCustomerProjects"
        :key="project"
        @click="emit('select-project', project)"
        class="group relative py-2.5 px-3 cursor-pointer transition-all duration-200"
        :class="project === currentProject ? 'bg-[rgba(0,113,227,0.08)]' : 'hover:bg-black/[0.03]'"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-sm font-normal pl-2 font-sf transition-colors duration-200"
            :class="project === currentProject ? 'text-apple-blue font-medium' : 'text-apple-near-black'"
          >
            {{ project }}
          </span>

          <!-- 数量徽章 -->
          <div
            class="min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            :class="project === currentProject ? 'bg-apple-blue text-white' : 'bg-black/[0.06] text-[rgba(0,0,0,0.5)]'"
          >
            {{ getAccountCount(project) }}
          </div>
        </div>

        <!-- 选中指示条 -->
        <div
          v-if="project === currentProject"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-apple-blue rounded-r"
        />

        <!-- 操作按钮 -->
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-8">
          <button
            @click.stop="openEditDialog(project)"
            class="p-1.5 text-[rgba(0,0,0,0.3)] hover:text-apple-blue hover:bg-apple-blue/5 rounded-md transition-all duration-200"
            title="编辑"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            @click.stop="handleDelete(project)"
            class="p-1.5 text-[rgba(0,0,0,0.3)] hover:text-apple-danger hover:bg-apple-danger/5 rounded-md transition-all duration-200"
            title="删除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="currentCustomerProjects.length === 0" class="flex flex-col items-center justify-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-3 text-black/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p class="text-xs text-[rgba(0,0,0,0.3)] font-sf">{{ currentCustomer ? '暂无项目' : '请先选择客户' }}</p>
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
