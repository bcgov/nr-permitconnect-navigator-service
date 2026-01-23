import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';

import UpdateContactModal from '@/components/contact/UpdateContactModal.vue';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: vi.fn() })
}));

const testContact = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'Jane',
  lastName: 'Doe',
  phoneNumber: '(250) 555-0000',
  email: 'jane.doe@example.com',
  contactPreference: ContactPreference.EITHER,
  contactApplicantRelationship: ProjectRelationship.CONSULTANT
};

const wrapperSettings = () => ({
  props: {
    visible: true,
    contact: testContact
  },
  global: {
    plugins: [() => createTestingPinia({ initialState: { auth: { user: {} } } }), PrimeVue],
    stubs: ['ContactForm']
  }
});

describe('UpdateContactModal.vue', () => {
  it('renders the component with the provided props', () => {
    const wrapper = mount(UpdateContactModal, wrapperSettings());
    expect(wrapper.exists()).toBe(true);
  });
});
