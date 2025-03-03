import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { mount } from '@vue/test-utils';

import Breadcrumb from '@/components/common/Breadcrumb.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({
    hash: {},
    query: {},
    params: {},
    matched: [],
    meta: { breadcrumb: 'bc' },
    name: 'some-url'
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}));

const testMenuItem = { label: 'foo', icon: 'bar', class: 'baz' };
const testModel = [testMenuItem, testMenuItem];

const wrapperSettings = (testHomeProp = testMenuItem, testModelProp = testModel) => ({
  props: {
    home: testHomeProp,
    model: testModelProp
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: {
              user: {}
            }
          }
        }),
      PrimeVue
    ],
    stubs: ['router-link']
  }
});

describe('Breadcrumb.vue', () => {
  it('renders', () => {
    const wrapper = mount(Breadcrumb, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
