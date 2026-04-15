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
    }, 300);
  }, props.duration);
});
</script>

<template>
  <Transition name="apple-slide-up">
    <div
      v-if="visible"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] px-5 py-2.5 rounded-apple text-sm font-medium font-sf backdrop-blur-xl"
      :class="type === 'error' ? 'bg-white/90 text-apple-danger shadow-apple-card' : 'bg-white/90 text-apple-near-black shadow-apple-card'"
    >
      <span v-if="type === 'success'" class="inline-block mr-1.5 text-green-500">&#10003;</span>
      <span v-if="type === 'warning'" class="inline-block mr-1.5 text-amber-500">&#9888;</span>
      <span v-if="type === 'error'" class="inline-block mr-1.5 text-apple-danger">&#10007;</span>
      {{ text }}
    </div>
  </Transition>
</template>
