import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import PermitCard from '@/components/permit/PermitCard.vue';
import { userService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

import type { AxiosResponse } from 'axios';
import type { Permit, PermitType } from '@/types';

const useUserService = vi.spyOn(userService, 'searchUsers');

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
  permitTypeId: 123,
  activityId: 'activityUUID',
  needed: 'yes',
  status: 'status',
  issuedPermitId: 'issued Permit ID',
  trackingId: 'test tracking ID',
  authStatus: 'test auth status',
  submittedDate: currentDate,
  adjudicationDate: currentDate,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  permitType: testPermitType
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

  useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('PermitCard', () => {
  it('renders component', async () => {
    const wrapper = mount(PermitCard, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
