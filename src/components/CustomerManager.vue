<script setup lang="ts">
import { ref } from 'vue';
import ListItem from './common/ListItem.vue';
import InputDialog from './common/InputDialog.vue';
import ConfirmDialog from './common/ConfirmDialog.vue';
import MessageToast from './common/MessageToast.vue';

// 定义 props
const props = defineProps<{
  customers: string[];
  currentCustomer: string;
  projects: Record<string, string[]>;
}>();

// 获取客户的项目数量
const getProjectCount = (customer: string) => {
  return props.projects[customer]?.length || 0;
};

// 定义事件
const emit = defineEmits<{
  'select-customer': [customer: string];
  'add-customer': [customer: string];
  'edit-customer': [oldName: string, newName: string];
  'delete-customer': [customer: string];
}>();

// 对话框状态
const inputDialogVisible = ref(false);
const inputDialogTitle = ref('');
const inputDialogValue = ref('');
const isEditCustomer = ref(false);
const currentEditCustomer = ref('');

// 确认对话框状态
const confirmDialogVisible = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const pendingDeleteCustomer = ref('');

// 消息提示状态
const messageQueue = ref<Array<{text: string, type: 'success' | 'warning' | 'error'}>>([]);

// 显示消息
function showMessage(text: string, type: 'success' | 'warning' | 'error' = 'success') {
  messageQueue.value.push({ text, type });
}

// 打开新增客户对话框
function openAddDialog() {
  isEditCustomer.value = false;
  inputDialogTitle.value = '新增客户';
  inputDialogValue.value = '';
  inputDialogVisible.value = true;
}

// 打开编辑客户对话框
function openEditDialog(customer: string) {
  isEditCustomer.value = true;
  currentEditCustomer.value = customer;
  inputDialogTitle.value = '修改客户';
  inputDialogValue.value = customer;
  inputDialogVisible.value = true;
}

// 处理输入对话框确认
function handleInputDialogConfirm(value: string) {
  if (isEditCustomer.value) {
    if (value !== currentEditCustomer.value) {
      emit('edit-customer', currentEditCustomer.value, value);
      showMessage('客户修改成功');
    }
  } else {
    if (props.customers.includes(value)) {
      showMessage('客户名称已存在', 'warning');
      return;
    }
    emit('add-customer', value);
    showMessage('客户添加成功');
  }
  inputDialogVisible.value = false;
}

// 处理客户删除
function handleDelete(customer: string) {
  pendingDeleteCustomer.value = customer;
  confirmDialogTitle.value = '删除确认';
  confirmDialogMessage.value = `确定要删除客户 "${customer}" 吗？这将同时删除该客户下的所有项目和账号。`;
  confirmDialogVisible.value = true;
}

// 确认删除
function handleConfirmDelete() {
  emit('delete-customer', pendingDeleteCustomer.value);
  showMessage('客户删除成功');
  confirmDialogVisible.value = false;
  pendingDeleteCustomer.value = '';
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- 标题栏 -->
    <div class="flex justify-between items-center px-4 py-2.5 border-b border-[#e8e8e8] bg-gray-50 shadow-sm">
      <h3 class="text-sm font-semibold text-gray-800">客户</h3>
      <button
        @click="openAddDialog"
        class="ant-btn ant-btn-primary flex items-center gap-1 text-sm px-3 py-1.5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增
      </button>
    </div>

    <!-- 客户列表 -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <ListItem
        v-for="customer in customers"
        :key="customer"
        :title="customer"
        :selected="customer === currentCustomer"
        :count="getProjectCount(customer)"
        @click="emit('select-customer', customer)"
        @edit="openEditDialog(customer)"
        @delete="handleDelete(customer)"
      />

      <!-- 空状态 -->
      <div v-if="customers.length === 0" class="flex flex-col items-center justify-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="text-sm text-gray-400">暂无客户</p>
      </div>
    </div>
  </div>

  <!-- 输入对话框 -->
  <InputDialog
    v-model:visible="inputDialogVisible"
    :title="inputDialogTitle"
    label="客户名称"
    placeholder="请输入客户名称"
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
