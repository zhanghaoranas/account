<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import type { ProjectInfo } from '../types';

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
const projectDialogVisible = ref(false);

// 表单数据
const projectForm = ref({ name: '' });

// 是否为编辑模式
const isEditProject = ref(false);

// 当前编辑的项目
const currentEditProject = ref('');

// 消息提示
const message = ref({
  show: false,
  text: '',
  type: 'success'
});

// 确认对话框
const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: () => {}
});

// 显示消息
function showMessage(text: string, type: 'success' | 'warning' | 'error' = 'success') {
  message.value = { show: true, text, type };
  setTimeout(() => {
    message.value.show = false;
  }, 3000);
}

// 打开新增项目对话框
function openAddDialog() {
  resetForm();
  projectDialogVisible.value = true;
}

// 打开编辑项目对话框
function openEditDialog(project: string) {
  isEditProject.value = true;
  currentEditProject.value = project;
  projectForm.value.name = project;
  projectDialogVisible.value = true;
}

// 处理项目保存
function handleSave() {
  if (!props.currentCustomer) {
    showMessage('请先选择一个客户', 'warning');
    return;
  }

  if (!projectForm.value.name.trim()) {
    showMessage('请输入项目名称', 'warning');
    return;
  }

  if (isEditProject.value) {
    if (projectForm.value.name !== currentEditProject.value) {
      emit('edit-project', currentEditProject.value, projectForm.value.name);
    }
    showMessage('项目修改成功');
  } else {
    if (currentCustomerProjects.value.includes(projectForm.value.name)) {
      showMessage('项目名称已存在', 'warning');
      return;
    }
    emit('add-project', projectForm.value.name);
    showMessage('项目添加成功');
  }

  resetForm();
  projectDialogVisible.value = false;
}

// 处理项目删除
function handleDelete(project: string) {
  confirmDialog.value = {
    show: true,
    title: '删除确认',
    message: `确定要删除项目 "${project}" 吗？这将同时删除该项目下的所有账号。`,
    onConfirm: () => {
      emit('delete-project', project);
      showMessage('项目删除成功');
      confirmDialog.value.show = false;
    }
  };
}

// 重置表单
function resetForm() {
  projectForm.value.name = '';
  isEditProject.value = false;
  currentEditProject.value = '';
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
      <div
        v-for="project in currentCustomerProjects"
        :key="project"
        @click="emit('select-project', project)"
        class="group ant-card-hoverable py-2.5 px-3 cursor-pointer relative border rounded-lg transition-all duration-200"
        :class="project === currentProject ? 'bg-[#e6f4ff] border-[#4096ff] shadow-sm' : 'bg-white border-[#e8e8e8] hover:border-[#4096ff] hover:shadow-md'"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium pl-2" :class="project === currentProject ? 'text-[#4096ff]' : 'text-gray-800'">
            {{ project }}
          </span>

          <!-- 账号数量徽章 -->
          <div class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
               :class="project === currentProject ? 'bg-[#4096ff] text-white' : 'bg-[#f0f0f0] text-gray-600'">
            {{ getAccountCount(project) }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity mr-8">
          <button
            @click.stop="openEditDialog(project)"
            class="p-1.5 text-gray-500 hover:text-[#4096ff] hover:bg-[#e6f4ff] rounded-md transition-all duration-200"
            title="编辑"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            @click.stop="handleDelete(project)"
            class="p-1.5 text-gray-500 hover:text-[#f5222d] hover:bg-[#fff1f0] rounded-md transition-all duration-200"
            title="删除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="currentCustomerProjects.length === 0" class="flex flex-col items-center justify-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p class="text-sm text-gray-400">{{ currentCustomer ? '暂无项目' : '请先选择客户' }}</p>
      </div>
    </div>
  </div>

  <!-- 对话框 -->
  <Transition name="ant-zoom">
    <div
      v-if="projectDialogVisible"
      class="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <!-- 标题 -->
        <div class="px-6 py-4 border-b border-[#e8e8e8]">
          <h3 class="text-base font-semibold text-gray-800">
            {{ isEditProject ? '修改项目' : '新增项目' }}
          </h3>
        </div>

        <!-- 内容 -->
        <div class="px-6 py-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            项目名称
          </label>
          <input
            v-model="projectForm.name"
            type="text"
            placeholder="请输入项目名称"
            class="ant-input"
            @keyup.enter="handleSave"
          />
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button
            @click="projectDialogVisible = false"
            class="ant-btn ant-btn-default"
          >
            取消
          </button>
          <button
            @click="handleSave"
            class="ant-btn ant-btn-primary"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 确认对话框 -->
  <Transition name="ant-zoom">
    <div
      v-if="confirmDialog.show"
      class="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-[#e8e8e8]">
          <h3 class="text-base font-semibold text-gray-800">{{ confirmDialog.title }}</h3>
        </div>
        <div class="px-6 py-4">
          <p class="text-sm text-gray-600">{{ confirmDialog.message }}</p>
        </div>
        <div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button
            @click="confirmDialog.show = false"
            class="ant-btn ant-btn-default"
          >
            取消
          </button>
          <button
            @click="confirmDialog.onConfirm"
            class="ant-btn ant-btn-danger"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 消息提示 -->
  <Transition name="ant-slide-up">
    <div
      v-if="message.show"
      class="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-sm font-medium"
      :class="{
        'bg-[#f6ffed] border border-[#b7eb8f] text-[#52c41a]': message.type === 'success',
        'bg-[#fffbe6] border border-[#ffe58f] text-[#faad14]': message.type === 'warning',
        'bg-[#fff2f0] border border-[#ffccc7] text-[#f5222d]': message.type === 'error'
      }"
    >
      {{ message.text }}
    </div>
  </Transition>
</template>
