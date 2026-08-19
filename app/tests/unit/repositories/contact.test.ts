import { TEST_CONTACT_1 } from '#tests/unit/data/index';
import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { ContactRepository } from '#src/repositories/contact';
import { Initiative } from '#src/utils/enums/application';

// Construct the real repo — its constructor picks tx.contact, so prismaTxMock.contact
// acts as the deep-mocked delegate. prismaMock setup resets it before each test.
const makeRepo = () => new ContactRepository(prismaTxMock, 'principal-id');

describe('ContactRepository', () => {
  describe('search', () => {
    it('builds where clause with all search parameter filters', async () => {
      prismaTxMock.contact.findMany.mockResolvedValueOnce([TEST_CONTACT_1]);

      const params = {
        contactId: ['contact-1', 'contact-2'],
        userId: ['user-1'],
        contactApplicantRelationship: 'owner',
        contactPreference: 'email',
        email: 'john',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '123'
      };

      await makeRepo().search(params);

      expect(prismaTxMock.contact.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { contactId: { in: ['contact-1', 'contact-2'] } },
            { userId: { in: ['user-1'] } },
            { contactApplicantRelationship: { contains: 'owner', mode: 'insensitive' } },
            { contactPreference: { contains: 'email', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
            { firstName: { contains: 'John', mode: 'insensitive' } },
            { lastName: { contains: 'Doe', mode: 'insensitive' } },
            { phoneNumber: { contains: '123', mode: 'insensitive' } }
          ]
        },
        include: {
          user: true
        }
      });
    });

    it('includes initiative filter when initiative param is provided', async () => {
      prismaTxMock.contact.findMany.mockResolvedValueOnce([TEST_CONTACT_1]);

      const params = {
        contactId: [],
        userId: [],
        contactApplicantRelationship: '',
        contactPreference: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        initiative: Initiative.HOUSING
      };

      await makeRepo().search(params);

      expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              {
                activityContact: {
                  some: {
                    activity: {
                      initiative: {
                        code: Initiative.HOUSING
                      }
                    }
                  }
                }
              }
            ])
          }
        })
      );
    });

    it('does not include initiative filter when initiative param is not provided', async () => {
      prismaTxMock.contact.findMany.mockResolvedValueOnce([TEST_CONTACT_1]);

      const params = {
        contactId: [],
        userId: [],
        contactApplicantRelationship: '',
        contactPreference: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
      };

      await makeRepo().search(params);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = prismaTxMock.contact.findMany.mock.calls[0][0] as any;
      const activityContactFilter = (callArgs.where.AND as Record<string, unknown>[]).find(
        (clause) => 'activityContact' in clause
      );
      expect(activityContactFilter).toBeUndefined();
    });

    it('includes activityContact in result when includeActivities is true', async () => {
      prismaTxMock.contact.findMany.mockResolvedValueOnce([TEST_CONTACT_1]);

      const params = {
        contactId: [],
        userId: [],
        contactApplicantRelationship: '',
        contactPreference: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        includeActivities: true
      };

      await makeRepo().search(params);

      expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            user: true,
            activityContact: {
              include: {
                activity: true
              }
            }
          }
        })
      );
    });

    it('does not include activityContact when includeActivities is not provided', async () => {
      prismaTxMock.contact.findMany.mockResolvedValueOnce([TEST_CONTACT_1]);

      const params = {
        contactId: [],
        userId: [],
        contactApplicantRelationship: '',
        contactPreference: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
      };

      await makeRepo().search(params);

      expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            user: true
          }
        })
      );
    });

    it('passes all params including optional filters and returns the result', async () => {
      prismaTxMock.contact.findMany.mockResolvedValueOnce([TEST_CONTACT_1]);

      const params = {
        contactId: ['contact-1'],
        userId: ['user-1'],
        contactApplicantRelationship: 'owner',
        contactPreference: 'email',
        email: 'john',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '123',
        initiative: Initiative.HOUSING,
        includeActivities: true
      };

      const result = await makeRepo().search(params);

      expect(prismaTxMock.contact.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { contactId: { in: ['contact-1'] } },
            { userId: { in: ['user-1'] } },
            { contactApplicantRelationship: { contains: 'owner', mode: 'insensitive' } },
            { contactPreference: { contains: 'email', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
            { firstName: { contains: 'John', mode: 'insensitive' } },
            { lastName: { contains: 'Doe', mode: 'insensitive' } },
            { phoneNumber: { contains: '123', mode: 'insensitive' } },
            {
              activityContact: {
                some: {
                  activity: {
                    initiative: {
                      code: Initiative.HOUSING
                    }
                  }
                }
              }
            }
          ]
        },
        include: {
          user: true,
          activityContact: {
            include: {
              activity: true
            }
          }
        }
      });
      expect(result).toStrictEqual([TEST_CONTACT_1]);
    });
  });
});
