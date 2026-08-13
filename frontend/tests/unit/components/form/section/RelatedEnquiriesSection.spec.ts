import { nextTick } from 'vue';

import { InputText } from '@/components/form';
import RelatedEnquiriesSection from '@/components/form/section/RelatedEnquiriesSection.vue';
import { useFormStore } from '@/store';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountRelatedEnquiriesSection(options: { tab?: number } = {}) {
  const { tab } = options;

  const { wrapper, pinia, form } = mountWithFormContext(RelatedEnquiriesSection, {
    // useFormErrorWatcher calls useFormStore() internally even though this
    // component has no store dependency of its own -- piniaState must be
    // set (even empty) to make mountWithFormContext install a Pinia plugin.
    piniaState: {},
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('RelatedEnquiriesSection', () => {
  describe('rendering', () => {
    it('renders a disabled InputText bound to relatedEnquiries.csv', () => {
      const { wrapper } = mountRelatedEnquiriesSection();

      const input = wrapper.findComponent(InputText);
      expect(input.props('name')).toBe('relatedEnquiries.csv');
      expect(input.props('disabled')).toBe(true);
    });

    it('renders a non-empty translated header', () => {
      const { wrapper } = mountRelatedEnquiriesSection();

      expect(wrapper.find('h4').text().trim().length).toBeGreaterThan(0);
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountRelatedEnquiriesSection({ tab: 4 });

      form.setErrors({ 'relatedEnquiries.csv': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('RelatedEnquiriesSection', 4, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountRelatedEnquiriesSection();

      form.setErrors({ 'relatedEnquiries.csv': 'Required' });
      await nextTick();

      form.setErrors({ 'relatedEnquiries.csv': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('RelatedEnquiriesSection', 0, false);
    });
  });
});
