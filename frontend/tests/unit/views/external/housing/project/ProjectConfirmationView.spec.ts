import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import { userService } from '@/services';
import ProjectConfirmationView from '@/views/external/housing/project/ProjectConfirmationView.vue';

import type { AxiosResponse } from 'axios';

const useUserService = vi.spyOn(userService, 'searchUsers');

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);

const testSubmissionId = 'submission123';
const testActivityId = 'activity123';

const wrapperSettings = (testSubmissionIdProp = testSubmissionId, testActivityIdProp = testActivityId) => ({
  props: {
    submissionId: testSubmissionIdProp,
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

describe('ProjectConfirmationView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(ProjectConfirmationView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
