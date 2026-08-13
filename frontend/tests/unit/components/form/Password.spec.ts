import Password from '@/components/form/Password.vue';

import { mountComponent } from '../../../mountComponent';

// Mount

// Neither `findComponent(PvPassword)` (the imported component reference)
// nor the singular `findComponent({ name: 'Password' })` reliably resolves
// to the real nested PrimeVue component here -- both match our own
// Password.vue wrapper instead, since its inferred SFC name (from the
// filename) is also 'Password'. `findAllComponents({ name: 'Password' })`
// does not have this problem and returns exactly the one real match.
function findPvPassword(wrapper: ReturnType<typeof mountPassword>['wrapper']) {
  return wrapper.findAllComponents({ name: 'Password' })[0]!;
}

function mountPassword(options: { props?: Record<string, unknown> } = {}) {
  const { wrapper } = mountComponent(Password, { props: { name: 'account.password', ...options.props } });

  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('Password', () => {
  describe('rendering', () => {
    it('renders a PrimeVue Password bound to the given name', () => {
      const { wrapper } = mountPassword();

      const pvPassword = findPvPassword(wrapper);
      expect(pvPassword.exists()).toBe(true);
      expect(pvPassword.props('name')).toBe('account.password');
    });

    it('disables the feedback panel and enables the mask toggle', () => {
      const { wrapper } = mountPassword();

      const pvPassword = findPvPassword(wrapper);
      expect(pvPassword.props('feedback')).toBe(false);
      expect(pvPassword.props('toggleMask')).toBe(true);
    });

    it('passes placeholder through as a prop', () => {
      const { wrapper } = mountPassword({ props: { placeholder: 'Enter password' } });

      expect(findPvPassword(wrapper).props('placeholder')).toBe('Enter password');
    });

    // PrimeVue's Password has no `type` prop of its own -- `type` falls
    // through as a plain HTML attribute onto the underlying input.
    it('passes type through as a fallthrough attribute on the input', () => {
      const { wrapper } = mountPassword({ props: { type: 'password' } });

      expect(wrapper.find('input').attributes('type')).toBe('password');
    });

    it('renders the label text and applies the bold class by default', () => {
      const { wrapper } = mountPassword({ props: { label: 'Password' } });

      const label = wrapper.find('label');
      expect(label.text()).toBe('Password');
      expect(label.classes()).toContain('font-bold');
    });

    it('omits the bold class when bold is false', () => {
      const { wrapper } = mountPassword({ props: { label: 'Password', bold: false } });

      expect(wrapper.find('label').classes()).not.toContain('font-bold');
    });

    it('renders the help text', () => {
      const { wrapper } = mountPassword({ props: { helptext: 'Must be at least 8 characters' } });

      expect(wrapper.find('#account\\.password-help').text()).toBe('Must be at least 8 characters');
    });
  });
});
