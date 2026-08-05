import { mockReset } from 'vitest-mock-extended';

import { TEST_CONTACT_1 } from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import {
  createContactsService,
  deleteContactService,
  getContactService,
  matchContactsExactService,
  matchContactsService,
  searchContactsService,
  upsertContactsService
} from '../../../src/services/contact.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

import type { ContactSearchParameters } from '../../../src/types/index.ts';

describe('contact service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('deleteContactService', () => {
    it('should delete a contact by id', async () => {
      mockRepos.contact.delete.mockResolvedValueOnce(TEST_CONTACT_1 as never);

      await deleteContactService('contact-123');

      expect(mockRepos.contact.delete).toHaveBeenCalledWith({
        contactId: 'contact-123'
      });
    });
  });

  describe('getContactService', () => {
    it('should get a contact without activities', async () => {
      mockRepos.contact.findFirstOrThrow.mockResolvedValueOnce(TEST_CONTACT_1 as never);

      const result = await getContactService('contact-123', false);

      expect(mockRepos.contact.findFirstOrThrow).toHaveBeenCalledWith({
        where: { contactId: 'contact-123' },
        include: {}
      });
      expect(result).toEqual(TEST_CONTACT_1);
    });

    it('should get a contact with activities included', async () => {
      mockRepos.contact.findFirstOrThrow.mockResolvedValueOnce(TEST_CONTACT_1 as never);

      await getContactService('contact-123', true);

      expect(mockRepos.contact.findFirstOrThrow).toHaveBeenCalledWith({
        where: { contactId: 'contact-123' },
        include: { activityContact: { include: { activity: true } } }
      });
    });
  });

  describe('createContactsService', () => {
    it('should create multiple contacts', async () => {
      mockRepos.contact.create.mockResolvedValue(TEST_CONTACT_1 as never);

      const payload = [TEST_CONTACT_1, TEST_CONTACT_1];
      const result = await createContactsService(payload);

      expect(mockRepos.contact.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });
  });

  describe('matchContactsService', () => {
    it('should return contacts matching any of the search parameters', async () => {
      mockRepos.contact.findMany.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const params = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        userId: ['user-1']
      } as ContactSearchParameters;

      const result = await matchContactsService(params);

      expect(mockRepos.contact.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'test@example.com', mode: 'insensitive' } },
            { firstName: { contains: 'John', mode: 'insensitive' } },
            { lastName: { contains: 'Doe', mode: 'insensitive' } },
            { phoneNumber: { contains: '1234567890', mode: 'insensitive' } },
            { userId: { in: ['user-1'] } }
          ]
        }
      });
      expect(result).toEqual([TEST_CONTACT_1]);
    });
  });

  describe('matchContactsExactService', () => {
    it('should return contacts exactly matching search parameters with user included', async () => {
      mockRepos.contact.findMany.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const params = {
        email: 'test@example.com',
        userId: ['user-1'],
        contactId: ['contact-1']
      } as ContactSearchParameters;

      const result = await matchContactsExactService(params);

      expect(mockRepos.contact.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ contactId: { in: ['contact-1'] } }, { userId: { in: ['user-1'] } }, { email: 'test@example.com' }],
          userId: { not: null }
        },
        include: {
          user: true
        }
      });
      expect(result).toEqual([TEST_CONTACT_1]);
    });
  });

  describe('searchContactsService', () => {
    it('should search contacts including initiative and activities', async () => {
      mockRepos.contact.findMany.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const params = {
        contactId: ['contact-1'],
        userId: ['user-1'],
        contactApplicantRelationship: 'spouse',
        contactPreference: 'email',
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        initiative: Initiative.HOUSING,
        includeActivities: true
      } as ContactSearchParameters;

      const result = await searchContactsService(params);

      expect(mockRepos.contact.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { contactId: { in: ['contact-1'] } },
            { userId: { in: ['user-1'] } },
            { contactApplicantRelationship: { contains: 'spouse', mode: 'insensitive' } },
            { contactPreference: { contains: 'email', mode: 'insensitive' } },
            { email: { contains: 'test@example.com', mode: 'insensitive' } },
            { firstName: { contains: 'Jane', mode: 'insensitive' } },
            { lastName: { contains: 'Doe', mode: 'insensitive' } },
            { phoneNumber: { contains: '1234567890', mode: 'insensitive' } },
            { activityContact: { some: { activity: { initiative: { code: Initiative.HOUSING } } } } }
          ]
        },
        include: {
          user: true,
          activityContact: { include: { activity: true } }
        }
      });
      expect(result).toEqual([TEST_CONTACT_1]);
    });
  });

  describe('upsertContactsService', () => {
    it('should upsert multiple contacts', async () => {
      mockRepos.contact.upsert.mockResolvedValue(TEST_CONTACT_1 as never);

      const payload = [
        { contactId: 'contact-1', firstName: 'John' },
        { contactId: 'contact-2', firstName: 'Jane' }
      ];

      const result = await upsertContactsService(payload as never);

      expect(mockRepos.contact.upsert).toHaveBeenCalledTimes(2);
      expect(mockRepos.contact.upsert).toHaveBeenNthCalledWith(1, { contactId: 'contact-1' }, payload[0], payload[0]);
      expect(mockRepos.contact.upsert).toHaveBeenNthCalledWith(2, { contactId: 'contact-2' }, payload[1], payload[1]);
      expect(result).toHaveLength(2);
    });
  });
});
