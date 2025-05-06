import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import { createTestingPinia } from '@pinia/testing';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import UserManageModal from '@/components/user/UserManageModal.vue';
import { yarsService } from '@/services';

import type { AxiosResponse } from 'axios';

// Mock dependenciefs
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

// Spies
const getGroups = vi.spyOn(yarsService, 'getGroups');

getGroups.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);

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
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

// Tests
describe('UserManageModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(UserManageModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
