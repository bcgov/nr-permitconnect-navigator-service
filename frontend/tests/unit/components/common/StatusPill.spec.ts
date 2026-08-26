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

    it('sets the aria-label to the status on the container div', () => {
      const { wrapper } = mountStatusPill({ props: { status: 'Approved' } });

      const allDivs = wrapper.findAll('div');
      const innerDiv = allDivs[1]; // Second div is the inner container
      expect(innerDiv.attributes('aria-label')).toBe('Approved');
    });

    it('does not render an icon when none is given', () => {
      const { wrapper } = mountStatusPill();

      expect(wrapper.find('font-awesome-icon-stub').exists()).toBe(false);
    });

    it('renders an icon when given', () => {
      const { wrapper } = mountStatusPill({ props: { icon: 'fa-solid fa-check' } });

      expect(wrapper.find('font-awesome-icon-stub').exists()).toBe(true);
    });

    it('applies the given background and border colors via inline styles', () => {
      const { wrapper } = mountStatusPill({ props: { bgColor: 'red', borderColor: 'blue' } });

      const allDivs = wrapper.findAll('div');
      const innerDiv = allDivs[1];
      const style = innerDiv.attributes('style');
      expect(style).toContain('background-color: red');
      expect(style).toContain('border-color: blue');
    });

    it('omits the border width when no borderColor is given', () => {
      const { wrapper } = mountStatusPill();

      const allDivs = wrapper.findAll('div');
      const innerDiv = allDivs[1];
      expect(innerDiv.attributes('style')).toContain('border-width: 0');
    });

    it('applies border width when borderColor is provided', () => {
      const { wrapper } = mountStatusPill({ props: { borderColor: 'blue' } });

      const allDivs = wrapper.findAll('div');
      const innerDiv = allDivs[1];
      expect(innerDiv.attributes('style')).toContain('border-width: 0.1rem');
    });

    it('uses larger dimensions when enlarge is true', () => {
      const { wrapper } = mountStatusPill({ props: { enlarge: true } });

      const allDivs = wrapper.findAll('div');
      const innerDiv = allDivs[1];
      expect(innerDiv.attributes('style')).toContain('--font-size: 1rem');
      expect(innerDiv.attributes('style')).toContain('--height: 2rem');
    });

    it('uses the default (smaller) dimensions when enlarge is false', () => {
      const { wrapper } = mountStatusPill({ props: { enlarge: false } });

      const allDivs = wrapper.findAll('div');
      const innerDiv = allDivs[1];
      expect(innerDiv.attributes('style')).toContain('--font-size: 0.75rem');
      expect(innerDiv.attributes('style')).toContain('--height: 1.5rem');
    });

    it('applies the content color to the status text and icon', () => {
      const { wrapper } = mountStatusPill({ props: { status: 'Test', icon: 'fa-check', contentColor: 'purple' } });

      const span = wrapper.find('span');
      expect(span.attributes('style')).toContain('color: purple');
    });
  });
});
