import { InputMask, InputText, Select } from '@/components/form';
import ContactCardIntakeForm from '@/components/form/common/ContactCardIntakeForm.vue';
import { useFormStore } from '@/store';

import { mountWithFormContext } from '../../../../mountWithFormContext';
import { FormType, FormState } from '@/utils/enums/projectCommon';

// Mount

function mountContactCardIntakeForm(options: { formType?: FormType; formState?: FormState; tab?: number } = {}) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ContactCardIntakeForm, {
    piniaState: { form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('ContactCardIntakeForm', () => {
  describe('renders', () => {
    it('renders a non-empty translated header', () => {
      const { wrapper } = mountContactCardIntakeForm();

      expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
    });
    describe('mandatory fields', () => {
      describe('firstName', () => {
        it('renders', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const inputTexts = wrapper.findAllComponents(InputText);
          const firstNameInput = inputTexts.find((input) => input.props('name') === 'contacts.firstName');

          expect(firstNameInput).toBeTruthy();
        });
        it('displays asterisk', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const labels = wrapper.findAll('label');
          const firstNameLabel = labels.find((label) => label.attributes('for') === 'contacts.firstName');
          const asterisk = firstNameLabel?.find('span.text-\\[var\\(--p-support-required-text\\)\\]');

          expect(asterisk).toBeTruthy();
          expect(asterisk?.text()).toBe('*');
        });
      });
      describe('phoneNumber', () => {
        it('renders', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const phoneInput = wrapper.findComponent(InputMask);

          expect(phoneInput.props('name')).toBe('contacts.phoneNumber');
          expect(phoneInput.props('mask')).toBe('(999) 999-9999');
        });
        it('displays asterisk', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const labels = wrapper.findAll('label');
          const phoneLabel = labels.find((label) => label.attributes('for') === 'contacts.phoneNumber');
          const asterisk = phoneLabel?.find('span.text-\\[var\\(--p-support-required-text\\)\\]');

          expect(asterisk).toBeTruthy();
          expect(asterisk?.text()).toBe('*');
        });
      });
      describe('email', () => {
        it('renders', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const inputTexts = wrapper.findAllComponents(InputText);
          const emailInput = inputTexts.find((input) => input.props('name') === 'contacts.email');

          expect(emailInput).toBeTruthy();
        });
        it('displays asterisk', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const labels = wrapper.findAll('label');
          const emailLabel = labels.find((label) => label.attributes('for') === 'contacts.email');
          const asterisk = emailLabel?.find('span.text-\\[var\\(--p-support-required-text\\)\\]');

          expect(asterisk).toBeTruthy();
          expect(asterisk?.text()).toBe('*');
        });
      });
      describe('contactApplicantRelationship', () => {
        it('renders', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const selects = wrapper.findAllComponents(Select);
          const relationshipSelect = selects.find(
            (select) => select.props('name') === 'contacts.contactApplicantRelationship'
          );

          expect(relationshipSelect).toBeTruthy();
        });
        it('displays asterisk', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const labels = wrapper.findAll('label');
          const relationshipLabel = labels.find(
            (label) => label.attributes('for') === 'contacts.contactApplicantRelationship'
          );
          const asterisk = relationshipLabel?.find('span.text-\\[var\\(--p-support-required-text\\)\\]');

          expect(asterisk).toBeTruthy();
          expect(asterisk?.text()).toBe('*');
        });
      });
      describe('contactPreference', () => {
        it('renders', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const selects = wrapper.findAllComponents(Select);
          const preferenceSelect = selects.find((select) => select.props('name') === 'contacts.contactPreference');

          expect(preferenceSelect).toBeTruthy();
        });
        it('displays asterisk for contactPreference field', () => {
          const { wrapper } = mountContactCardIntakeForm();

          const labels = wrapper.findAll('label');
          const preferenceLabel = labels.find((label) => label.attributes('for') === 'contacts.contactPreference');
          const asterisk = preferenceLabel?.find('span.text-\\[var\\(--p-support-required-text\\)\\]');

          expect(asterisk).toBeTruthy();
          expect(asterisk?.text()).toBe('*');
        });
      });
    });
  });
});
