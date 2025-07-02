import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import { contactService, permitService, housingProjectService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import PermitStatusView from '@/views/external/housing/permit/PermitStatusView.vue';

import type { AxiosResponse } from 'axios';

const getPermitSpy = vi.spyOn(permitService, 'getPermit');
const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');
const searchProjectsSpy = vi.spyOn(housingProjectService, 'searchProjects');

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
const testHousingProjectId = 'submission123';

const wrapperSettings = (testPermitIdProp = testPermitId, testHousingProjectIdProp = testHousingProjectId) => ({
  props: {
    permitId: testPermitIdProp,
    projectId: testHousingProjectIdProp
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
    stubs: ['font-awesome-icon', 'router-link', 'AuthorizationStatusPill']
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
  searchProjectsSpy.mockResolvedValue({ data: [{ fullName: 'notTested' }] } as AxiosResponse);
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
