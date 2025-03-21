import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { StorageKey } from '@/utils/enums/application';
import { shallowMount } from '@vue/test-utils';

import { contactService, enquiryService, permitService, housingProjectService } from '@/services';
import ProjectView from '@/views/external/housing/project/ProjectView.vue';

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
    push: vi.fn(),
    replace: vi.fn()
  }))
}));

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
});

afterEach(() => {
  sessionStorage.clear();
});

const testHousingProjectId = 'submission123';
const exampleContact = {
  contactId: 'contact123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890'
};

const wrapperSettings = (testHousingProjectIdProp = testHousingProjectId) => ({
  props: {
    housingProjectId: testHousingProjectIdProp
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
    const listRelatedEnquiriesSpy = vi.spyOn(enquiryService, 'listRelatedEnquiries');
    const listPermitsSpy = vi.spyOn(permitService, 'listPermits');
    const getPermitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');
    const getHousingProjectSpy = vi.spyOn(housingProjectService, 'getHousingProject');
    const searchContactSpy = vi.spyOn(contactService, 'searchContacts');
    const searchHousingProjectsSpy = vi.spyOn(housingProjectService, 'searchHousingProjects');

    listRelatedEnquiriesSpy.mockResolvedValue({
      data: 'notTested'
    } as AxiosResponse);

    listPermitsSpy.mockResolvedValue({
      data: 'notTested'
    } as AxiosResponse);

    getPermitTypesSpy.mockResolvedValue({
      data: 'notTested'
    } as AxiosResponse);

    getHousingProjectSpy.mockResolvedValue({
      data: 'notTested'
    } as AxiosResponse);

    searchContactSpy.mockResolvedValue({
      data: [exampleContact]
    } as AxiosResponse);

    searchHousingProjectsSpy.mockResolvedValue({
      data: [{ activityId: 'activity456' }]
    } as AxiosResponse);

    const wrapper = shallowMount(ProjectView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
