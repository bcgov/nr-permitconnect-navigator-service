import { ref, onMounted, onBeforeUnmount } from 'vue';

import type { Ref } from 'vue';

// autosave functionality for forms, saves on inactivity after the delay (default 10 seconds)
export function useAutoSave(saveCallback: () => void, delay: number = 10000) {
  const formUpdated: Ref<Boolean> = ref(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const startTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(async () => {
      if (formUpdated.value) {
        await saveCallback();
        formUpdated.value = false;
        timeoutId = null;
      }
    }, delay);
  };

  const onActivity = () => {
    startTimer();
  };

  onMounted(() => {
    window.addEventListener('keydown', onActivity);
    window.addEventListener('focus', onActivity);
    window.addEventListener('click', onActivity);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onActivity);
    window.removeEventListener('focus', onActivity);
    window.removeEventListener('click', onActivity);
    if (timeoutId) clearTimeout(timeoutId);
  });

  return {
    formUpdated,
    stopAutoSave: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  };
}
