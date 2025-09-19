import { shallowMount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';

import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: vi.fn() }) }));

const wrapperSettingsCard = () => ({
  props: {
    editable: true,
    formValues: {
      contact: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '(123) 456-7890',
        email: 'john.doe@example.com',
        contactApplicantRelationship: 'OWNER',
        contactPreference: 'EMAIL'
      }
    }
  },
  global: {
    plugins: [PrimeVue]
  }
});

describe('ContactCardNavForm.vue', () => {
  it('renders without error', () => {
    const wrapper = shallowMount(ContactCardNavForm, wrapperSettingsCard());
    expect(wrapper.exists()).toBe(true);
  });
});
