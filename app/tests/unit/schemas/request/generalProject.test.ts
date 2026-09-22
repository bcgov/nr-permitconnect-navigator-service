import { schema } from '#src/schemas/request/generalProject';

describe('createGeneralProject validator', () => {
  it('accepts an empty body', () => {
    const result = schema.createGeneralProject.body.safeParse({});
    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({});
  });

  it('rejects unrecognized fields', () => {
    const result = schema.createGeneralProject.body.safeParse({ notARealField: true });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].message).toMatch(/Unrecognized key: "notARealField"/);
  });
});

describe('submitGeneralProjectDraft validator', () => {
  const validContact = {
    contactId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    email: 'test@example.com',
    firstName: 'Jane',
    phoneNumber: '778-555-1234',
    contactApplicantRelationship: 'Property owner',
    contactPreference: 'Email'
  };
  const validLocation = {
    naturalDisaster: 'No',
    projectLocation: 'Location coordinates',
    latitude: 49,
    longitude: -123
  };
  const validPermits = { hasAppliedProvincialPermits: 'No' };

  function validBody(basic: Record<string, unknown>) {
    return {
      contact: validContact,
      basic,
      location: validLocation,
      permits: validPermits
    };
  }

  it('requires registeredName when projectApplicantType is Business', () => {
    const result = schema.submitGeneralProjectDraft.body.safeParse(
      validBody({ projectApplicantType: 'Business', projectName: 'Test Project', projectDescription: 'Desc' })
    );
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues.some((i) => i.message.match(/"registeredName" is required/))).toBe(
      true
    );
  });

  it('passes when projectApplicantType is Business and registeredName is provided', () => {
    const result = schema.submitGeneralProjectDraft.body.safeParse(
      validBody({
        projectApplicantType: 'Business',
        projectName: 'Test Project',
        projectDescription: 'Desc',
        registeredName: 'Acme'
      })
    );
    expect(result.success).toBe(true);
  });

  it('does not require registeredName when projectApplicantType is Individual', () => {
    const result = schema.submitGeneralProjectDraft.body.safeParse(
      validBody({ projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' })
    );
    expect(result.success).toBe(true);
  });

  it('requires basic, contact, location, and permits', () => {
    const result = schema.submitGeneralProjectDraft.body.safeParse({});
    expect(result.success).toBe(false);
  });

  it('requires contactId on contact', () => {
    const contactWithoutId: Record<string, unknown> = { ...validContact };
    delete contactWithoutId.contactId;
    const result = schema.submitGeneralProjectDraft.body.safeParse({
      contact: contactWithoutId,
      basic: { projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' },
      location: validLocation,
      permits: validPermits
    });
    expect(result.success).toBe(false);
  });

  it('requires contactPreference on contact', () => {
    const contactWithoutPreference: Record<string, unknown> = { ...validContact };
    delete contactWithoutPreference.contactPreference;
    const result = schema.submitGeneralProjectDraft.body.safeParse({
      contact: contactWithoutPreference,
      basic: { projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' },
      location: validLocation,
      permits: validPermits
    });
    expect(result.success).toBe(false);
  });

  it('rejects unrecognized fields on contact', () => {
    const result = schema.submitGeneralProjectDraft.body.safeParse({
      contact: { ...validContact, notARealField: true },
      basic: { projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' },
      location: validLocation,
      permits: validPermits
    });
    expect(result.success).toBe(false);
  });

  it('rejects a general field (dead, never sent by the frontend)', () => {
    const result = schema.submitGeneralProjectDraft.body.safeParse({
      ...validBody({ projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' }),
      general: { projectName: 'Test Project', projectDescription: 'Desc' }
    });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].message).toMatch(/Unrecognized key: "general"/);
  });
});

describe('patchGeneralProject validator', () => {
  it('passes with an empty body', () => {
    const result = schema.patchGeneralProject.body.safeParse({});
    expect(result.success).toBe(true);
  });

  it('passes with a single partial field', () => {
    const result = schema.patchGeneralProject.body.safeParse({ projectName: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('accepts naturalDisaster as a boolean', () => {
    const result = schema.patchGeneralProject.body.safeParse({ naturalDisaster: true });
    expect(result.success).toBe(true);
  });

  it('rejects addedToAts, which does not exist on general_project', () => {
    const result = schema.patchGeneralProject.body.safeParse({ addedToAts: true });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].message).toMatch(/Unrecognized key: "addedToAts"/);
  });

  it('passes with atsClientId and atsEnquiryId', () => {
    const result = schema.patchGeneralProject.body.safeParse({ atsClientId: 1, atsEnquiryId: 2 });
    expect(result.success).toBe(true);
  });
});
