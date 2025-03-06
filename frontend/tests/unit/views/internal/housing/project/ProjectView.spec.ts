import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import { documentService, enquiryService, noteService, permitService, submissionService } from '@/services';
import ProjectView from '@/views/internal/housing/project/ProjectView.vue';

import type { AxiosResponse } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

const useSubmissionService = vi.spyOn(submissionService, 'getSubmission');
const useDocumentService = vi.spyOn(documentService, 'listDocuments');
const useNoteService = vi.spyOn(noteService, 'listNotes');
const usePermitService = vi.spyOn(permitService, 'listPermits');
const usePermitServicePermitTypes = vi.spyOn(permitService, 'getPermitTypes');
const useEnquiryService = vi.spyOn(enquiryService, 'listRelatedEnquiries');

useSubmissionService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
useDocumentService.mockResolvedValue({
  data: [{ filename: 'foo', activityId: 'activity456' }]
} as AxiosResponse);
useNoteService.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);
usePermitService.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);
usePermitServicePermitTypes.mockResolvedValue({
  data: { enquiryId: 'enquiry123', activityId: 'activity456' }
} as AxiosResponse);
useEnquiryService.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);

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

describe('ProjectView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
