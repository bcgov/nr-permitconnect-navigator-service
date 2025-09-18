import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import SubmissionBringForwardCalendar from '@/components/housing/submission/SubmissionBringForwardCalendar.vue';
import { userService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import type { AxiosResponse } from 'axios';
import type { BringForward } from '@/types';

const useUserService = vi.spyOn(userService, 'searchUsers');

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const currentDate = new Date().toISOString();

const bringForward: Array<BringForward> = [
  {
    noteId: '327eda7d-3d4c-42e9-aa94-3de04cd23d55',
    housingProjectId: '123',
    title: 'test title',
    projectName: 'test project name',
    bringForwardDate: currentDate,
    createdByFullName: 'test full name',
    activityId: '3223F09C',
    escalateToSupervisor: false,
    escalateToDirector: false
  }
];

const myAssignedTo: Set<string> = new Set([]);

const wrapperSettings = () => ({
  props: {
    bringForward: bringForward,
    myAssignedTo: myAssignedTo
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

  useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('SubmissionBringForwardCalendar', () => {
  it('renders component', async () => {
    const wrapper = mount(SubmissionBringForwardCalendar, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
