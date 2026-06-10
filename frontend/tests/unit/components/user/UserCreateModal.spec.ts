import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import UserCreateModal from '@/components/user/UserCreateModal.vue';
import { yarsService } from '@/services';
import type { Group } from '@/types';

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

// Spies
const listGroupsSpy = vi.spyOn(yarsService, 'listGroups');

// Mocks
listGroupsSpy.mockResolvedValue([{ groupId: 123 }] as Group[]);

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

describe('UserCreateModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(UserCreateModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
