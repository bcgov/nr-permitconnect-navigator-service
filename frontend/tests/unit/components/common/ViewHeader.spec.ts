import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { mount } from '@vue/test-utils';

import ViewHeader from '@/components/common/ViewHeader.vue';

const wrapperSettings = () => ({
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
    ]
  }
});

describe('ViewHeader.vue', () => {
  it('renders', () => {
    const wrapper = mount(ViewHeader, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
