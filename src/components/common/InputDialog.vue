<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  visible: boolean;
  title: string;
  label: string;
  placeholder?: string;
  value?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  value: ''
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'confirm': [value: string];
}>();

const inputValue = ref(props.value);

watch(() => props.visible, (newVal) => {
  if (newVal) {
    inputValue.value = props.value;
  }
});

watch(() => props.value, (newVal) => {
  inputValue.value = newVal;
});

function handleConfirm() {
  if (inputValue.value.trim()) {
    emit('confirm', inputValue.value.trim());
  }
}

function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Transition name="apple-zoom">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-md"
    >
      <div class="bg-white rounded-apple-lg shadow-apple-card w-full max-w-md">
        <!-- 标题 -->
        <div class="px-6 py-5">
          <h3 class="text-base font-semibold text-apple-near-black font-sf-display tracking-tight">{{ title }}</h3>
        </div>

        <!-- 内容 -->
        <div class="px-6 pb-5">
          <label class="block text-sm font-medium text-apple-near-black/70 mb-2 font-sf">
            {{ label }}
          </label>
          <input
            v-model="inputValue"
            type="text"
            :placeholder="placeholder"
            class="apple-input"
            @keyup.enter="handleConfirm"
          />
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 bg-apple-light-gray/60 rounded-b-apple-lg flex justify-end gap-2">
          <button
            @click="handleCancel"
            class="apple-btn-default"
          >
            取消
          </button>
          <button
            @click="handleConfirm"
            class="apple-btn"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
