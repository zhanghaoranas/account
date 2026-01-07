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
  <Transition name="ant-zoom">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <!-- 标题 -->
        <div class="px-6 py-4 border-b border-[#e8e8e8]">
          <h3 class="text-base font-semibold text-gray-800">{{ title }}</h3>
        </div>

        <!-- 内容 -->
        <div class="px-6 py-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ label }}
          </label>
          <input
            v-model="inputValue"
            type="text"
            :placeholder="placeholder"
            class="ant-input"
            @keyup.enter="handleConfirm"
          />
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button
            @click="handleCancel"
            class="ant-btn ant-btn-default"
          >
            取消
          </button>
          <button
            @click="handleConfirm"
            class="ant-btn ant-btn-primary"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
