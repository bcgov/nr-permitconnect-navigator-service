import SubmissionDraftListProponent from '@/components/housing/submission/SubmissionDraftListProponent.vue';
import { userService } from '@/services';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import type { AxiosResponse } from 'axios';

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const useUserService = vi.spyOn(userService, 'searchUsers');

const testDraft = { foo: 'bar' };
const testDrafts = [testDraft];

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);

const wrapperSettings = (testDraftsProp = testDrafts) => ({
  props: {
    drafts: testDraftsProp,
    loading: false
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

describe('SubmissionDraftListProponent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(SubmissionDraftListProponent, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
