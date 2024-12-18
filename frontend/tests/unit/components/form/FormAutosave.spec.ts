import { shallowMount } from '@vue/test-utils';
import FormAutosave from '@/components/form/FormAutosave.vue';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const testCallBack = vi.fn();

const wrapperSettings = (testCallBackProp = testCallBack) => ({
  props: {
    callback: testCallBackProp
  },
  global: {
    stubs: ['font-awesome-icon']
  }
});

describe('FormAutosave.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(FormAutosave, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
