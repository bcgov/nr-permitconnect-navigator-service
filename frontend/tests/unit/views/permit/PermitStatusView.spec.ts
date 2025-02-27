import { createTestingPinia } from '@pinia/testing';
import { shallowMount } from '@vue/test-utils';

import PermitStatusView from '@/views/permit/PermitStatusView.vue';
import { contactService, permitService, submissionService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import type { AxiosResponse } from 'axios';

const getPermitSpy = vi.spyOn(permitService, 'getPermit');
const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');
const searchSubmissionsSpy = vi.spyOn(submissionService, 'searchSubmissions');

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testPermitId = 'permit123';
const testSubmissionId = 'submission123';

const wrapperSettings = (testPermitIdProp = testPermitId, testSubmissionIdProp = testSubmissionId) => ({
  props: {
    permitId: testPermitIdProp,
    submissionId: testSubmissionIdProp
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
    stubs: ['font-awesome-icon', 'router-link', 'StatusPill']
  }
});

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();

  searchContactsSpy.mockResolvedValue({ data: ['notTested'] } as AxiosResponse);
  getPermitSpy.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
  searchSubmissionsSpy.mockResolvedValue({ data: [{ fullName: 'notTested' }] } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('PermitStatusView', () => {
  it('renders component', () => {
    const wrapper = shallowMount(PermitStatusView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
