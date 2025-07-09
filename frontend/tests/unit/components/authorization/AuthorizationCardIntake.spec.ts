import { createTestingPinia } from '@pinia/testing';
import { shallowMount } from '@vue/test-utils';

import AuthorizationCardIntake from '@/components/authorization/AuthorizationCardIntake.vue';
import { permitService, sourceSystemKindService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

import type { AxiosResponse } from 'axios';

const getPermitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');
const getSourceSystemKindsSpy = vi.spyOn(sourceSystemKindService, 'getSourceSystemKinds');

const sampleSourceSystemKind = {
  description: 'ATS Project Number',
  kind: null,
  sourceSystemCode: 'ITSM-5314',
  sourceSystemKindId: 2,
  createdAt: '2025-06-18T15:56:00.515Z',
  createdBy: '00000000-0000-0000-0000-000000000000',
  updatedAt: null,
  updatedBy: null
};
const permitTypesList = [
  {
    permitTypeId: 123,
    agency: 'SOME_AGENCY',
    division: 'SOME_DIVISION',
    branch: 'SOME_BRANCH',
    businessDomain: 'DOMAIN',
    type: 'ABC',
    family: null,
    name: 'PERMIT1',
    nameSubtype: null,
    acronym: 'PRT1',
    trackedInATS: true,
    sourceSystemCode: 'CODE'
  }
];

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

const wrapperSettings = () => ({
  props: {
    activityId: 'activityUUID',
    projectId: 'projectUUID'
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
    stubs: ['font-awesome-icon'],
    directives: {
      Tooltip: Tooltip
    }
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

  getSourceSystemKindsSpy.mockResolvedValue({ data: [sampleSourceSystemKind] } as AxiosResponse);
  getPermitTypesSpy.mockResolvedValue({ data: permitTypesList } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('AuthorizationCardIntake', () => {
  it('renders component', async () => {
    const wrapper = shallowMount(AuthorizationCardIntake, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
