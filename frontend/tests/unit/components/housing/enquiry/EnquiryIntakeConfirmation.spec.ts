import EnquiryIntakeConfirmation from '@/components/housing/enquiry/EnquiryIntakeConfirmation.vue';
import { userService } from '@/services';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';
import type { AxiosResponse } from 'axios';

const useUserService = vi.spyOn(userService, 'searchUsers');

const testAssignedActivityId = 'activity123';

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);

const wrapperSettings = (testAssignedActivityIdProp = testAssignedActivityId) => ({
  props: {
    assignedActivityId: testAssignedActivityIdProp,
    showHeader: true,
    showHomeLink: true
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
      ConfirmationService,
      ToastService
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('EnquiryIntakeConfirmation.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(EnquiryIntakeConfirmation, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
