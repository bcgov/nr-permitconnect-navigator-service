import { TEST_CURRENT_CONTEXT } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as contactService from '../../../src/services/contact.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { ContactPreference, ProjectRelationship } from '../../../src/utils/enums/projectCommon.ts';

import type { Contact } from '../../../src/types/index.ts';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('deleteContact', () => {
  it('calls contact.delete', async () => {
    prismaTxMock.contact.delete.mockResolvedValueOnce({} as Contact);

    await contactService.deleteContact(prismaTxMock, '1');

    expect(prismaTxMock.contact.delete).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.contact.delete).toHaveBeenCalledWith({ where: { contactId: '1' } });
  });
});

describe('getContact', () => {
  it('calls contact.findFirstOrThrow and returns result', async () => {
    prismaTxMock.contact.findFirstOrThrow.mockResolvedValueOnce({ contactId: '1' } as Contact);

    const response = await contactService.getContact(prismaTxMock, '1', true);

    expect(prismaTxMock.contact.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.contact.findFirstOrThrow).toHaveBeenCalledWith({
      where: { contactId: '1' },
      include: {
        activityContact: {
          include: {
            activity: true
          }
        }
      }
    });
    expect(response).toStrictEqual({ contactId: '1' });
  });

  it('does not include activities if includeActivities = false', async () => {
    prismaTxMock.contact.findFirstOrThrow.mockResolvedValueOnce({ contactId: '1' } as Contact);

    const response = await contactService.getContact(prismaTxMock, '1', false);

    expect(prismaTxMock.contact.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.contact.findFirstOrThrow).toHaveBeenCalledWith({
      where: { contactId: '1' },
      include: {}
    });
    expect(response).toStrictEqual({ contactId: '1' });
  });
});

describe('insertContacts', () => {
  it('calls contact.create with correct data and returns result', async () => {
    prismaTxMock.contact.create.mockResolvedValueOnce({ contactId: '1' } as Contact);

    const response = await contactService.insertContacts(
      prismaTxMock,
      [{ contactId: '1' }] as Contact[],
      TEST_CURRENT_CONTEXT
    );

    expect(prismaTxMock.contact.create).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.contact.create).toHaveBeenCalledWith({
      data: {
        contactId: '1',
        createdAt: expect.any(Date) as Date,
        createdBy: TEST_CURRENT_CONTEXT.userId
      }
    });
    expect(response).toStrictEqual([{ contactId: '1' }]);
  });
});

describe('matchContacts', () => {
  it('calls contact.findMany and returns result', async () => {
    prismaTxMock.contact.findMany.mockResolvedValueOnce([{ contactId: '1' }] as Contact[]);

    const response = await contactService.matchContacts(prismaTxMock, {});

    expect(prismaTxMock.contact.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            email: { contains: undefined, mode: 'insensitive' }
          },
          {
            firstName: { contains: undefined, mode: 'insensitive' }
          },
          {
            lastName: { contains: undefined, mode: 'insensitive' }
          },
          {
            phoneNumber: { contains: undefined, mode: 'insensitive' }
          }
        ]
      }
    });
    expect(response).toStrictEqual([{ contactId: '1' }]);
  });

  it('passes parameters', async () => {
    prismaTxMock.contact.findMany.mockResolvedValueOnce([{ contactId: '1' }] as Contact[]);

    await contactService.matchContacts(prismaTxMock, {
      email: 'email',
      firstName: 'first',
      lastName: 'last',
      phoneNumber: '1234567890'
    });

    expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            email: { contains: 'email', mode: 'insensitive' }
          },
          {
            firstName: { contains: 'first', mode: 'insensitive' }
          },
          {
            lastName: { contains: 'last', mode: 'insensitive' }
          },
          {
            phoneNumber: { contains: '1234567890', mode: 'insensitive' }
          }
        ]
      }
    });
  });
});

describe('searchContacts', () => {
  it('calls contact.findMany and returns result', async () => {
    prismaTxMock.contact.findMany.mockResolvedValueOnce([{ contactId: '1' }] as Contact[]);

    const response = await contactService.searchContacts(prismaTxMock, {});

    expect(prismaTxMock.contact.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            contactId: { in: undefined }
          },
          {
            userId: { in: undefined }
          },
          {
            contactApplicantRelationship: { contains: undefined, mode: 'insensitive' }
          },
          {
            contactPreference: { contains: undefined, mode: 'insensitive' }
          },
          {
            email: { contains: undefined, mode: 'insensitive' }
          },
          {
            firstName: { contains: undefined, mode: 'insensitive' }
          },
          {
            lastName: { contains: undefined, mode: 'insensitive' }
          },
          {
            phoneNumber: { contains: undefined, mode: 'insensitive' }
          }
        ]
      },
      include: {
        user: true
      }
    });
    expect(response).toStrictEqual([{ contactId: '1' }]);
  });

  it('passes parameters', async () => {
    prismaTxMock.contact.findMany.mockResolvedValueOnce([{ contactId: '1' }] as Contact[]);

    const params = {
      contactId: ['123'],
      userId: ['456'],
      contactApplicantRelationship: ProjectRelationship.OWNER,
      contactPreference: ContactPreference.EITHER,
      email: 'test@test.com',
      firstName: 'Joe',
      lastName: 'Smith',
      phoneNumber: '1234567890',
      initiative: Initiative.HOUSING,
      includeActivities: true
    };

    await contactService.searchContacts(prismaTxMock, params);

    expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            contactId: { in: params.contactId }
          },
          {
            userId: { in: params.userId }
          },
          {
            contactApplicantRelationship: { contains: params.contactApplicantRelationship, mode: 'insensitive' }
          },
          {
            contactPreference: { contains: params.contactPreference, mode: 'insensitive' }
          },
          {
            email: { contains: params.email, mode: 'insensitive' }
          },
          {
            firstName: { contains: params.firstName, mode: 'insensitive' }
          },
          {
            lastName: { contains: params.lastName, mode: 'insensitive' }
          },
          {
            phoneNumber: { contains: params.phoneNumber, mode: 'insensitive' }
          },
          { activityContact: { some: { activity: { initiative: { code: params.initiative } } } } }
        ]
      },
      include: {
        user: true,
        activityContact: { include: { activity: true } }
      }
    });
  });
});

describe('upsertContacts', () => {
  it('calls contact.upsert with correct data and returns result', async () => {
    prismaTxMock.contact.upsert.mockResolvedValueOnce({ contactId: '1' } as Contact);

    const response = await contactService.upsertContacts(prismaTxMock, [{ contactId: '1' }] as Contact[]);

    expect(prismaTxMock.contact.upsert).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.contact.upsert).toHaveBeenCalledWith({
      where: { contactId: '1' },
      update: { contactId: '1' },
      create: { contactId: '1' }
    });
    expect(response).toStrictEqual([{ contactId: '1' }]);
  });
});
