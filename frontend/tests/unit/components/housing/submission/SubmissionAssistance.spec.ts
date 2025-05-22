import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import SubmissionAssistance from '@/components/housing/submission/SubmissionAssistance.vue';
import { userService } from '@/services';
import { IntakeFormCategory } from '@/utils/enums/projectCommon';

import type { AxiosResponse } from 'axios';

const useUserService = vi.spyOn(userService, 'searchUsers');

const testFormErrors: Record<string, string | undefined> = {
  [`${IntakeFormCategory.CONTACTS}.name`]: undefined,
  [`${IntakeFormCategory.CONTACTS}.email`]: 'Invalid email address'
};

const testFormValues: { [key: string]: string } = {
  [`${IntakeFormCategory.CONTACTS}`]: 'John Doe',
  [`${IntakeFormCategory.CONTACTS}.email`]: 'john.doe@example.com'
};

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);

const wrapperSettings = (testFormErrorsProp = testFormErrors, testFormValuesProp = testFormValues) => ({
  props: {
    formErrors: testFormErrorsProp,
    formValues: testFormValuesProp
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

describe('SubmissionAssistance.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(SubmissionAssistance, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
