import { TEST_ACTIVITY_CONTACT_1, TEST_CONTACT_1 } from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { filterActivityResponseByScope } from '../../../src/parsers/responseFiltering.ts';
import { ActivityContactRepository } from '../../../src/repositories/activityContact.ts';
import { ContactRepository } from '../../../src/repositories/contact.ts';
import { Problem } from '../../../src/utils';

import type { Mock } from 'vitest';
import type { Contact, LocalContext } from '../../../src/types';

const makeContactRepo = () => new ContactRepository(prismaTxMock, 'principal-id');
const makeActivityContactRepo = () => new ActivityContactRepository(prismaTxMock, 'principal-id');

describe('filterActivityResponseByScope', () => {
  let activityContactRepo = makeActivityContactRepo();
  let contactRepo = makeContactRepo();
  let findManyActivityContactMock: Mock;
  let findManyContactMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    activityContactRepo = makeActivityContactRepo();
    contactRepo = makeContactRepo();

    findManyActivityContactMock = vi.spyOn(activityContactRepo, 'findMany');
    findManyContactMock = vi.spyOn(contactRepo, 'findMany');
  });

  describe('when scope:self is not present', () => {
    it('returns the original data without loading contacts', async () => {
      const data = [{ activityId: 'a1' }, { activityId: 'a2' }];

      const locals = {
        currentAuthorization: {
          attributes: ['scope:all']
        },
        currentContext: {
          userId: 'user-1'
        }
      } as LocalContext;

      const result = await filterActivityResponseByScope(
        { activityContact: activityContactRepo, contact: contactRepo },
        locals.currentAuthorization,
        locals.currentContext,
        data
      );

      expect(result).toBe(data);
      expect(findManyContactMock).not.toHaveBeenCalled();
      expect(findManyActivityContactMock).not.toHaveBeenCalled();
    });
  });

  describe('when scope:self is present', () => {
    const locals = {
      currentAuthorization: {
        attributes: ['scope:self']
      },
      currentContext: {
        userId: 'user-1'
      }
    } as LocalContext;

    it('throws when the current contact cannot be determined', async () => {
      findManyContactMock.mockResolvedValue([]);

      await expect(
        filterActivityResponseByScope(
          { activityContact: activityContactRepo, contact: contactRepo },
          locals.currentAuthorization,
          locals.currentContext,
          []
        )
      ).rejects.toEqual(
        new Problem(403, {
          detail: 'Unable to determine contact'
        })
      );

      expect(findManyContactMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: expect.objectContaining({ in: [locals.currentContext.userId] }) })
        })
      );
    });

    it('filters using loaded activity contacts', async () => {
      findManyContactMock.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      const data = [
        {
          activity: {
            activityContact: [{ contactId: 'contact-1' }]
          }
        },
        {
          activity: {
            activityContact: [{ contactId: 'contact-2' }]
          }
        }
      ];

      const result = await filterActivityResponseByScope(
        { activityContact: activityContactRepo, contact: contactRepo },
        locals.currentAuthorization,
        locals.currentContext,
        data
      );

      expect(result).toEqual([data[0]]);
      expect(findManyActivityContactMock).not.toHaveBeenCalled();
    });

    it('filters using activityId lookup when contacts are not loaded', async () => {
      findManyContactMock.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      findManyActivityContactMock.mockResolvedValue([
        {
          ...TEST_ACTIVITY_CONTACT_1,
          activityId: 'activity-1',
          contactId: 'contact-1',
          contact: { ...TEST_CONTACT_1, contactId: 'contact-1' }
        },
        {
          ...TEST_ACTIVITY_CONTACT_1,
          activityId: 'activity-2',
          contactId: 'contact-2',
          contact: { ...TEST_CONTACT_1, contactId: 'contact-2' }
        }
      ]);

      const data = [{ activityId: 'activity-1' }, { activityId: 'activity-2' }];

      const result = await filterActivityResponseByScope(
        { activityContact: activityContactRepo, contact: contactRepo },
        locals.currentAuthorization,
        locals.currentContext,
        data
      );

      expect(result).toEqual([data[0]]);
    });

    it('deduplicates activity ids before loading contacts', async () => {
      findManyContactMock.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      findManyActivityContactMock.mockResolvedValue([]);

      const data = [{ activityId: 'activity-1' }, { activityId: 'activity-1' }, { activityId: 'activity-2' }];

      await filterActivityResponseByScope(
        { activityContact: activityContactRepo, contact: contactRepo },
        locals.currentAuthorization,
        locals.currentContext,
        data
      );

      expect(findManyActivityContactMock).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ contact: true }),
          where: expect.objectContaining({
            activityId: expect.objectContaining({ in: ['activity-1', 'activity-2'] })
          })
        })
      );
    });

    it('does not query activity contacts when all records already contain them', async () => {
      findManyContactMock.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      const data = [
        {
          activityId: 'activity-1',
          activity: {
            activityContact: [{ contactId: 'contact-1' }]
          }
        }
      ];

      await filterActivityResponseByScope(
        { activityContact: activityContactRepo, contact: contactRepo },
        locals.currentAuthorization,
        locals.currentContext,
        data
      );

      expect(findManyActivityContactMock).not.toHaveBeenCalled();
    });

    it('denies access when an item has no activityId and no activity contacts', async () => {
      findManyContactMock.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      const data = [
        {},
        {
          activity: {
            activityContact: [{ contactId: 'contact-1' }]
          }
        }
      ];

      const result = await filterActivityResponseByScope(
        { activityContact: activityContactRepo, contact: contactRepo },
        locals.currentAuthorization,
        locals.currentContext,
        data
      );

      expect(result).toEqual([data[1]]);
    });

    it('denies access when an activity has no associated contacts', async () => {
      findManyContactMock.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      findManyActivityContactMock.mockResolvedValue([]);

      const data = [{ activityId: 'activity-1' }];

      const result = await filterActivityResponseByScope(
        { activityContact: activityContactRepo, contact: contactRepo },
        locals.currentAuthorization,
        locals.currentContext,
        data
      );

      expect(result).toEqual([]);
    });

    it('handles a mixture of loaded and lookup-based activity contacts', async () => {
      findManyContactMock.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      findManyActivityContactMock.mockResolvedValue([
        {
          ...TEST_ACTIVITY_CONTACT_1,
          activityId: 'activity-lookup-allowed',
          contactId: 'contact-1',
          contact: { ...TEST_CONTACT_1, contactId: 'contact-1' }
        },
        {
          ...TEST_ACTIVITY_CONTACT_1,
          activityId: 'activity-lookup-denied',
          contactId: 'contact-2',
          contact: { ...TEST_CONTACT_1, contactId: 'contact-2' }
        }
      ]);

      const data = [
        {
          activity: {
            activityContact: [{ contactId: 'contact-1' }]
          }
        },
        {
          activity: {
            activityContact: [{ contactId: 'contact-2' }]
          }
        },
        {
          activityId: 'activity-lookup-allowed'
        },
        {
          activityId: 'activity-lookup-denied'
        }
      ];

      const result = await filterActivityResponseByScope(
        { activityContact: activityContactRepo, contact: contactRepo },
        locals.currentAuthorization,
        locals.currentContext,
        data
      );

      expect(result).toEqual([data[0], data[2]]);
    });
  });
});
