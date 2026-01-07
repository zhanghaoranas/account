import { ref } from 'vue';

export interface DialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export function useDialog() {
  const visible = ref(false);
  const title = ref('');
  const message = ref('');
  const confirmText = ref('确定');
  const cancelText = ref('取消');
  const pendingValue = ref<any>(null);

  function open(options: DialogOptions = {}) {
    title.value = options.title || '';
    message.value = options.message || '';
    confirmText.value = options.confirmText || '确定';
    cancelText.value = options.cancelText || '取消';
    visible.value = true;
  }

  function close() {
    visible.value = false;
    pendingValue.value = null;
  }

  function confirm(value?: any) {
    pendingValue.value = value;
    visible.value = false;
    return value;
  }

  return {
    visible,
    title,
    message,
    confirmText,
    cancelText,
    pendingValue,
    open,
    close,
    confirm
  };
}

export function useInputDialog() {
  const visible = ref(false);
  const title = ref('');
  const label = ref('');
  const placeholder = ref('');
  const value = ref('');
  const isEdit = ref(false);
  const editingValue = ref<any>(null);

  function openForAdd(options: { title: string; label: string; placeholder?: string }) {
    isEdit.value = false;
    title.value = options.title;
    label.value = options.label;
    placeholder.value = options.placeholder || '';
    value.value = '';
    visible.value = true;
  }

  function openForEdit(options: { title: string; label: string; currentValue: any; placeholder?: string }) {
    isEdit.value = true;
    editingValue.value = options.currentValue;
    title.value = options.title;
    label.value = options.label;
    placeholder.value = options.placeholder || '';
    value.value = options.currentValue;
    visible.value = true;
  }

  function close() {
    visible.value = false;
    isEdit.value = false;
    editingValue.value = null;
    value.value = '';
  }

  return {
    visible,
    title,
    label,
    placeholder,
    value,
    isEdit,
    editingValue,
    openForAdd,
    openForEdit,
    close
  };
}
