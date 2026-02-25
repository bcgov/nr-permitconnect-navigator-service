import PrimeVue from 'primevue/config';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import i18n from '@/i18n';
import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import ContactForm from '@/components/contact/ContactForm.vue';
import { contactService } from '@/services';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';
import { t } from '../../../helpers';

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { Contact } from '@/types';

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('@/lib/primevue/useToast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError
  })
}));

const updateContactSpy = vi.spyOn(contactService, 'updateContact');

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

const wrapperSettingsForm = (isEditable = false) => ({
  props: { contact: testContact, editable: isEditable },
  global: {
    plugins: [createTestingPinia(), PrimeVue, i18n],
    stubs: {
      FormNavigationGuard: true,
      InputText: true,
      InputMask: true,
      Select: true,
      ErrorMessage: true
    }
  }
});

describe('ContactForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form inputs with localized labels', async () => {
    const wrapper = mount(ContactForm, wrapperSettingsForm());
    await nextTick();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('[name="firstName"]').attributes('label')).toBe(t('contactForm.firstName'));
    expect(wrapper.find('[name="lastName"]').attributes('label')).toBe(t('contactForm.lastName'));
    expect(wrapper.find('[name="email"]').attributes('label')).toBe(t('contactForm.email'));
    expect(wrapper.find('[name="phoneNumber"]').attributes('label')).toBe(t('contactForm.phone'));
    expect(wrapper.find('[name="contactApplicantRelationship"]').attributes('label')).toBe(
      t('contactForm.relationshipToProject')
    );
    expect(wrapper.find('[name="contactPreference"]').attributes('label')).toBe(t('contactForm.preferredContact'));
  });

  it('renders localized action buttons when editable is true', async () => {
    const wrapper = mount(ContactForm, wrapperSettingsForm(true));
    await nextTick();

    const saveButton = wrapper.findComponent({ name: 'Button' });
    expect(saveButton.exists()).toBe(true);
    expect(saveButton.text()).toBe(t('contactForm.save'));
  });

  describe('onSubmit', () => {
    it('handles successful form submission', async () => {
      const successResponse: AxiosResponse<Contact> = {
        data: testContact,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      };

      updateContactSpy.mockResolvedValueOnce(successResponse);

      const wrapper = mount(ContactForm, wrapperSettingsForm(true));
      const vm: any = wrapper.vm; // eslint-disable-line @typescript-eslint/no-explicit-any

      vm.formRef = { resetForm: vi.fn(), values: {} };
      await vm.onSubmit(testContact);

      expect(updateContactSpy).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith(t('contactForm.formSaved'));
      expect(wrapper.emitted('updateContact')?.[0]).toEqual([testContact]);
    });

    it('handles API failure response (status !== 200)', async () => {
      const errorResponse: AxiosResponse<Contact> = {
        data: testContact,
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      };

      updateContactSpy.mockResolvedValueOnce(errorResponse);

      const wrapper = mount(ContactForm, wrapperSettingsForm(true));
      const vm: any = wrapper.vm; // eslint-disable-line @typescript-eslint/no-explicit-any

      await vm.onSubmit(testContact);

      expect(updateContactSpy).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith(t('contactForm.failedToSaveTheForm'));
    });

    it('handles caught exceptions during submission', async () => {
      updateContactSpy.mockRejectedValueOnce(new Error('Network Failure'));

      const wrapper = mount(ContactForm, wrapperSettingsForm(true));
      const vm: any = wrapper.vm; // eslint-disable-line @typescript-eslint/no-explicit-any

      await vm.onSubmit(testContact);

      expect(updateContactSpy).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith(t('contactForm.failedToSaveTheForm'), 'Error: Network Failure');
    });
  });
});
