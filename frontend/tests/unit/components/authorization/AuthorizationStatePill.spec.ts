import AuthorizationStatePill from '@/components/authorization/AuthorizationStatePill.vue';
import { PermitState } from '@/utils/enums/codeEnums';

import { mountComponent } from '../../../mountComponent';

// Mount

function mountAuthorizationStatePill(
  options: {
    state?: string;
    enlarge?: boolean;
    displayText?: string;
    codeDisplay?: Record<string, string>;
  } = {}
) {
  const { state = PermitState.NONE, enlarge, displayText, codeDisplay = {} } = options;

  const { wrapper } = mountComponent(AuthorizationStatePill, {
    props: { state, enlarge, displayText },
    piniaState: {
      code: { codes: { PermitState: Object.entries(codeDisplay).map(([code, display]) => ({ code, display })) } }
    }
  });

  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('AuthorizationStatePill', () => {
  describe('rendering', () => {
    it('renders the displayText prop when given, over any code-table lookup', () => {
      const { wrapper } = mountAuthorizationStatePill({
        state: PermitState.ISSUED,
        displayText: 'Custom Label',
        codeDisplay: { [PermitState.ISSUED]: 'Issued' }
      });

      expect(wrapper.text()).toContain('Custom Label');
    });

    it('falls back to the code table display value when displayText is not given', () => {
      const { wrapper } = mountAuthorizationStatePill({
        state: PermitState.ISSUED,
        codeDisplay: { [PermitState.ISSUED]: 'Issued' }
      });

      expect(wrapper.text()).toContain('Issued');
    });

    it('falls back to the raw state when neither displayText nor a code table entry exists', () => {
      const { wrapper } = mountAuthorizationStatePill({ state: PermitState.ISSUED });

      expect(wrapper.text()).toContain(PermitState.ISSUED);
    });

    it('applies the badge class for the given state', () => {
      const { wrapper } = mountAuthorizationStatePill({ state: PermitState.DENIED });

      expect(wrapper.find('.auth-indicator').classes()).toContain('red');
    });

    it('renders an icon for states with an icon configured', () => {
      const { wrapper } = mountAuthorizationStatePill({ state: PermitState.ISSUED });

      expect(wrapper.find('font-awesome-icon-stub').exists()).toBe(true);
    });

    it('renders no icon for states with no icon configured', () => {
      const { wrapper } = mountAuthorizationStatePill({ state: PermitState.ACCEPTED });

      expect(wrapper.find('font-awesome-icon-stub').exists()).toBe(false);
    });

    it('uses larger dimensions when enlarge is true', () => {
      const { wrapper } = mountAuthorizationStatePill({ enlarge: true });

      expect(wrapper.find('.auth-indicator').attributes('style')).toContain('--font-size: 1rem');
    });

    it('uses the default (smaller) dimensions when enlarge is false', () => {
      const { wrapper } = mountAuthorizationStatePill({ enlarge: false });

      expect(wrapper.find('.auth-indicator').attributes('style')).toContain('--font-size: 0.75rem');
    });
  });
});
