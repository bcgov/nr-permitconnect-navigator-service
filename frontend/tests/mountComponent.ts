import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { Field, useForm } from 'vee-validate';
import { defineComponent, h } from 'vue';
import { mount, RouterLinkStub } from '@vue/test-utils';

import i18n from '@/i18n';

import type { Pinia } from 'pinia';
import type { Component, Plugin } from 'vue';
import type { Stubs } from '@vue/test-utils';

export interface PiniaOptions {
  /** Pinia initial state, keyed by store id, e.g. { auth: { user: {} } } */
  piniaState?: Record<string, unknown>;
  /**
   * Called with the testing-Pinia instance *before* mount -- e.g. to spy on
   * a plain store method/action via `vi.spyOn(store, 'someAction')`.
   *
   * This does NOT reliably work for Pinia getters -- `vi.spyOn(store,
   * 'someGetter', 'get')` doesn't attach correctly, since a Pinia getter is
   * a `computed()` ref stored as a plain property value, not a real
   * accessor descriptor. To control a getter's value, set the state it
   * derives from instead, via `piniaState` (or `store.$patch(...)` in here).
   */
  configurePinia?: (pinia: Pinia) => void;
}

export interface FormContextConfig {
  /**
   * Field names to render as real `<Field as="input" :name="...">`
   * elements, so tests can drive them via `setFieldValue(wrapper, name,
   * value)`. Only needed for fields the component under test doesn't
   * already register itself (e.g. an unrelated field to make a form
   * "dirty") -- don't duplicate a field the component registers on its
   * own, that creates two registrations for the same name.
   */
  fields?: string[];
  /** Passed straight through to useForm(), e.g. { initialValues: {...} } */
  formProps?: Record<string, unknown>;
}

export interface MountComponentOptions extends PiniaOptions {
  /** Props for the component under test */
  props?: Record<string, unknown>;
  /** Component stubs, merged with any caller-specific defaults */
  stubs?: Stubs;
  /** Injection keys/values, e.g. { [someKey]: { value: 'x' } } */
  provide?: Record<string | symbol, unknown>;
  /** Extra global plugins beyond the always-installed PrimeVue/i18n/etc. */
  plugins?: Plugin[];
  /** Extra global directives beyond the always-installed Tooltip */
  directives?: Record<string, unknown>;
  /**
   * When set, mounts the component inside a synthetic harness that calls
   * vee-validate's `useForm()` and renders real `<Field>` elements for the
   * given names. Omit for components that establish their own `<Form>`
   * context.
   */
  formContext?: FormContextConfig;
}

/** Stubs that are safe defaults for (almost) any form component in this app. */
export const defaultStubs: Stubs = {
  RouterLink: RouterLinkStub,
  'font-awesome-icon': true
};

export interface MountResult {
  wrapper: ReturnType<typeof mount>;
  pinia?: Pinia;
}

export interface MountResultWithForm extends MountResult {
  form: ReturnType<typeof useForm>;
}

interface PiniaSetupResult {
  pinia?: Pinia;
  plugin?: Plugin;
}

function setupPinia({ piniaState, configurePinia }: PiniaOptions): PiniaSetupResult {
  if (piniaState === undefined && !configurePinia) {
    return {};
  }

  const pinia = createTestingPinia({ initialState: piniaState ?? {} });
  configurePinia?.(pinia);
  return { pinia, plugin: pinia };
}

// Overload function so we can guarantee the correct return shape
export function mountComponent(
  component: Component,
  options: MountComponentOptions & { formContext: FormContextConfig }
): MountResultWithForm;
export function mountComponent(component: Component, options?: MountComponentOptions): MountResult;
export function mountComponent(
  component: Component,
  options: MountComponentOptions = {}
): MountResult | MountResultWithForm {
  const { props, stubs = {}, provide = {}, plugins = [], directives = {}, formContext } = options;
  const { pinia, plugin } = setupPinia(options);

  const resolvedPlugins: Plugin[] = [
    ...(plugin ? [plugin] : []),
    PrimeVue,
    i18n,
    ConfirmationService,
    ToastService,
    ...plugins
  ];
  const resolvedDirectives = { Tooltip, ...directives };

  if (!formContext) {
    const wrapper = mount(component, {
      props,
      global: {
        plugins: resolvedPlugins,
        stubs: { ...defaultStubs, ...stubs },
        provide,
        directives: resolvedDirectives
      }
    });

    return { wrapper, pinia };
  }

  const { fields = [], formProps = {} } = formContext;

  // Captured via closure -- `useForm()` runs synchronously during the
  // Harness's setup(), itself synchronous as part of mount(), so `form` is
  // guaranteed assigned by the time mount() returns. This calls useForm()
  // directly rather than rendering vee-validate's <Form> SFC, since <Form>'s
  // exposed instance API isn't reliably reachable via
  // `wrapper.findComponent(Form).vm`.
  let form!: ReturnType<typeof useForm>;

  const Harness = defineComponent({
    setup() {
      form = useForm(formProps);
      return {};
    },
    render() {
      return h('div', [...fields.map((name) => h(Field, { key: name, name, as: 'input' })), h(component, props)]);
    }
  });

  const wrapper = mount(Harness, {
    global: { plugins: resolvedPlugins, stubs: { ...defaultStubs, ...stubs }, provide, directives: resolvedDirectives }
  });

  return { wrapper, pinia, form };
}

/** Convenience: set a named field's value and let vee-validate react. */
export async function setFieldValue(wrapper: ReturnType<typeof mount>, name: string, value: string) {
  await wrapper.find(`[name="${name}"]`).setValue(value);
}
