<script setup lang="ts">
interface Props {
  title: string;
  buttonText?: string;
  disableButton?: boolean;
  showButton?: boolean;
}

defineProps<Props>();
defineEmits<{
  'button-click': [];
}>();
</script>

<template>
  <div class="flex justify-between items-center px-4 py-2.5 border-b border-[#e8e8e8] bg-gray-50 shadow-sm">
    <h3 class="text-sm font-semibold text-gray-800">{{ title }}</h3>
    <button
      v-if="showButton"
      @click="$emit('button-click')"
      :disabled="disableButton"
      class="ant-btn ant-btn-primary flex items-center gap-1 text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      {{ buttonText }}
    </button>
  </div>
</template>
