import { mount } from '@vue/test-utils';

import StatusPill from '@/components/common/StatusPill.vue';

// Mount

function mountStatusPill(options: { props?: Record<string, unknown> } = {}) {
  const wrapper = mount(StatusPill, { props: options.props, global: { stubs: { 'font-awesome-icon': true } } });

  return { wrapper };
}

// Tests

describe('StatusPill', () => {
  describe('rendering', () => {
    it('renders the status text', () => {
      const { wrapper } = mountStatusPill({ props: { status: 'Approved' } });

      expect(wrapper.text()).toContain('Approved');
    });

    it('sets the aria-label to the status', () => {
      const { wrapper } = mountStatusPill({ props: { status: 'Approved' } });

      expect(wrapper.find('.status-indicator').attributes('aria-label')).toBe('Approved');
    });

    it('does not render an icon when none is given', () => {
      const { wrapper } = mountStatusPill();

      expect(wrapper.find('font-awesome-icon-stub').exists()).toBe(false);
    });

    it('renders an icon when given', () => {
      const { wrapper } = mountStatusPill({ props: { icon: 'fa-solid fa-check' } });

      expect(wrapper.find('font-awesome-icon-stub').exists()).toBe(true);
    });

    it('applies the given background and border colors', () => {
      const { wrapper } = mountStatusPill({ props: { bgColor: 'red', borderColor: 'blue' } });

      const style = wrapper.find('.status-indicator').attributes('style');
      expect(style).toContain('background-color: red');
      expect(style).toContain('border-color: blue');
    });

    it('omits the border width when no borderColor is given', () => {
      const { wrapper } = mountStatusPill();

      expect(wrapper.find('.status-indicator').attributes('style')).toContain('border-width: 0');
    });

    it('uses larger dimensions when enlarge is true', () => {
      const { wrapper } = mountStatusPill({ props: { enlarge: true } });

      expect(wrapper.find('.status-indicator').attributes('style')).toContain('--font-size: 1rem');
    });

    it('uses the default (smaller) dimensions when enlarge is false', () => {
      const { wrapper } = mountStatusPill({ props: { enlarge: false } });

      expect(wrapper.find('.status-indicator').attributes('style')).toContain('--font-size: 0.75rem');
    });
  });
});
