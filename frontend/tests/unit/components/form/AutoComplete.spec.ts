import { shallowMount } from '@vue/test-utils';

import AutoComplete from '@/components/form/AutoComplete.vue';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const testName = 'foo';
const testSuggestions = ['bar', 'baz'];

const wrapperSettings = (testNameProp = testName, testSuggestionsProp = testSuggestions) => ({
  props: {
    name: testNameProp,
    suggestions: testSuggestionsProp
  },
  global: {
    stubs: ['font-awesome-icon']
  }
});

describe('AutoComplete.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(AutoComplete, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
