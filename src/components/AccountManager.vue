<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import type { ProjectInfo } from '../types';
import DialogOverlay from './common/DialogOverlay.vue';

// 定义 props
const props = defineProps<{
  currentCustomer: string;
  currentProject: string;
  accounts: ProjectInfo[];
}>();

// 定义事件
const emit = defineEmits<{
  'add-account': [account: ProjectInfo];
  'edit-account': [index: number, account: ProjectInfo];
  'delete-account': [index: number];
}>();

// 计算当前项目的账号列表
const currentProjectAccounts = computed(() => {
  return props.accounts.filter(account =>
    account.customerName === props.currentCustomer &&
    account.projectName === props.currentProject
  );
});

// 对话框状态
const accountDialogVisible = ref(false);

// 表单数据
const accountForm = ref<Partial<ProjectInfo>>({
  projectUrl: '',
  account: '',
  password: '',
  remark: '',
  tenant: ''
});

// 是否为编辑模式
const isEditAccount = ref(false);

// 当前编辑的账号索引
const currentEditAccountIndex = ref(-1);

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

// 打开新增账号对话框
function openAddDialog() {
  resetForm();
  accountDialogVisible.value = true;
}

// 打开编辑账号对话框
function openEditDialog(index: number) {
  isEditAccount.value = true;
  currentEditAccountIndex.value = index;
  const account = props.accounts[index];
  accountForm.value = { ...account };
  accountDialogVisible.value = true;
}

// 处理账号保存
function handleSave() {
  if (!props.currentCustomer || !props.currentProject) {
    showMessage('请先选择客户和项目', 'warning');
    return;
  }

  // 验证必填字段
  if (!accountForm.value.projectUrl?.trim() ||
      !accountForm.value.account?.trim() ||
      !accountForm.value.password?.trim()) {
    showMessage('请填写完整的账号信息', 'warning');
    return;
  }

  const newAccount: ProjectInfo = {
    customerName: props.currentCustomer,
    projectName: props.currentProject,
    projectUrl: accountForm.value.projectUrl,
    tenant: accountForm.value.tenant,
    account: accountForm.value.account,
    password: accountForm.value.password,
    remark: accountForm.value.remark
  };

  if (isEditAccount.value) {
    emit('edit-account', currentEditAccountIndex.value, newAccount);
    showMessage('账号修改成功');
  } else {
    emit('add-account', newAccount);
    showMessage('账号添加成功');
  }

  resetForm();
  accountDialogVisible.value = false;
}

// 处理账号删除
function handleDelete(index: number) {
  confirmDialog.value = {
    show: true,
    title: '删除确认',
    message: '确定要删除该账号吗？',
    onConfirm: () => {
      emit('delete-account', index);
      showMessage('账号删除成功');
      confirmDialog.value.show = false;
    }
  };
}

// 复制到剪贴板
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    showMessage(`${label}已复制到剪贴板`);
  }).catch(() => {
    showMessage('复制失败', 'error');
  });
}

// 重置表单
function resetForm() {
  accountForm.value = {
    projectUrl: '',
    account: '',
    password: '',
    remark: '',
    tenant: ''
  };
  isEditAccount.value = false;
  currentEditAccountIndex.value = -1;
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 标题栏 -->
    <div class="flex justify-between items-center px-6 py-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-[rgba(0,0,0,0.4)] font-sf">账号信息</h3>
      <button
        @click="openAddDialog"
        :disabled="!currentCustomer || !currentProject"
        class="apple-btn text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        添加账号
      </button>
    </div>

    <!-- 账号列表 -->
    <div class="flex-1 overflow-y-auto px-6 pb-6">
      <div v-if="currentProjectAccounts.length > 0" class="space-y-3">
        <div
          v-for="(account, index) in currentProjectAccounts"
          :key="index"
          class="bg-white rounded-apple p-5 transition-all duration-200 hover:shadow-apple-card"
        >
          <!-- URL 行 -->
          <div class="flex items-start justify-between mb-4">
            <div
              @click="copyToClipboard(account.projectUrl, '项目地址')"
              class="flex items-center gap-2 cursor-pointer group/url"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[rgba(0,0,0,0.3)] group-hover/url:text-apple-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span class="text-sm text-apple-link group-hover/url:text-apple-bright-blue font-sf transition-colors truncate max-w-md">{{ account.projectUrl }}</span>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-1 flex-shrink-0">
              <button
                @click="openEditDialog(accounts.indexOf(account))"
                class="p-1.5 text-[rgba(0,0,0,0.3)] hover:text-apple-blue hover:bg-apple-blue/5 rounded-md transition-all duration-200"
                title="编辑"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="handleDelete(accounts.indexOf(account))"
                class="p-1.5 text-[rgba(0,0,0,0.3)] hover:text-apple-danger hover:bg-apple-danger/5 rounded-md transition-all duration-200"
                title="删除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 信息网格 -->
          <div class="grid grid-cols-2 gap-x-6 gap-y-3">
            <!-- 租户 -->
            <div v-if="account.tenant">
              <span class="text-xs text-[rgba(0,0,0,0.4)] font-sf block mb-1">租户</span>
              <span class="text-sm text-apple-near-black font-sf">{{ account.tenant }}</span>
            </div>

            <!-- 账号 -->
            <div>
              <span class="text-xs text-[rgba(0,0,0,0.4)] font-sf block mb-1">账号</span>
              <div
                @click="copyToClipboard(account.account, '账号')"
                class="flex items-center gap-1.5 cursor-pointer group/account"
              >
                <span class="text-sm text-apple-near-black font-sf font-mono">{{ account.account }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[rgba(0,0,0,0.2)] group-hover/account:text-apple-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- 密码 -->
            <div>
              <span class="text-xs text-[rgba(0,0,0,0.4)] font-sf block mb-1">密码</span>
              <div
                @click="copyToClipboard(account.password, '密码')"
                class="flex items-center gap-1.5 cursor-pointer group/password"
              >
                <span class="text-sm text-apple-near-black font-sf font-mono">{{ account.password }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[rgba(0,0,0,0.2)] group-hover/password:text-apple-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- 备注 -->
          <div v-if="account.remark" class="mt-3 pt-3 border-t border-black/[0.06]">
            <span class="text-xs text-[rgba(0,0,0,0.4)] font-sf block mb-1">备注</span>
            <span class="text-sm text-[rgba(0,0,0,0.8)] font-sf">{{ account.remark }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center h-full py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4 text-black/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="text-sm text-[rgba(0,0,0,0.4)] font-sf mb-1">{{ currentCustomer && currentProject ? '暂无账号信息' : '请先选择客户和项目' }}</p>
        <p v-if="currentCustomer && currentProject" class="text-xs text-[rgba(0,0,0,0.25)] font-sf">点击右上角"添加账号"按钮开始添加</p>
      </div>
    </div>
  </div>

  <!-- 添加/编辑对话框 -->
  <DialogOverlay :visible="accountDialogVisible" @close="accountDialogVisible = false">
    <div class="bg-white rounded-apple-lg shadow-apple-card w-full max-w-lg">
      <!-- 标题 -->
      <div class="px-6 py-5">
        <h3 class="text-base font-semibold text-apple-near-black font-sf-display tracking-tight">
          {{ isEditAccount ? '修改账号' : '新增账号' }}
        </h3>
      </div>

      <!-- 内容 -->
      <div class="px-6 pb-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-apple-near-black/70 mb-2 font-sf">
            项目地址 <span class="text-apple-danger">*</span>
          </label>
          <input
            v-model="accountForm.projectUrl"
            type="text"
            placeholder="https://example.com"
            class="apple-input"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-apple-near-black/70 mb-2 font-sf">
            租户
          </label>
          <input
            v-model="accountForm.tenant"
            type="text"
            placeholder="可选"
            class="apple-input"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-apple-near-black/70 mb-2 font-sf">
            项目账号 <span class="text-apple-danger">*</span>
          </label>
          <input
            v-model="accountForm.account"
            type="text"
            placeholder="请输入项目账号"
            class="apple-input"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-apple-near-black/70 mb-2 font-sf">
            项目密码 <span class="text-apple-danger">*</span>
          </label>
          <input
            v-model="accountForm.password"
            type="text"
            placeholder="请输入项目密码"
            class="apple-input"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-apple-near-black/70 mb-2 font-sf">
            备注
          </label>
          <textarea
            v-model="accountForm.remark"
            placeholder="可选的备注信息"
            rows="3"
            class="apple-input resize-none"
          ></textarea>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 bg-apple-light-gray/60 rounded-b-apple-lg flex justify-end gap-2">
        <button
          @click="accountDialogVisible = false"
          class="apple-btn-default"
        >
          取消
        </button>
        <button
          @click="handleSave"
          class="apple-btn"
        >
          确定
        </button>
      </div>
    </div>
  </DialogOverlay>

  <!-- 确认对话框 -->
  <DialogOverlay :visible="confirmDialog.show" @close="confirmDialog.show = false">
    <div class="bg-white rounded-apple-lg shadow-apple-card w-full max-w-md">
      <div class="px-6 py-5">
        <h3 class="text-base font-semibold text-apple-near-black font-sf-display tracking-tight">{{ confirmDialog.title }}</h3>
      </div>
      <div class="px-6 pb-5">
        <p class="text-sm text-[rgba(0,0,0,0.8)] font-sf leading-relaxed">{{ confirmDialog.message }}</p>
      </div>
      <div class="px-6 py-4 bg-apple-light-gray/60 rounded-b-apple-lg flex justify-end gap-2">
        <button
          @click="confirmDialog.show = false"
          class="apple-btn-default"
        >
          取消
        </button>
        <button
          @click="confirmDialog.onConfirm"
          class="apple-btn-danger"
        >
          删除
        </button>
      </div>
    </div>
  </DialogOverlay>

  <!-- 消息提示 -->
  <Transition name="apple-slide-up">
    <div
      v-if="message.show"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] px-5 py-2.5 rounded-apple text-sm font-medium font-sf backdrop-blur-xl shadow-apple-card bg-white/90"
      :class="message.type === 'error' ? 'text-apple-danger' : 'text-apple-near-black'"
    >
      <span v-if="message.type === 'success'" class="inline-block mr-1.5 text-green-500">&#10003;</span>
      <span v-if="message.type === 'warning'" class="inline-block mr-1.5 text-amber-500">&#9888;</span>
      <span v-if="message.type === 'error'" class="inline-block mr-1.5 text-apple-danger">&#10007;</span>
      {{ message.text }}
    </div>
  </Transition>
</template>
