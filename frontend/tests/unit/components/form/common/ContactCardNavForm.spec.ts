import { shallowMount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';

import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

import type { DeepPartial } from '@/types';
import type { FormSchemaType as ElectrificationFormSchemaType } from '@/validators/electrification/projectFormNavigatorSchema';
import type { FormSchemaType as HousingFormSchemaType } from '@/validators/housing/projectFormNavigatorSchema';

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
        contactApplicantRelationship: ProjectRelationship.OWNER,
        contactPreference: ContactPreference.EMAIL
      }
    } as DeepPartial<ElectrificationFormSchemaType> | DeepPartial<HousingFormSchemaType>
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
