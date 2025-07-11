import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import { enquiryService, noteHistoryService } from '@/services';
import EnquiryView from '@/views/internal/electrification/enquiry/EnquiryView.vue';

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

const useEnquiryService = vi.spyOn(enquiryService, 'getEnquiry');
const useNoteService = vi.spyOn(noteHistoryService, 'listNoteHistories');

useNoteService.mockResolvedValue({ data: { activityId: 'activity456' } } as AxiosResponse);
useEnquiryService.mockResolvedValue({ data: { enquiryId: 'enquiry123' } } as AxiosResponse);

const testEnquiryId = 'enquiry123';

const wrapperSettings = (testEnquiryIdProp = testEnquiryId) => ({
  props: {
    enquiryId: testEnquiryIdProp
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

describe('EnquiryView.vue [Electrification]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(EnquiryView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
