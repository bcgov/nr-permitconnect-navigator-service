import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import ProjectDraftListProponent from '@/components/projectCommon/ProjectDraftListProponent.vue';
import { userService } from '@/services';

import type { AxiosResponse } from 'axios';
import type { Draft } from '@/types';

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const useUserService = vi.spyOn(userService, 'searchUsers');

const testDraft = { draftId: 'bar' };
const testDrafts = [testDraft] as Draft[];

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

describe('ProjectDraftListProponent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(ProjectDraftListProponent, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
