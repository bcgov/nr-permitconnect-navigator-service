import { Select } from '@/components/form';
import AuthorizationStatusUpdatesCard from '@/components/authorization/AuthorizationStatusUpdatesCard.vue';
import { PRIMEVUE_STUBS, t } from '../../../helpers';

import { mountWithFormContext } from '../../../mountWithFormContext';
import { mockRouter, resetMockRouter } from '../../../mockRouter';

// Mocks

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
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

// Mount

function mountAuthorizationStatusUpdatesCard(props = {}) {
  const { wrapper } = mountWithFormContext(AuthorizationStatusUpdatesCard, {
    componentProps: {
      editable: true,
      validStageOptions: [],
      ...props
    },
    piniaState: {},
    stubs: {
      ...PRIMEVUE_STUBS,
      Panel: { template: '<div class="stub-panel"><slot name="header" /><slot /></div>' },
      Message: { template: '<div class="stub-message"><slot /></div>' },
      DatePicker: true,
      InputText: true,
      TextArea: true,
      Tooltip: true
    }
  });

  return { wrapper };
}

// Tests

describe('AuthorizationStatusUpdatesCard.vue', () => {
  beforeEach(() => {
    resetMockRouter();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('DOM Rendering & Layout', () => {
    it('renders component without errors', () => {
      const { wrapper } = mountAuthorizationStatusUpdatesCard({
        validStageOptions: [{ label: 'Submission', value: 'SUBMISSION' }]
      });
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.html()).toContain(t('authorization.authorizationStatusUpdatesCard.statusUpdates'));
    });

    it('displays the on-hold warning message when onHoldCode is provided', () => {
      const { wrapper } = mountAuthorizationStatusUpdatesCard({ onHoldCode: 'MISSING_INFORMATION' });

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
      const { wrapper } = mountAuthorizationStatusUpdatesCard({ showTargetDateDescription: false });
      const card = wrapper.findComponent(AuthorizationStatusUpdatesCard);

      const targetDescField = card.find('[name="targetDateDescription"]');
      expect(targetDescField.exists()).toBe(false);

      const { wrapper: visibleWrapper } = mountAuthorizationStatusUpdatesCard({ showTargetDateDescription: true });
      const visibleCard = visibleWrapper.findComponent(AuthorizationStatusUpdatesCard);

      expect(visibleCard.find('[name="targetDateDescription"]').exists()).toBe(true);
    });
  });

  describe('Interactions & Emits', () => {
    it('emits "update:setVerifiedDate" when the "Update to Today" link is clicked', async () => {
      const { wrapper } = mountAuthorizationStatusUpdatesCard();
      const card = wrapper.findComponent(AuthorizationStatusUpdatesCard);

      const updateLink = card.find('a');
      await updateLink.trigger('click');

      expect(card.emitted('update:setVerifiedDate')).toHaveLength(1);
    });
  });

  describe('Form Field Disabled States', () => {
    it('disables all fields when editable is false', () => {
      const { wrapper } = mountAuthorizationStatusUpdatesCard({
        editable: false,
        showTargetDateDescription: true
      });

      const allInputs = [
        wrapper.find('[name="statusLastVerified"]'),
        wrapper.find('[name="submittedDate"]'),
        wrapper.find('[name="statusLastChanged"]'),
        wrapper.find('[name="decisionDate"]'),
        wrapper.find('[name="targetDate"]'),
        wrapper.find('[name="technicalReviewer"]'),
        wrapper.find('[name="targetDateDescription"]'),
        wrapper.find('[name="permitNote"]')
      ];

      allInputs.forEach((input) => {
        expect(input.attributes('disabled')).toBe('true');
      });

      // Check Select components separately
      const selects = wrapper.findAllComponents(Select);
      const stateSelect = selects.find((s) => s.props('name') === 'state');
      const stageSelect = selects.find((s) => s.props('name') === 'stage');
      const neededSelect = selects.find((s) => s.props('name') === 'needed');

      expect(stateSelect?.props('disabled')).toBe(true);
      expect(stageSelect?.props('disabled')).toBe(true);
      expect(neededSelect?.props('disabled')).toBe(true);
    });

    it('disables specific fields when peachIntegratedAuthType is true', () => {
      const { wrapper } = mountAuthorizationStatusUpdatesCard({
        editable: true,
        peachIntegratedAuthType: true,
        peachIntegratedTrackingId: false
      });

      const selects = wrapper.findAllComponents(Select);
      const stateSelect = selects.find((s) => s.props('name') === 'state');
      const stageSelect = selects.find((s) => s.props('name') === 'stage');
      const neededSelect = selects.find((s) => s.props('name') === 'needed');

      expect(stateSelect?.props('disabled')).toBe(true);
      expect(stageSelect?.props('disabled')).toBe(true);
      expect(neededSelect?.props('disabled')).toBe(false);

      expect(wrapper.find('[name="submittedDate"]').attributes('disabled')).toBe('true');
      expect(wrapper.find('[name="statusLastChanged"]').attributes('disabled')).toBe('true');
      expect(wrapper.find('[name="decisionDate"]').attributes('disabled')).toBe('true');
    });

    it('disables the "needed" field only when both peach integrated props are true', () => {
      const { wrapper } = mountAuthorizationStatusUpdatesCard({
        editable: true,
        peachIntegratedAuthType: true,
        peachIntegratedTrackingId: true
      });

      const selects = wrapper.findAllComponents(Select);
      const neededSelect = selects.find((s) => s.props('name') === 'needed');

      expect(neededSelect?.props('disabled')).toBe(true);
    });
  });

  describe('mandatory fields', () => {
    describe('needed', () => {
      it('renders with correct name', () => {
        const { wrapper } = mountAuthorizationStatusUpdatesCard();

        const selects = wrapper.findAllComponents(Select);
        const neededSelect = selects.find(
          (select: { props: (arg0: string) => string }) => select.props('name') === 'needed'
        );

        expect(neededSelect).toBeTruthy();
        expect(neededSelect?.props('required')).toBe(true);
      });
    });

    it('displays asterisk', () => {
      const { wrapper } = mountAuthorizationStatusUpdatesCard();

      const labels = wrapper.findAll('label');
      const neededLabel = labels.find((label) => label.attributes('for') === 'needed');
      const asterisk = neededLabel?.findAll('span')?.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });
  });
});
