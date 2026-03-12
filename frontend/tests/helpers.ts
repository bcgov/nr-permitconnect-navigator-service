import { reactive } from 'vue';
import i18n from '@/i18n';

import type { AxiosRequestHeaders, AxiosResponse } from 'axios';
import type { GenericObject } from 'vee-validate';

// Globals
export const { t } = i18n.global;

/*
 * Function to easily create an axios error response
 */
export function mockAxiosError(message: string, code?: string) {
  const err = new Error(message);
  Object.assign(err, {
    isAxiosError: true,
    response: { data: { type: code, message } }
  });
  return err;
}

/*
 * Function to easily create an axios error with no response object
 */
export function mockAxiosErrorNoResponse(message: string) {
  const err = new Error(message);
  Object.assign(err, { isAxiosError: true });
  return err;
}

/*
 * Function to easily create any required axios response necessary for the given type
 */
export function mockAxiosResponse<T>(data: T, status = 200, statusText = 'OK'): AxiosResponse<T> {
  return {
    data: data,
    status,
    statusText,
    headers: {},
    config: {
      headers: {} as AxiosRequestHeaders
    }
  };
}

/*
 * Define stubs for form components
 */
export const FORM_STUBS = {
  AutoComplete: {
    name: 'AutoComplete',
    props: ['name', 'disabled', 'suggestions', 'label', 'placeholder', 'getOptionLabel'],
    template: '<div class="stub-autocomplete p-inputtext"></div>',
    emits: ['onComplete', 'onSelect', 'onChange']
  },
  CancelButton: {
    name: 'CancelButton',
    props: ['editable'],
    template: '<button class="stub-cancel"></button>',
    emits: ['clicked']
  },
  Checkbox: {
    name: 'Checkbox',
    props: ['name', 'disabled', 'label'],
    template: '<input type="checkbox" class="stub-checkbox" />',
    emits: ['onChange']
  },
  EditableSelect: {
    name: 'EditableSelect',
    props: ['name', 'disabled', 'options', 'label', 'placeholder', 'getOptionLabel'],
    template: '<div class="stub-editable"></div>',
    emits: ['onInput', 'onChange']
  },
  InputNumber: {
    name: 'InputNumber',
    props: ['name', 'disabled', 'label'],
    template: '<input class="stub-input-number" />',
    emits: ['onInput', 'onChange']
  },
  InputText: {
    name: 'InputText',
    props: ['name', 'disabled', 'label'],
    template: '<input class="stub-input-text" />',
    emits: ['onInput', 'onChange']
  },
  Select: {
    name: 'Select',
    props: ['name', 'disabled', 'options', 'label', 'optionLabel', 'optionValue'],
    template: '<select class="stub-select"></select>',
    emits: ['onChange']
  },
  TextArea: {
    name: 'TextArea',
    props: ['name', 'disabled', 'label'],
    template: '<textarea class="stub-textarea"></textarea>',
    emits: ['onInput']
  }
};

/*
 * Force PrimeVue stubs to render children
 */
export const PRIMEVUE_STUBS = {
  Button: {
    name: 'Button',
    inheritAttrs: false,
    template: `
          <button
            v-bind="$attrs"
          >
            <slot />
          </button>
        `
  },
  Card: {
    template: '<div><slot name="title" /><slot name="content" /></div>'
  },
  Message: { template: '<div><slot /></div>' },
  Tabs: { template: '<div><slot /></div>' },
  TabList: { template: '<div><slot /></div>' },
  Tab: { template: '<div><slot /></div>' },
  TabPanels: { template: '<div><slot /></div>' },
  TabPanel: { template: '<div><slot /></div>' }
};

export const VEE_FORM_STUB = {
  name: 'VeeFormStub',
  props: ['initialValues'],
  setup(props: { initialValues?: GenericObject }) {
    // Make values reactive so watchers trigger updates
    const values = reactive(props.initialValues || {});

    // Provide a basic setFieldValue function to satisfy the component's internal logic
    const setFieldValue = (field: string, val: unknown) => {
      const keys = field.split('.');
      let current: GenericObject = values;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]!;

        if (typeof current[key] !== 'object' || current[key] === null) {
          current[key] = {};
        }
        current = current[key];
      }
      const lastKey = keys.at(-1)!;
      current[lastKey] = val;
    };

    // Add resetField to mimic vee-validate
    const resetField = (field: string, state?: { value?: unknown }) => {
      if (state && 'value' in state) {
        setFieldValue(field, state.value);
      }
    };

    // Provide a basic resetForm function
    const resetForm = (state?: GenericObject) => {
      if (state?.values) {
        Object.assign(values, state.values);
      } else if (props.initialValues) {
        Object.assign(values, props.initialValues);
      }
    };

    return { values, setFieldValue, resetField, resetForm };
  },
  template:
    '<form class="vee-form-stub" @submit.prevent><slot :values="values" :setFieldValue="setFieldValue" /></form>'
};
