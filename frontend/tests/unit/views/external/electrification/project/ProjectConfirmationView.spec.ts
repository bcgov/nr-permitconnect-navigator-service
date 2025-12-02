import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import { electrificationProjectService } from '@/services';
import ProjectConfirmationView from '@/views/external/electrification/project/ProjectConfirmationView.vue';

import type { AxiosResponse } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const getProjectSpy = vi.spyOn(electrificationProjectService, 'getProject');

getProjectSpy.mockResolvedValue({ data: { activityId: '123', submissionId: '456' } } as AxiosResponse);

const testSubmissionId = 'submission123';

const wrapperSettings = (testSubmissionIdProp = testSubmissionId) => ({
  props: {
    projectId: testSubmissionIdProp
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
