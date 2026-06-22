import { prismaTxMock } from '../../__mocks__/prismaMock';
import { filterActivityResponseByScope } from '../../../src/parsers/responseFiltering';
import { listActivityContacts } from '../../../src/services/activityContact';
import { searchContacts } from '../../../src/services/contact';
import { Problem } from '../../../src/utils';
import { ActivityContact, Contact, LocalContext } from '../../../src/types';

vi.mock('../../../src/services/contact', () => ({
  searchContacts: vi.fn()
}));

vi.mock('../../../src/services/activityContact', () => ({
  listActivityContacts: vi.fn()
}));

const mockedSearchContacts = vi.mocked(searchContacts);
const mockedListActivityContacts = vi.mocked(listActivityContacts);

describe('filterActivityResponseByScope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when scope:self is not present', () => {
    it('returns the original data without loading contacts', async () => {
      const data = [{ activityId: 'a1' }, { activityId: 'a2' }];

      const locals = {
        currentAuthorization: {
          attributes: ['scope:all']
        }
      } as LocalContext;

      const result = await filterActivityResponseByScope(prismaTxMock, locals, data);

      expect(result).toBe(data);
      expect(mockedSearchContacts).not.toHaveBeenCalled();
      expect(mockedListActivityContacts).not.toHaveBeenCalled();
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
      mockedSearchContacts.mockResolvedValue([]);

      await expect(filterActivityResponseByScope(prismaTxMock, locals, [])).rejects.toEqual(
        new Problem(403, {
          detail: 'Unable to determine contact'
        })
      );

      expect(mockedSearchContacts).toHaveBeenCalledWith(prismaTxMock, {
        userId: ['user-1']
      });
    });

    it('filters using loaded activity contacts', async () => {
      mockedSearchContacts.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

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

      const result = await filterActivityResponseByScope(prismaTxMock, locals, data);

      expect(result).toEqual([data[0]]);
      expect(mockedListActivityContacts).not.toHaveBeenCalled();
    });

    it('filters using activityId lookup when contacts are not loaded', async () => {
      mockedSearchContacts.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      mockedListActivityContacts.mockResolvedValue([
        {
          activityId: 'activity-1',
          contactId: 'contact-1'
        },
        {
          activityId: 'activity-2',
          contactId: 'contact-2'
        }
      ] as ActivityContact[]);

      const data = [{ activityId: 'activity-1' }, { activityId: 'activity-2' }];

      const result = await filterActivityResponseByScope(prismaTxMock, locals, data);

      expect(result).toEqual([data[0]]);
    });

    it('deduplicates activity ids before loading contacts', async () => {
      mockedSearchContacts.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      mockedListActivityContacts.mockResolvedValue([]);

      const data = [{ activityId: 'activity-1' }, { activityId: 'activity-1' }, { activityId: 'activity-2' }];

      await filterActivityResponseByScope(prismaTxMock, locals, data);

      expect(mockedListActivityContacts).toHaveBeenCalledWith(prismaTxMock, ['activity-1', 'activity-2']);
    });

    it('does not query activity contacts when all records already contain them', async () => {
      mockedSearchContacts.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      const data = [
        {
          activityId: 'activity-1',
          activity: {
            activityContact: [{ contactId: 'contact-1' }]
          }
        }
      ];

      await filterActivityResponseByScope(prismaTxMock, locals, data);

      expect(mockedListActivityContacts).not.toHaveBeenCalled();
    });

    it('denies access when an item has no activityId and no activity contacts', async () => {
      mockedSearchContacts.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      const data = [
        {},
        {
          activity: {
            activityContact: [{ contactId: 'contact-1' }]
          }
        }
      ];

      const result = await filterActivityResponseByScope(prismaTxMock, locals, data);

      expect(result).toEqual([data[1]]);
    });

    it('denies access when an activity has no associated contacts', async () => {
      mockedSearchContacts.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      mockedListActivityContacts.mockResolvedValue([]);

      const data = [{ activityId: 'activity-1' }];

      const result = await filterActivityResponseByScope(prismaTxMock, locals, data);

      expect(result).toEqual([]);
    });

    it('handles a mixture of loaded and lookup-based activity contacts', async () => {
      mockedSearchContacts.mockResolvedValue([{ contactId: 'contact-1' }] as Contact[]);

      mockedListActivityContacts.mockResolvedValue([
        {
          activityId: 'activity-lookup-allowed',
          contactId: 'contact-1'
        },
        {
          activityId: 'activity-lookup-denied',
          contactId: 'contact-2'
        }
      ] as ActivityContact[]);

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

      const result = await filterActivityResponseByScope(prismaTxMock, locals, data);

      expect(result).toEqual([data[0], data[2]]);
    });
  });
});
