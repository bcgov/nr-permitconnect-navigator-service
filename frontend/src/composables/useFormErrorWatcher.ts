import { useFormStore } from '@/store';
import { useFormErrors } from 'vee-validate';
import { unref, watch } from 'vue';

import { useFormNames } from '@/composables/useFormNames';

import type { ComponentPublicInstance, MaybeRef, Ref } from 'vue';

/**
 * Watches form errors and automatically updates the store if the given formRef has an error
 * @param formRef A ref to any form component
 * @param formName Name of the form component
 * @param tab Optional tab the component is in
 */
export function useFormErrorWatcher(
  formRef: Ref<ComponentPublicInstance | null>,
  formName: string,
  tab: MaybeRef<number> = 0
) {
  watch(useFormErrors(), (errors) => {
    const _tab = unref(tab);

    const { getFormNames } = useFormNames(formRef);

    // Normalize error field names
    const errorFields = new Set(Object.keys(errors));

    // Get form field names once
    const formFields = new Set(getFormNames());

    // Check for intersection
    const formHasError = [...errorFields].some((field) => formFields.has(field));

    useFormStore().setFormError(formName, _tab, formHasError);
  });
}
