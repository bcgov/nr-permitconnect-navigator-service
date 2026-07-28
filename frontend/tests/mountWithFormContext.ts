/**
 * Entry point for components that ASSUME an ancestor already provides
 * vee-validate's form context (`useIsFormDirty`, `useFormValues`,
 * `useField`, etc.) -- field/section-level components that don't render
 * their own `<Form>`.
 *
 * See mountComponent.ts for the shared implementation. Components that
 * establish their own `<Form>` context (top-level form containers) don't
 * need this wrapper at all -- just call `mountComponent` directly.
 */
import { mountComponent, setFieldValue } from './mountComponent';

import type { Component } from 'vue';
import type { MountComponentOptions } from './mountComponent';

export interface FormContextOptions {
  /**
   * Field names to render as real `<Field as="input" :name="...">` elements
   * inside the form, so tests can drive them via
   * `setFieldValue(wrapper, name, value)`. Don't include a field the
   * component under test already registers itself.
   */
  fields?: string[];
  /** Passed straight through to useForm(), e.g. { initialValues: {...} } */
  formProps?: Record<string, unknown>;
  /** Props for the component under test */
  componentProps?: Record<string, unknown>;
  /** Component stubs, merged with mountComponent's dependency-level defaults */
  stubs?: MountComponentOptions['stubs'];
  /** Extra global plugins beyond PrimeVue + i18n */
  plugins?: MountComponentOptions['plugins'];
  /** Pinia initial state, keyed by store id, e.g. { auth: { user: {} } } */
  piniaState?: MountComponentOptions['piniaState'];
  /** See PiniaOptions.configurePinia in mountComponent.ts for caveats */
  configurePinia?: MountComponentOptions['configurePinia'];
}

export function mountWithFormContext(component: Component, options: FormContextOptions = {}) {
  const { fields, formProps, componentProps, stubs, plugins, piniaState, configurePinia } = options;

  return mountComponent(component, {
    props: componentProps,
    stubs,
    plugins,
    piniaState,
    configurePinia,
    formContext: { fields, formProps }
  });
}

export { setFieldValue };
