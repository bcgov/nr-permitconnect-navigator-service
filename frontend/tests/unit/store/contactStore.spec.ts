import { setActivePinia, createPinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useContactStore } from '@/store';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';
import { testContactDefaults } from '../../fixtures';

import type { Contact } from '@/types';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe('Contact Store', () => {
  const getValidContact = (): Contact => ({
    ...testContactDefaults,
    contactId: 'contact123',
    userId: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '(250) 555-0000',
    contactPreference: ContactPreference.EMAIL,
    contactApplicantRelationship: ProjectRelationship.OWNER,
    activityContact: []
  });

  it('initializes with default state', () => {
    const contactStore = useContactStore();

    expect(contactStore.contact).toBeUndefined();
    expect(contactStore.getContact).toBeUndefined();
    expect(contactStore.needsContactDetails).toBe(true);
  });

  it('sets contact data via setContact action', () => {
    const contactStore = useContactStore();
    const testContact = getValidContact();

    contactStore.setContact(testContact);

    expect(contactStore.contact).toStrictEqual(testContact);
    expect(contactStore.getContact).toStrictEqual(testContact);
  });

  describe('needsContactDetails getter', () => {
    it('returns true when contact is undefined', () => {
      const contactStore = useContactStore();
      expect(contactStore.needsContactDetails).toBe(true);
    });

    it('returns true when phoneNumber is missing', () => {
      const contactStore = useContactStore();
      const contact = getValidContact();
      contact.phoneNumber = null;

      contactStore.setContact(contact);
      expect(contactStore.needsContactDetails).toBe(true);
    });

    it('returns true when contactApplicantRelationship is missing', () => {
      const contactStore = useContactStore();
      const contact = getValidContact();
      contact.contactApplicantRelationship = null;

      contactStore.setContact(contact);
      expect(contactStore.needsContactDetails).toBe(true);
    });

    it('returns true when contactPreference is missing', () => {
      const contactStore = useContactStore();
      const contact = getValidContact();
      contact.contactPreference = null;

      contactStore.setContact(contact);
      expect(contactStore.needsContactDetails).toBe(true);
    });

    it('returns false when all required fields are present', () => {
      const contactStore = useContactStore();

      contactStore.setContact(getValidContact());
      expect(contactStore.needsContactDetails).toBe(false);
    });
  });
});
