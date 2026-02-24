import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { FormType, FormState } from '@/utils/enums/projectCommon';
import type { Ref } from 'vue';

export interface FormStoreState {
  formType: Ref<FormType>;
  formState: Ref<FormState>;
  formErrors: Ref<{ formName: string; tab: number }[]>;
}

export const useFormStore = defineStore('form', () => {
  // State
  const state: FormStoreState = {
    formErrors: ref([]),
    formType: ref(FormType.NEW),
    formState: ref(FormState.UNLOCKED)
  };

  // Getters
  const getters = {
    getFirstErrorTab: computed(() => state.formErrors.value.sort((a, b) => a.tab - b.tab)[0]?.tab ?? 0),
    getEditable: computed(
      () => state.formType.value !== FormType.SUBMISSION && state.formState.value === FormState.UNLOCKED
    ),
    getFormState: computed(() => state.formState.value),
    getFormType: computed(() => state.formType.value)
  };

  // Actions
  function setFormError(formName: string, tab: number, formHasError: boolean) {
    if (formHasError) {
      state.formErrors.value.push({ formName, tab });
    } else {
      state.formErrors.value = state.formErrors.value.filter((x) => x.formName !== formName);
    }
  }

  function setFormType(formType: FormType) {
    state.formType.value = formType;
  }

  function setFormState(formState: FormState) {
    state.formState.value = formState;
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    setFormError,
    setFormType,
    setFormState
  };
});

export default useFormStore;
