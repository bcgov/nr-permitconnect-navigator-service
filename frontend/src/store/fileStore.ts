import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Ref } from 'vue';

export type FileStoreState = {
  files: Ref<Array<File>>;
};

export const useFileStore = defineStore('file', () => {
  // State
  const state: FileStoreState = {
    files: ref([])
  };

  // Getters
  const getters = {
    getFiles: computed(() => state.files.value)
  };

  // Actions
  function createFile(file: File) {
    let newFileName = file.name;
    const count = state.files.value.filter((x: File) => x.name.includes(file.name)).length;
    if (count > 0) {
      newFileName = file.name + ` (${count + 1})`;
    }
    const newFile = new File([file], newFileName, { type: file.type });
    state.files.value.push(newFile);
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    createFile
  };
});

export default useFileStore;
