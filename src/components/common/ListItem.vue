<script setup lang="ts">
interface Props {
  title: string;
  selected?: boolean;
  count?: number;
  showActions?: boolean;
}

withDefaults(defineProps<Props>(), {
  selected: false,
  count: 0,
  showActions: true
});

const emit = defineEmits<{
  'click': [];
  'edit': [];
  'delete': [];
}>();

function handleClick() {
  emit('click');
}

function handleEdit(event: Event) {
  event.stopPropagation();
  emit('edit');
}

function handleDelete(event: Event) {
  event.stopPropagation();
  emit('delete');
}
</script>

<template>
  <div
    @click="handleClick"
    class="group relative py-2.5 px-3 cursor-pointer transition-all duration-200"
    :class="selected ? 'bg-white/10' : 'hover:bg-white/5'"
  >
    <div class="flex items-center justify-between">
      <span
        class="text-sm font-normal pl-2 transition-colors duration-200"
        :class="selected ? 'text-white' : 'text-white/70'"
      >
        {{ title }}
      </span>

      <!-- 数量徽章 -->
      <div
        class="min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
        :class="selected ? 'bg-apple-blue text-white' : 'bg-white/10 text-white/50'"
      >
        {{ count }}
      </div>
    </div>

    <!-- 选中指示条 -->
    <div
      v-if="selected"
      class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-apple-blue rounded-r"
    />

    <!-- 操作按钮 -->
    <div v-if="showActions" class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-8">
      <button
        @click="handleEdit"
        class="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200"
        title="编辑"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <button
        @click="handleDelete"
        class="p-1.5 text-white/40 hover:text-apple-danger hover:bg-white/10 rounded-md transition-all duration-200"
        title="删除"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>
