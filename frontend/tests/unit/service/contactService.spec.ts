import { contactService } from '@/services';
import { appAxios } from '@/services/interceptors';

import type { Contact, ContactSearchParameters } from '@/types';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const sampleContact: Contact = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: 'email',
  contactApplicantRelationship: 'applicant',
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
};
const sampleContactSearchParameters: ContactSearchParameters = {
  contactApplicantRelationship: 'applicant',
  contactPreference: 'email',
  contactId: ['contact123', 'contact456'],
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  userId: ['user123', 'user456']
};

const getSpy = vi.fn();
const deleteSpy = vi.fn();
const patchSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  delete: deleteSpy,
  patch: patchSpy,
  put: putSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('contactService', () => {
  it('calls getCurrentUserContact', () => {
    contactService.getCurrentUserContact();

    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  it('calls searchContacts with correct data', () => {
    contactService.searchContacts(sampleContactSearchParameters);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('contact/search', { params: sampleContactSearchParameters });
  });

  it('calls updateContact with correct data', () => {
    contactService.updateContact(sampleContact);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(`contact/${sampleContact.contactId}`, sampleContact);
  });
});
