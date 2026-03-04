import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import ContactCardIntakeForm from '@/components/form/common/ContactCardIntakeForm.vue';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const wrapperSettings = () => ({
  props: {
    initialFormValues: {
      contactId: '123',
      firstName: 'Test',
      lastName: 'Test',
      phoneNumber: 'Test',
      email: 'Test',
      contactApplicantRelationship: ProjectRelationship.OWNER,
      contactPreference: ContactPreference.EITHER
    }
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: {}
      }),
      i18n,
      PrimeVue
    ],
    stubs: ['font-awesome-icon']
  }
});

describe('ContactCardIntakeForm.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(ContactCardIntakeForm, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
