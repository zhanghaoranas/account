<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

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
const customerDialogVisible = ref(false);

// 表单数据
const customerForm = ref({ name: '' });

// 是否为编辑模式
const isEditCustomer = ref(false);

// 当前编辑的客户
const currentEditCustomer = ref('');

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

// 打开新增客户对话框
function openAddDialog() {
  resetForm();
  customerDialogVisible.value = true;
}

// 打开编辑客户对话框
function openEditDialog(customer: string) {
  isEditCustomer.value = true;
  currentEditCustomer.value = customer;
  customerForm.value.name = customer;
  customerDialogVisible.value = true;
}

// 处理客户保存
function handleSave() {
  if (!customerForm.value.name.trim()) {
    showMessage('请输入客户名称', 'warning');
    return;
  }

  if (isEditCustomer.value) {
    if (customerForm.value.name !== currentEditCustomer.value) {
      emit('edit-customer', currentEditCustomer.value, customerForm.value.name);
    }
    showMessage('客户修改成功');
  } else {
    if (props.customers.includes(customerForm.value.name)) {
      showMessage('客户名称已存在', 'warning');
      return;
    }
    emit('add-customer', customerForm.value.name);
    showMessage('客户添加成功');
  }

  resetForm();
  customerDialogVisible.value = false;
}

// 处理客户删除
function handleDelete(customer: string) {
  confirmDialog.value = {
    show: true,
    title: '删除确认',
    message: `确定要删除客户 "${customer}" 吗？这将同时删除该客户下的所有项目和账号。`,
    onConfirm: () => {
      emit('delete-customer', customer);
      showMessage('客户删除成功');
      confirmDialog.value.show = false;
    }
  };
}

// 重置表单
function resetForm() {
  customerForm.value.name = '';
  isEditCustomer.value = false;
  currentEditCustomer.value = '';
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
      <div
        v-for="customer in customers"
        :key="customer"
        @click="emit('select-customer', customer)"
        class="group ant-card-hoverable py-2.5 px-3 cursor-pointer relative border rounded-lg transition-all duration-200"
        :class="customer === currentCustomer ? 'bg-[#e6f4ff] border-[#4096ff] shadow-sm' : 'bg-white border-[#e8e8e8] hover:border-[#4096ff] hover:shadow-md'"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium pl-2" :class="customer === currentCustomer ? 'text-[#4096ff]' : 'text-gray-800'">
            {{ customer }}
          </span>

          <!-- 项目数量徽章 -->
          <div class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
               :class="customer === currentCustomer ? 'bg-[#4096ff] text-white' : 'bg-[#f0f0f0] text-gray-600'">
            {{ getProjectCount(customer) }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity mr-8">
          <button
            @click.stop="openEditDialog(customer)"
            class="p-1.5 text-gray-500 hover:text-[#4096ff] hover:bg-[#e6f4ff] rounded-md transition-all duration-200"
            title="编辑"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            @click.stop="handleDelete(customer)"
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
      <div v-if="customers.length === 0" class="flex flex-col items-center justify-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="text-sm text-gray-400">暂无客户</p>
      </div>
    </div>
  </div>

  <!-- 对话框 -->
  <Transition name="ant-zoom">
    <div
      v-if="customerDialogVisible"
      class="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <!-- 标题 -->
        <div class="px-6 py-4 border-b border-[#e8e8e8]">
          <h3 class="text-base font-semibold text-gray-800">
            {{ isEditCustomer ? '修改客户' : '新增客户' }}
          </h3>
        </div>

        <!-- 内容 -->
        <div class="px-6 py-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            客户名称
          </label>
          <input
            v-model="customerForm.name"
            type="text"
            placeholder="请输入客户名称"
            class="ant-input"
            @keyup.enter="handleSave"
          />
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button
            @click="customerDialogVisible = false"
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
