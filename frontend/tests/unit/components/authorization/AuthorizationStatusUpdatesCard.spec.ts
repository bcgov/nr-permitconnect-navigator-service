import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import AuthorizationStatusUpdatesCard from '@/components/authorization/AuthorizationStatusUpdatesCard.vue';
import i18n from '@/i18n';
import { StorageKey } from '@/utils/enums/application';
import { PRIMEVUE_STUBS, t } from '../../../helpers';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/store', () => ({
  useCodeStore: () => ({
    codeDefinition: {
      PiesOnHold: { MISSING_INFORMATION: 'Test Hold Definition' }
    },
    codeDisplay: {
      PiesOnHold: { MISSING_INFORMATION: 'Test Hold Reason' }
    },
    options: {
      PermitState: [{ label: 'In Progress', value: 'IN_PROGRESS' }],
      PermitStage: [{ label: 'Submission', value: 'SUBMISSION' }]
    }
  })
}));

const wrapperSettings = (props = {}) => ({
  props: {
    editable: true,
    ...props
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
      Panel: { template: '<div class="stub-panel"><slot name="header" /><slot /></div>' },
      Message: { template: '<div class="stub-message"><slot /></div>' },
      DatePicker: true,
      Select: true,
      TextArea: true,
      Tooltip: true
    }
  }
});

describe('AuthorizationStatusUpdatesCard.vue', () => {
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
      const wrapper = mount(AuthorizationStatusUpdatesCard, wrapperSettings());
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.html()).toContain(t('authorization.authorizationStatusUpdatesCard.statusUpdates'));
    });

    it('displays the on-hold warning message when onHoldCode is provided', () => {
      const wrapper = mount(AuthorizationStatusUpdatesCard, wrapperSettings({ onHoldCode: 'MISSING_INFORMATION' }));

      const message = wrapper.find('.stub-message');
      expect(message.exists()).toBe(true);

      const expectedReasonText = t('authorization.authorizationCard.onHoldReason', {
        reason: 'Test Hold Reason'
      });
      const expectedDefinitionText = t('authorization.authorizationCard.onHoldDefinition', {
        definition: 'Test Hold Definition'
      });

      expect(wrapper.html()).toContain(expectedReasonText);
      expect(wrapper.html()).toContain(expectedDefinitionText);
    });

    it('conditionally renders the target date description field', async () => {
      const wrapper = mount(AuthorizationStatusUpdatesCard, wrapperSettings({ showTargetDateDescription: false }));

      let targetDescField = wrapper.find('[name="targetDateDescription"]');
      expect(targetDescField.exists()).toBe(false);

      await wrapper.setProps({ showTargetDateDescription: true });

      targetDescField = wrapper.find('[name="targetDateDescription"]');
      expect(targetDescField.exists()).toBe(true);
    });
  });

  describe('Interactions & Emits', () => {
    it('emits "update:setVerifiedDate" when the "Update to Today" link is clicked', async () => {
      const wrapper = mount(AuthorizationStatusUpdatesCard, wrapperSettings());

      const updateLink = wrapper.find('a');
      await updateLink.trigger('click');

      expect(wrapper.emitted('update:setVerifiedDate')).toHaveLength(1);
    });
  });

  describe('Form Field Disabled States', () => {
    it('disables all fields when editable is false', () => {
      const wrapper = mount(
        AuthorizationStatusUpdatesCard,
        wrapperSettings({
          editable: false,
          showTargetDateDescription: true
        })
      );

      const allInputs = [
        wrapper.find('[name="statusLastVerified"]'),
        wrapper.find('[name="state"]'),
        wrapper.find('[name="stage"]'),
        wrapper.find('[name="needed"]'),
        wrapper.find('[name="submittedDate"]'),
        wrapper.find('[name="statusLastChanged"]'),
        wrapper.find('[name="decisionDate"]'),
        wrapper.find('[name="targetDate"]'),
        wrapper.find('[name="targetDateDescription"]'),
        wrapper.find('[name="permitNote"]')
      ];

      allInputs.forEach((input) => {
        expect(input.attributes('disabled')).toBe('true');
      });
    });

    it('disables specific fields when peachIntegratedAuthType is true', () => {
      const wrapper = mount(
        AuthorizationStatusUpdatesCard,
        wrapperSettings({
          editable: true,
          peachIntegratedAuthType: true,
          peachIntegratedTrackingId: false
        })
      );

      expect(wrapper.find('[name="state"]').attributes('disabled')).toBe('true');
      expect(wrapper.find('[name="stage"]').attributes('disabled')).toBe('true');
      expect(wrapper.find('[name="submittedDate"]').attributes('disabled')).toBe('true');
      expect(wrapper.find('[name="statusLastChanged"]').attributes('disabled')).toBe('true');
      expect(wrapper.find('[name="decisionDate"]').attributes('disabled')).toBe('true');
      expect(wrapper.find('[name="needed"]').attributes('disabled')).toBe('false');
    });

    it('disables the "needed" field only when both peach integrated props are true', () => {
      const wrapper = mount(
        AuthorizationStatusUpdatesCard,
        wrapperSettings({
          editable: true,
          peachIntegratedAuthType: true,
          peachIntegratedTrackingId: true
        })
      );

      expect(wrapper.find('[name="needed"]').attributes('disabled')).toBe('true');
    });
  });
});
