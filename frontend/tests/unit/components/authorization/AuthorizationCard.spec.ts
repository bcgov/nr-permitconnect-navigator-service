import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { mount } from '@vue/test-utils';

import AuthorizationCard from '@/components/authorization/AuthorizationCard.vue';
import { StorageKey } from '@/utils/enums/application';
import { PermitStage, PermitState } from '@/utils/enums/permit';

import type { Permit, PermitType } from '@/types';

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

const currentDate = new Date().toISOString();

const testPermitType: PermitType = {
  permitTypeId: 1,
  agency: 'Water, Land and Resource Stewardship',
  division: 'Forest Resiliency and Archaeology',
  branch: 'Archaeology',
  businessDomain: 'Archaeology',
  type: 'Alteration',
  family: undefined,
  name: 'Archaeology Alteration Permit',
  nameSubtype: undefined,
  acronym: 'SAP',
  trackedInATS: false,
  sourceSystem: 'Archaeology Permit Tracking System',
  sourceSystemAcronym: 'APTS'
};

const testPermit: Permit = {
  permitId: 'permitUUID',
  activityId: 'activityUUID',
  needed: 'yes',
  stage: PermitStage.APPLICATION_SUBMISSION,
  issuedPermitId: 'issued Permit ID',
  state: PermitState.IN_PROGRESS,
  submittedDate: currentDate,
  decisionDate: currentDate,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  permitType: testPermitType,
  permitTypeId: testPermitType.permitTypeId,
  permitNote: [],
  permitTracking: []
};

const wrapperSettings = (testPermitProp = testPermit) => ({
  props: {
    permit: testPermitProp
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
});

afterEach(() => {
  sessionStorage.clear();
});

describe('AuthorizationCard', () => {
  it('renders component', async () => {
    const wrapper = mount(AuthorizationCard, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
