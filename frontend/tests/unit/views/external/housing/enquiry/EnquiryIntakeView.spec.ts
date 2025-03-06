import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import { userService } from '@/services';
import EnquiryIntakeView from '@/views/external/housing/enquiry/EnquiryIntakeView.vue';

import type { AxiosResponse } from 'axios';

const useUserService = vi.spyOn(userService, 'searchUsers');

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);

const testEnquiryId = 'enquiry123';
const testActivityId = 'activity123';

const wrapperSettings = (testEnquiryIdProp = testEnquiryId, testActivityIdProp = testActivityId) => ({
  props: {
    enquiryId: testEnquiryIdProp,
    activityId: testActivityIdProp
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

describe('EnquiryIntakeView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(EnquiryIntakeView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
