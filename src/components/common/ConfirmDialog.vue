<script setup lang="ts">
import { ref, watch } from 'vue';
import DialogOverlay from './DialogOverlay.vue';

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
  <DialogOverlay :visible="localVisible" @close="handleCancel">
    <div class="bg-white rounded-apple-lg shadow-apple-card w-full max-w-md">
      <div class="px-6 py-5">
        <h3 class="text-base font-semibold text-apple-near-black font-sf-display tracking-tight">{{ title }}</h3>
      </div>
      <div class="px-6 pb-5">
        <p class="text-sm text-[rgba(0,0,0,0.8)] font-sf leading-relaxed">{{ message }}</p>
      </div>
      <div class="px-6 py-4 bg-apple-light-gray/60 rounded-b-apple-lg flex justify-end gap-2">
        <button
          @click="handleCancel"
          class="apple-btn-default"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          class="apple-btn-danger"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </DialogOverlay>
</template>
