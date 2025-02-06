import IntakeAssistanceConfirmation from '@/components/housing/submission/IntakeAssistanceConfirmation.vue';
import { userService } from '@/services';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';
import type { AxiosResponse } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const useUserService = vi.spyOn(userService, 'searchUsers');

const testAssignedActivityId = 'activity123';

const testAssignedEnquiryId = 'enquiry123';

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);

const wrapperSettings = (
  testAssignedActivityIdProp = testAssignedActivityId,
  testAssignedEnquiryIdProp = testAssignedEnquiryId
) => ({
  props: {
    assignedActivityId: testAssignedActivityIdProp,
    assignedEnquiryId: testAssignedEnquiryIdProp
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

describe('IntakeAssistanceConfirmation.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(IntakeAssistanceConfirmation, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
