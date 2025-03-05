import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import { userService } from '@/services';
import EnquiryConfirmationView from '@/views/external/housing/enquiry/EnquiryConfirmationView.vue';

import type { AxiosResponse } from 'axios';

const useUserService = vi.spyOn(userService, 'searchUsers');

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);

const testEnquiryId = 'enquiry123';
const testActivityId = 'activity123';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const wrapperSettings = (testEnquiryIdProp = testEnquiryId, testActivityIdProp = testActivityId) => ({
  props: {
    enquiryId: testEnquiryIdProp,
    activityId: testActivityIdProp,
    showEnquiryLink: ''
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

describe('EnquiryConfirmationView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(EnquiryConfirmationView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
