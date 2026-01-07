<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Props {
  text: string;
  type?: 'success' | 'warning' | 'error';
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 3000
});

const emit = defineEmits<{
  'close': [];
}>();

const visible = ref(true);

onMounted(() => {
  setTimeout(() => {
    visible.value = false;
    setTimeout(() => {
      emit('close');
    }, 300); // 等待动画结束
  }, props.duration);
});
</script>

<template>
  <Transition name="ant-slide-up">
    <div
      v-if="visible"
      class="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-sm font-medium"
      :class="{
        'bg-[#f6ffed] border border-[#b7eb8f] text-[#52c41a]': type === 'success',
        'bg-[#fffbe6] border border-[#ffe58f] text-[#faad14]': type === 'warning',
        'bg-[#fff2f0] border border-[#ffccc7] text-[#f5222d]': type === 'error'
      }"
    >
      {{ text }}
    </div>
  </Transition>
</template>
