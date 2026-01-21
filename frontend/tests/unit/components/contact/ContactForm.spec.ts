import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

import ContactForm from '@/components/contact/ContactForm.vue';
import { contactService } from '@/services';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

import type { Contact } from '@/types';
import type { AxiosResponse } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: vi.fn() })
}));

const updateContactSpy = vi.spyOn(contactService, 'updateContact').mockResolvedValue({ status: 200 } as AxiosResponse);

const testContact: Contact = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'Jane',
  lastName: 'Doe',
  phoneNumber: '(250) 555-0000',
  email: 'jane.doe@example.com',
  contactPreference: ContactPreference.EMAIL,
  contactApplicantRelationship: ProjectRelationship.OWNER,
  activityContact: []
};

const wrapperSettingsForm = () => ({
  props: { contact: testContact },
  global: {
    plugins: [() => createTestingPinia({ initialState: { auth: { user: {} } } }), PrimeVue, ToastService],
    stubs: ['FormNavigationGuard', 'InputText', 'InputMask', 'Select']
  }
});

describe('ContactForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with provided props', async () => {
    const wrapper = mount(ContactForm, wrapperSettingsForm());
    await nextTick();

    expect(wrapper.exists()).toBe(true); // basic smoke test
    expect(updateContactSpy).not.toHaveBeenCalled(); // nothing called on mount
  });
});
