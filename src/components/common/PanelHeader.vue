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
  <div class="flex justify-between items-center px-5 py-3">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-white/40 font-sf">{{ title }}</h3>
    <button
      v-if="showButton"
      @click="$emit('button-click')"
      :disabled="disableButton"
      class="apple-btn text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      {{ buttonText }}
    </button>
  </div>
</template>
