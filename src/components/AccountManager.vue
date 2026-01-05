<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import type { ProjectInfo } from '../types';

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
  <div class="flex flex-col h-full bg-white">
    <!-- 标题栏 -->
    <div class="flex justify-between items-center px-5 py-2.5 border-b border-[#e8e8e8] bg-gray-50 shadow-sm">
      <h3 class="text-sm font-semibold text-gray-800">账号信息</h3>
      <button
        @click="openAddDialog"
        :disabled="!currentCustomer || !currentProject"
        class="ant-btn ant-btn-primary flex items-center gap-1 text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        添加账号
      </button>
    </div>

    <!-- 账号表格 -->
    <div class="flex-1 overflow-y-auto p-5">
      <div v-if="currentProjectAccounts.length > 0" class="bg-white rounded-lg border border-[#e8e8e8] overflow-hidden shadow-sm">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-[#e8e8e8]">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">项目地址</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">租户</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">项目账号</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">项目密码</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">备注</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#e8e8e8]">
            <tr
              v-for="(account, index) in currentProjectAccounts"
              :key="index"
              class="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200"
            >
              <td class="px-4 py-3">
                <div
                  @click="copyToClipboard(account.projectUrl, '项目地址')"
                  class="inline-flex items-center gap-2 text-sm text-gray-800 cursor-pointer hover:text-[#4096ff] transition-all duration-200 group/btn"
                >
                  <span class="truncate max-w-xs group-hover/btn:font-medium">{{ account.projectUrl }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover/btn:text-[#4096ff] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ account.tenant || '-' }}</td>
              <td class="px-4 py-3">
                <div
                  @click="copyToClipboard(account.account, '项目账号')"
                  class="inline-flex items-center gap-2 text-sm text-gray-800 cursor-pointer hover:text-[#4096ff] transition-all duration-200 group/btn"
                >
                  <span class="font-mono group-hover/btn:font-medium">{{ account.account }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover/btn:text-[#4096ff] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </td>
              <td class="px-4 py-3">
                <div
                  @click="copyToClipboard(account.password, '项目密码')"
                  class="inline-flex items-center gap-2 text-sm text-gray-800 cursor-pointer hover:text-[#4096ff] transition-all duration-200 group/btn"
                >
                  <span class="font-mono group-hover/btn:font-medium">{{ account.password }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover/btn:text-[#4096ff] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ account.remark || '-' }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-3">
                  <button
                    @click="openEditDialog(accounts.indexOf(account))"
                    class="text-sm text-[#4096ff] hover:text-[#69b1ff] transition-all duration-200 hover:underline"
                  >
                    编辑
                  </button>
                  <button
                    @click="handleDelete(accounts.indexOf(account))"
                    class="text-sm text-[#f5222d] hover:text-[#ff4d4f] transition-all duration-200 hover:underline"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center h-full py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="text-gray-500 text-sm mb-1">{{ currentCustomer && currentProject ? '暂无账号信息' : '请先选择客户和项目' }}</p>
        <p v-if="currentCustomer && currentProject" class="text-gray-400 text-xs">点击右上角"添加账号"按钮开始添加</p>
      </div>
    </div>
  </div>

  <!-- 对话框 -->
  <Transition name="ant-zoom">
    <div
      v-if="accountDialogVisible"
      class="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <!-- 标题 -->
        <div class="px-6 py-4 border-b border-[#e8e8e8]">
          <h3 class="text-base font-semibold text-gray-800">
            {{ isEditAccount ? '修改账号' : '新增账号' }}
          </h3>
        </div>

        <!-- 内容 -->
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              项目地址 <span class="text-[#f5222d]">*</span>
            </label>
            <input
              v-model="accountForm.projectUrl"
              type="text"
              placeholder="https://example.com"
              class="ant-input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              租户
            </label>
            <input
              v-model="accountForm.tenant"
              type="text"
              placeholder="可选"
              class="ant-input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              项目账号 <span class="text-[#f5222d]">*</span>
            </label>
            <input
              v-model="accountForm.account"
              type="text"
              placeholder="请输入项目账号"
              class="ant-input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              项目密码 <span class="text-[#f5222d]">*</span>
            </label>
            <input
              v-model="accountForm.password"
              type="password"
              placeholder="请输入项目密码"
              class="ant-input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              v-model="accountForm.remark"
              placeholder="可选的备注信息"
              rows="3"
              class="ant-input resize-none"
            ></textarea>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button
            @click="accountDialogVisible = false"
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
