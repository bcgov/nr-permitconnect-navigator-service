import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { mount } from '@vue/test-utils';

import AuthorizationCard from '@/components/authorization/AuthorizationCard.vue';
import i18n from '@/i18n';
import { StorageKey } from '@/utils/enums/application';
import { PermitStage, PermitState, PiesOnHold } from '@/utils/enums/codeEnums';
import { PRIMEVUE_STUBS, t } from '../../../helpers';

import type { Permit, PermitType } from '@/types';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/primevue')>();
  return {
    ...actual,
    useToast: () => ({
      info: vi.fn(),
      error: vi.fn(),
      success: vi.fn()
    })
  };
});

vi.mock('@/store', () => ({
  useCodeStore: () => ({
    codeDefinition: {
      PiesOnHold: { MISSING_INFORMATION: 'Test Hold Definition' }
    },
    codeDisplay: {
      PiesOnHold: { MISSING_INFORMATION: 'Test Hold Reason' },
      PermitStage: { APPLICATION_SUBMISSION: 'Application Submission Display' }
    }
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
      i18n,
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: {
      ...PRIMEVUE_STUBS,
      'font-awesome-icon': { template: '<i />' },
      AuthorizationStatePill: true,
      StatusPill: true
    },
    directives: {
      Tooltip: Tooltip
    }
  }
});

describe('AuthorizationCard.vue', () => {
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

  describe('DOM Rendering & Layout', () => {
    it('renders component without errors', () => {
      const wrapper = mount(AuthorizationCard, wrapperSettings());
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.html()).toContain('Archaeology Alteration Permit');
    });

    it('displays the on-hold warning message when onHoldCode is provided', () => {
      const onHoldPermit = { ...testPermit, onHoldCode: PiesOnHold.MISSING_INFORMATION };
      const wrapper = mount(AuthorizationCard, wrapperSettings(onHoldPermit));

      const expectedReasonText = t('authorization.authorizationCard.onHoldReason', {
        reason: 'Test Hold Reason'
      });
      const expectedDefinitionText = t('authorization.authorizationCard.onHoldDefinition', {
        definition: 'Test Hold Definition'
      });

      expect(wrapper.html()).toContain(expectedReasonText);
      expect(wrapper.html()).toContain(expectedDefinitionText);
    });

    it('renders AuthorizationStatePill and StatusPill correctly', () => {
      const wrapper = mount(AuthorizationCard, wrapperSettings());

      const statePill = wrapper.findComponent({ name: 'AuthorizationStatePill' });
      expect(statePill.exists()).toBe(true);
      expect(statePill.props('state')).toBe(PermitState.IN_PROGRESS);

      const statusPill = wrapper.findComponent({ name: 'StatusPill' });
      expect(statusPill.exists()).toBe(true);
      expect(statusPill.props('status')).toBe('Application Submission Display');
    });

    it('renders dates and permit notes properly when provided', () => {
      const permitWithDatesAndNote = {
        ...testPermit,
        statusLastVerified: '2024-01-01T00:00:00Z',
        statusLastChanged: '2024-01-02T00:00:00Z',
        targetDate: '2024-12-31T00:00:00Z',
        permitNote: [
          {
            permitNoteId: '1',
            permitId: 'permitUUID',
            note: 'Crucial permit review note.',
            createdAt: '2024-05-01T00:00:00Z'
          }
        ]
      };
      const wrapper = mount(AuthorizationCard, wrapperSettings(permitWithDatesAndNote));

      const html = wrapper.html();
      expect(html).toContain(t('authorization.authorizationCard.statusVerified'));
      expect(html).toContain(t('authorization.common.statusChangeDate'));
      expect(html).toContain(t('authorization.common.targetDate'));
      expect(html).toContain('Crucial permit review note.');
    });
  });

  describe('Interactions & Emits', () => {
    it('emits "authorizationCard:more" when the title block is clicked', async () => {
      const wrapper = mount(AuthorizationCard, wrapperSettings());

      const titleContainer = wrapper.find('h4').element.parentElement;
      titleContainer?.dispatchEvent(new Event('click'));

      expect(wrapper.emitted('authorizationCard:more')).toHaveLength(1);
    });

    it('emits "authorizationCard:more" when the "More" button is clicked', async () => {
      const wrapper = mount(AuthorizationCard, wrapperSettings());

      const moreBtn = wrapper
        .findAllComponents({ name: 'Button' })
        .find((b) => b.attributes('label') === t('authorization.authorizationCard.more'));

      await moreBtn?.trigger('click');

      expect(wrapper.emitted('authorizationCard:more')).toBeTruthy();
    });
  });
});
