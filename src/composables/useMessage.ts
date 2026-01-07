import { ref } from 'vue';

export type MessageType = 'success' | 'warning' | 'error';

export interface Message {
  id: number;
  text: string;
  type: MessageType;
}

let messageId = 0;

export function useMessage() {
  const messages = ref<Message[]>([]);

  function show(text: string, type: MessageType = 'success') {
    const id = ++messageId;
    messages.value.push({ id, text, type });
    return id;
  }

  function success(text: string) {
    return show(text, 'success');
  }

  function warning(text: string) {
    return show(text, 'warning');
  }

  function error(text: string) {
    return show(text, 'error');
  }

  function remove(id: number) {
    const index = messages.value.findIndex(m => m.id === id);
    if (index !== -1) {
      messages.value.splice(index, 1);
    }
  }

  function clear() {
    messages.value = [];
  }

  return {
    messages,
    show,
    success,
    warning,
    error,
    remove,
    clear
  };
}
