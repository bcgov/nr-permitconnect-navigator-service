import {
  contactService,
  getContact,
  getCurrentUserContact,
  deleteContact,
  matchContacts,
  searchContacts,
  putContact
} from '@/services/contactService';
import { appAxios } from '@/services/interceptors';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('contactService', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete
    } as never);
  });

  describe('getContact', () => {
    it('returns a contact', async () => {
      const contact = {
        contactId: 'contact-1'
      };

      mockGet.mockResolvedValue({
        data: contact
      });

      const result = await getContact({
        contactId: 'contact-1',
        includeActivities: true
      } as never);

      expect(mockGet).toHaveBeenCalledWith('contact/contact-1', {
        params: {
          includeActivities: true
        }
      });

      expect(result).toEqual(contact);
    });

    it('defaults includeActivities to false', async () => {
      mockGet.mockResolvedValue({
        data: {}
      });

      await getContact({
        contactId: 'contact-1'
      } as never);

      expect(mockGet).toHaveBeenCalledWith('contact/contact-1', {
        params: {
          includeActivities: false
        }
      });
    });

    it('propagates errors', async () => {
      const error = new Error('get failed');

      mockGet.mockRejectedValue(error);

      await expect(
        getContact({
          contactId: 'contact-1'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  describe('getCurrentUserContact', () => {
    it('returns the current user contact', async () => {
      const contact = {
        contactId: 'contact-1'
      };

      mockGet.mockResolvedValue({
        data: contact
      });

      const result = await getCurrentUserContact();

      expect(mockGet).toHaveBeenCalledWith('contact');

      expect(result).toEqual(contact);
    });

    it('propagates errors', async () => {
      const error = new Error('get failed');

      mockGet.mockRejectedValue(error);

      await expect(getCurrentUserContact()).rejects.toThrow(error);
    });
  });

  describe('deleteContact', () => {
    it('deletes a contact', async () => {
      mockDelete.mockResolvedValue({});

      await deleteContact({
        contactId: 'contact-1'
      } as never);

      expect(mockDelete).toHaveBeenCalledWith('contact/contact-1');
    });

    it('propagates errors', async () => {
      const error = new Error('delete failed');

      mockDelete.mockRejectedValue(error);

      await expect(
        deleteContact({
          contactId: 'contact-1'
        } as never)
      ).rejects.toThrow(error);
    });
  });

  describe('matchContacts', () => {
    it('returns matching contacts', async () => {
      const request = {
        userId: ['user-1']
      };

      const contacts = [{ contactId: 'contact-1' }];

      mockPost.mockResolvedValue({
        data: contacts
      });

      const result = await matchContacts(request as never);

      expect(mockPost).toHaveBeenCalledWith('contact/match', request);

      expect(result).toEqual(contacts);
    });

    it('propagates errors', async () => {
      const error = new Error('match failed');

      mockPost.mockRejectedValue(error);

      await expect(matchContacts({} as never)).rejects.toThrow(error);
    });
  });

  describe('searchContacts', () => {
    it('returns searched contacts', async () => {
      const request = {
        firstName: 'John'
      };

      const contacts = [{ contactId: 'contact-1' }];

      mockPost.mockResolvedValue({
        data: contacts
      });

      const result = await searchContacts(request as never);

      expect(mockPost).toHaveBeenCalledWith('contact/search', request);

      expect(result).toEqual(contacts);
    });

    it('propagates errors', async () => {
      const error = new Error('search failed');

      mockPost.mockRejectedValue(error);

      await expect(searchContacts({} as never)).rejects.toThrow(error);
    });
  });

  describe('putContact', () => {
    it('updates a contact and returns the updated resource', async () => {
      const request = {
        firstName: 'Jane',
        lastName: 'Doe'
      };

      const contact = {
        contactId: 'contact-1',
        ...request
      };

      mockPut.mockResolvedValue({
        data: contact
      });

      const result = await putContact(request as never);

      expect(mockPut).toHaveBeenCalledWith('contact', request);

      expect(result).toEqual(contact);
    });

    it('propagates errors', async () => {
      const error = new Error('update failed');

      mockPut.mockRejectedValue(error);

      await expect(putContact({} as never)).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(contactService).toEqual({
      getContact,
      getCurrentUserContact,
      deleteContact,
      matchContacts,
      searchContacts,
      putContact
    });
  });
});
