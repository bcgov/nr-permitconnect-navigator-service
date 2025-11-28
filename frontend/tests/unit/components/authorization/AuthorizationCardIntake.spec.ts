import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { shallowMount } from '@vue/test-utils';

import AuthorizationCardIntake from '@/components/authorization/AuthorizationCardIntake.vue';
import { permitService, sourceSystemKindService } from '@/services';
import { SYSTEM_ID } from '@/utils/constants/application';
import { StorageKey } from '@/utils/enums/application';

import type { AxiosResponse } from 'axios';
import type { SourceSystemKind } from '@/types';

const getPermitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');
const getSourceSystemKindsSpy = vi.spyOn(sourceSystemKindService, 'getSourceSystemKinds');

const sampleSourceSystemKind: SourceSystemKind = {
  description: 'ATS Project Number',
  kind: undefined,
  sourceSystem: 'ITSM-5314',
  sourceSystemKindId: 2,
  createdAt: '2025-06-18T15:56:00.515Z',
  createdBy: SYSTEM_ID
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
    sourceSystemKinds: [sampleSourceSystemKind]
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
