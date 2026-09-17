import { schema } from '#src/validators/enquiry';

const validParams = { enquiryId: '5183f223-526a-44cf-8b6a-80f90c4e802b' };

describe('createEnquiry validator', () => {
  const validContact = {
    contactId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    email: 'test@example.com',
    firstName: 'Jane',
    phoneNumber: '778-555-1234',
    contactApplicantRelationship: 'Property owner',
    contactPreference: 'Email'
  };

  it('passes with just a contact (staff nav "create new" flow sends no other fields)', () => {
    const result = schema.createEnquiry.body.safeParse({ contact: validContact });
    expect(result.success).toBe(true);
  });

  it('passes with contact and enquiryDescription/relatedActivityId (citizen intake flow)', () => {
    const result = schema.createEnquiry.body.safeParse({
      contact: validContact,
      enquiryDescription: 'Test enquiry',
      relatedActivityId: 'ACTI1234'
    });
    expect(result.success).toBe(true);
  });

  it('requires contact', () => {
    const result = schema.createEnquiry.body.safeParse({});
    expect(result.success).toBe(false);
  });

  it('requires contactId on contact', () => {
    const contactWithoutId: Record<string, unknown> = { ...validContact };
    delete contactWithoutId.contactId;
    const result = schema.createEnquiry.body.safeParse({ contact: contactWithoutId });
    expect(result.success).toBe(false);
  });

  it('requires contactPreference on contact', () => {
    const contactWithoutPreference: Record<string, unknown> = { ...validContact };
    delete contactWithoutPreference.contactPreference;
    const result = schema.createEnquiry.body.safeParse({ contact: contactWithoutPreference });
    expect(result.success).toBe(false);
  });

  it('rejects unrecognized fields on contact', () => {
    const result = schema.createEnquiry.body.safeParse({ contact: { ...validContact, notARealField: true } });
    expect(result.success).toBe(false);
  });
});

describe('patchEnquiry validator', () => {
  it('passes with an empty body', () => {
    const result = schema.patchEnquiry.body.safeParse({});
    expect(result.success).toBe(true);
  });

  it('passes with a single partial field', () => {
    const result = schema.patchEnquiry.body.safeParse({ enquiryDescription: 'Updated description' });
    expect(result.success).toBe(true);
  });

  it('passes without addedToAts (optional)', () => {
    const result = schema.patchEnquiry.body.safeParse({ enquiryStatus: 'New' });
    expect(result.success).toBe(true);
  });

  it('accepts addedToAts as a boolean when supplied', () => {
    const result = schema.patchEnquiry.body.safeParse({ addedToAts: true });
    expect(result.success).toBe(true);
  });
});

describe('getEnquiry validator', () => {
  it('passes with a valid uuid enquiryId', () => {
    const result = schema.getEnquiry.params.safeParse(validParams);
    expect(result.success).toBe(true);
  });

  it('rejects a non-uuid enquiryId', () => {
    const result = schema.getEnquiry.params.safeParse({ enquiryId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});
