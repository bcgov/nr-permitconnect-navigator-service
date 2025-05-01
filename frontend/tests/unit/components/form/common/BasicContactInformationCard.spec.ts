import { shallowMount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';

import BasicContactInformationCard from '@/components/form/common/BasicContactInformationCard.vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: vi.fn() }) }));

const wrapperSettingsCard = () => ({
  props: {
    editable: true,
    initialFormValues: {
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

describe('BasicContactInformationCard.vue', () => {
  it('renders without error', () => {
    const wrapper = shallowMount(BasicContactInformationCard, wrapperSettingsCard());
    expect(wrapper.exists()).toBe(true);
  });
});
