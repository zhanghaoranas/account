<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '删除',
  cancelText: '取消'
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'confirm': [];
}>();

// 内部状态用于控制动画
const localVisible = ref(props.visible);

watch(() => props.visible, (newVal) => {
  localVisible.value = newVal;
});

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Transition name="ant-zoom">
    <div
      v-if="localVisible"
      class="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-[#e8e8e8]">
          <h3 class="text-base font-semibold text-gray-800">{{ title }}</h3>
        </div>
        <div class="px-6 py-4">
          <p class="text-sm text-gray-600">{{ message }}</p>
        </div>
        <div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button
            @click="handleCancel"
            class="ant-btn ant-btn-default"
          >
            {{ cancelText }}
          </button>
          <button
            @click="handleConfirm"
            class="ant-btn ant-btn-danger"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
