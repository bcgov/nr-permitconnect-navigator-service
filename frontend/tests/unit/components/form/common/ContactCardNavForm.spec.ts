import { InputMask, InputText, Select } from '@/components/form';
import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';

import { mountWithFormContext } from '../../../../mountWithFormContext';

import type { DeepPartial } from '@/types';
import type { FormSchemaType as HousingFormSchemaType } from '@/validators/housing/projectFormNavigatorSchema';

// Fixtures

const contactFieldNames = [
  'contact.firstName',
  'contact.lastName',
  'contact.contactApplicantRelationship',
  'contact.contactPreference',
  'contact.phoneNumber',
  'contact.email'
];

// Mount

function mountContactCardNavForm(formValues: DeepPartial<HousingFormSchemaType> = {}) {
  const { wrapper } = mountWithFormContext(ContactCardNavForm, {
    componentProps: { formValues }
  });

  return { wrapper };
}

// Tests

describe('ContactCardNavForm', () => {
  it('renders the header', () => {
    const { wrapper } = mountContactCardNavForm();

    expect(wrapper.find('h3').text().trim().length).toBeGreaterThan(0);
  });

  describe('when there is no selected contact', () => {
    it('renders neither the manual-contact warning nor the contact fields', () => {
      const { wrapper } = mountContactCardNavForm({ contact: undefined });

      expect(wrapper.find('.p-message').exists()).toBe(false);
      expect(wrapper.findComponent(InputText).exists()).toBe(false);
      expect(wrapper.findComponent(Select).exists()).toBe(false);
    });
  });

  describe('when a contact is selected', () => {
    const selectedContact = {
      contact: {
        contactId: 'contact-123',
        userId: 'user-456',
        firstName: 'Jane',
        lastName: 'Doe'
      }
    } as unknown as DeepPartial<HousingFormSchemaType>;

    it('renders all six contact fields, each disabled', () => {
      const { wrapper } = mountContactCardNavForm(selectedContact);

      const textFields = wrapper.findAllComponents(InputText);
      const selectFields = wrapper.findAllComponents(Select);
      const maskField = wrapper.findComponent(InputMask);

      const renderedNames = [
        ...textFields.map((f) => f.props().name),
        ...selectFields.map((f) => f.props().name),
        maskField.props().name
      ];

      expect(renderedNames.sort()).toEqual([...contactFieldNames].sort());

      for (const field of [...textFields, ...selectFields, maskField]) {
        expect(field.props().disabled).toBe(true);
      }
    });

    it('does not show the manual-contact warning when the contact has a linked userId', () => {
      const { wrapper } = mountContactCardNavForm(selectedContact);

      expect(wrapper.find('.p-message').exists()).toBe(false);
    });

    it('shows the manual-contact warning when the contact has no linked userId (a manually-entered contact)', () => {
      const { wrapper } = mountContactCardNavForm({
        contact: { ...selectedContact.contact, userId: undefined }
      } as unknown as DeepPartial<HousingFormSchemaType>);

      expect(wrapper.find('.p-message').exists()).toBe(true);
    });

    // Documents current behavior rather than asserting intent: the hidden
    // `contact.userId` input binds to a local `ref('')` that's never
    // initialized from `formValues.contact.userId`, and being `type="hidden"`
    // can never be changed by a user either. As written, it will always be
    // empty regardless of props -- worth double-checking whether that's
    // actually intentional, since it looks more like unfinished wiring than
    // a deliberate default.
    it('renders the hidden contact.userId input as empty regardless of the contact prop', () => {
      const { wrapper } = mountContactCardNavForm(selectedContact);

      const hiddenInput = wrapper.find('input[name="contact.userId"]');
      expect(hiddenInput.exists()).toBe(true);
      expect((hiddenInput.element as HTMLInputElement).value).toBe('');
    });
  });
});
