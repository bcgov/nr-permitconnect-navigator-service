import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { StorageKey } from '@/utils/enums/application';
import { shallowMount } from '@vue/test-utils';

import {
  activityContactService,
  contactService,
  enquiryService,
  permitService,
  electrificationProjectService
} from '@/services';
import ProjectView from '@/views/external/electrification/project/ProjectView.vue';

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

const testElectrificationProjectId = 'project123';
const exampleContact = {
  contactId: 'contact123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890'
};

const wrapperSettings = (projectId = testElectrificationProjectId) => ({
  props: {
    projectId: projectId
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
    const listActivityContactsSpy = vi.spyOn(activityContactService, 'listActivityContacts');
    const listRelatedEnquiriesSpy = vi.spyOn(enquiryService, 'listRelatedEnquiries');
    const listPermitsSpy = vi.spyOn(permitService, 'listPermits');
    const getPermitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');
    const getProjectSpy = vi.spyOn(electrificationProjectService, 'getProject');
    const searchContactSpy = vi.spyOn(contactService, 'searchContacts');
    const searchProjectsSpy = vi.spyOn(electrificationProjectService, 'searchProjects');

    listActivityContactsSpy.mockResolvedValue({
      data: []
    } as AxiosResponse);

    listRelatedEnquiriesSpy.mockResolvedValue({
      data: 'notTested'
    } as AxiosResponse);

    listPermitsSpy.mockResolvedValue({
      data: 'notTested'
    } as AxiosResponse);

    getPermitTypesSpy.mockResolvedValue({
      data: 'notTested'
    } as AxiosResponse);

    getProjectSpy.mockResolvedValue({
      data: 'notTested'
    } as AxiosResponse);

    searchContactSpy.mockResolvedValue({
      data: [exampleContact]
    } as AxiosResponse);

    searchProjectsSpy.mockResolvedValue({
      data: [{ activityId: 'activity456' }]
    } as AxiosResponse);

    const wrapper = shallowMount(ProjectView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
