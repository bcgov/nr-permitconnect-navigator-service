import PrimeVue from 'primevue/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { createTestingPinia } from '@pinia/testing';
import { shallowMount } from '@vue/test-utils';

import ContactForm from '@/components/contact/ContactForm.vue';
import { useContactStore } from '@/store';
import { StorageKey } from '@/utils/enums/application';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';
import ContactProfileView from '@/views/contact/ContactView.vue';
import { PRIMEVUE_STUBS, t } from '../../../helpers';

import type { MockInstance } from 'vitest';
import type { Contact } from '@/types';

const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack
  })
}));

const testContact: Contact = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: ContactPreference.EITHER,
  contactApplicantRelationship: ProjectRelationship.CONSULTANT
};

describe('ContactProfileView.vue', () => {
  let mockStorageGet: MockInstance;
  let mockStorageRemove: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageGet = vi.spyOn(globalThis.sessionStorage, 'getItem').mockReturnValue(null);
    mockStorageRemove = vi.spyOn(globalThis.sessionStorage, 'removeItem');
  });

  afterEach(() => {
    mockStorageGet.mockRestore();
    mockStorageRemove.mockRestore();
  });

  const createWrapper = (customContact: Contact = testContact) => {
    return shallowMount(ContactProfileView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              contact: {
                contact: customContact
              }
            },
            stubActions: false
          }),
          PrimeVue,
          i18n
        ],
        stubs: {
          'font-awesome-icon': true,
          ...PRIMEVUE_STUBS,
          ContactForm: {
            template: '<div><slot name="cancel" /></div>'
          }
        }
      }
    });
  };

  it('renders correctly and displays localized headers', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBeTruthy();

    expect(wrapper.find('h2').text()).toBe(t('contactProfileView.fillOutProfile'));
    expect(wrapper.find('h3').text()).toBe(t('contactProfileView.contactProfile'));
  });

  it('enters edit mode on mount if contact details are missing', () => {
    const incompleteContact = {
      ...testContact,
      phoneNumber: undefined,
      contactApplicantRelationship: undefined,
      contactPreference: undefined
    };

    const wrapper = createWrapper(incompleteContact);

    expect(wrapper.find('.p-button-text').exists()).toBe(false);
  });

  it('enters edit mode when the localized edit button is clicked', async () => {
    const wrapper = createWrapper();
    const editButton = wrapper.find('.p-button-text');

    expect(editButton.exists()).toBe(true);
    expect(editButton.text()).toContain(t('contactForm.edit'));

    await editButton.trigger('click');

    expect(wrapper.find('.p-button-text').exists()).toBe(false);
  });

  it('exits edit mode when the localized cancel button is clicked', async () => {
    const wrapper = createWrapper();

    await wrapper.find('.p-button-text').trigger('click');
    expect(wrapper.find('.p-button-text').exists()).toBe(false);

    const cancelButton = wrapper.find('.p-button-danger');
    expect(cancelButton.attributes('label')).toBe(t('cancelButton.btnText'));
    await cancelButton.trigger('click');

    expect(wrapper.find('.p-button-text').exists()).toBe(true);
  });

  describe('updateContact', () => {
    it('saves contact, disables editing, and routes back if no redirect exists', async () => {
      mockStorageGet.mockReturnValue(null);
      const wrapper = createWrapper();
      const store = useContactStore();
      const setContactSpy = vi.spyOn(store, 'setContact');

      await wrapper.find('.p-button-text').trigger('click');

      const contactForm = wrapper.findComponent(ContactForm);
      await contactForm.vm.$emit('update-contact', testContact);

      expect(setContactSpy).toHaveBeenCalledWith(testContact);
      expect(wrapper.find('.p-button-text').exists()).toBe(true);
      expect(mockBack).toHaveBeenCalled();
    });

    it('saves contact and disables editing but does NOT route back if redirect exists', async () => {
      mockStorageGet.mockReturnValue('/some-redirect');
      const wrapper = createWrapper();

      const contactForm = wrapper.findComponent(ContactForm);
      await contactForm.vm.$emit('update-contact', testContact);

      expect(mockBack).not.toHaveBeenCalled();
    });
  });

  describe('handleGetStarted', () => {
    it('removes storage key and redirects to stored value when Get Started is clicked', async () => {
      mockStorageGet.mockReturnValue('/custom-redirect');
      const wrapper = createWrapper();

      const getStartedButton = wrapper.find('.mr-2');
      expect(getStartedButton.attributes('label')).toBe(t('contactProfileView.getStarted'));
      await getStartedButton.trigger('click');

      expect(mockStorageRemove).toHaveBeenCalledWith(StorageKey.CONTACT_REDIRECT);
      expect(mockReplace).toHaveBeenCalledWith('/custom-redirect');
    });

    it('removes storage key and redirects to root (/) if no stored value exists', async () => {
      mockStorageGet.mockReturnValue(null);
      const wrapper = createWrapper();
      const vm: any = wrapper.vm; // eslint-disable-line @typescript-eslint/no-explicit-any
      vm.handleGetStarted();

      expect(mockStorageRemove).toHaveBeenCalledWith(StorageKey.CONTACT_REDIRECT);
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });
});
