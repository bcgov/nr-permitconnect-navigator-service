import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import { mount } from '@vue/test-utils';

import BackButton from '@/components/common/BackButton.vue';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

const testRouteName = 'foo';
const testText = 'bar';

const wrapperSettings = (testRouteNameProp: string, testTextProp: string, testConfirmLeaveProp: boolean) => ({
  props: {
    routeName: testRouteNameProp,
    text: testTextProp,
    confirmLeave: testConfirmLeaveProp
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
      PrimeVue,
      ConfirmationService
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('BackButton.vue', () => {
  it('renders', () => {
    const wrapper = mount(BackButton, wrapperSettings(testRouteName, testText, false));
    expect(wrapper).toBeTruthy();
  });
  it('renders', () => {
    const wrapper = mount(BackButton, wrapperSettings(testRouteName, testText, true));
    expect(wrapper).toBeTruthy();
  });
});
