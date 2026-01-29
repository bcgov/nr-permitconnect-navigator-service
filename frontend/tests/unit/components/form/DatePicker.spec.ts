import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';

import DatePicker from '@/components/form/DatePicker.vue';

vi.mock('vee-validate', () => ({
  useField: vi.fn(() => ({
    errorMessage: ref(''),
    handleBlur: vi.fn(),
    value: ref(undefined)
  })),
  ErrorMessage: {
    name: 'ErrorMessage',
    template: '<div />'
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const testName = 'foo';

const wrapperSettings = (overrides: Record<string, string> = {}) => ({
  props: {
    name: testName,
    ...overrides
  },
  global: {
    stubs: {
      DatePicker: true
    }
  }
});

describe('DatePicker.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(DatePicker, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('renders label + help ids based on name', () => {
    const wrapper = shallowMount(DatePicker, wrapperSettings({ label: 'My Label', helpText: 'Help' }));

    expect(wrapper.find(`#${testName}-label`).exists()).toBe(true);
    expect(wrapper.find(`#${testName}-help`).exists()).toBe(true);
  });

  it('does not render a label element when label is empty', () => {
    const wrapper = shallowMount(DatePicker, wrapperSettings({ label: '' }));
    expect(wrapper.find('label').exists()).toBe(false);
  });
});
