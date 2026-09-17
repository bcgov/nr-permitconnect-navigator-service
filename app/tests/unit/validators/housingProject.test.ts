import { schema } from '#src/validators/housingProject';

describe('createHousingProject validator', () => {
  it('accepts an empty body', () => {
    const result = schema.createHousingProject.body.safeParse({});
    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({});
  });

  it('rejects unrecognized fields', () => {
    const result = schema.createHousingProject.body.safeParse({ notARealField: true });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].message).toMatch(/Unrecognized key: "notARealField"/);
  });
});

describe('submitHousingProjectDraft validator', () => {
  const validContact = {
    contactId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    email: 'test@example.com',
    firstName: 'Jane',
    phoneNumber: '778-555-1234',
    contactApplicantRelationship: 'Property owner',
    contactPreference: 'Email'
  };
  const validHousing = {
    financiallySupportedBc: 'No',
    financiallySupportedIndigenous: 'No',
    financiallySupportedNonProfit: 'No',
    financiallySupportedHousingCoop: 'No',
    hasRentalUnits: 'No',
    singleFamilySelected: true,
    singleFamilyUnits: '1-9'
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
      housing: validHousing,
      location: validLocation,
      permits: validPermits
    };
  }

  it('requires registeredName when projectApplicantType is Business', () => {
    const body = validBody({
      consentToFeedback: true,
      projectApplicantType: 'Business',
      projectName: 'Test Project',
      projectDescription: 'Desc'
    });

    const result = schema.submitHousingProjectDraft.body.safeParse(body);

    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues.some((i) => i.message.match(/"registeredName" is required/))).toBe(
      true
    );
  });

  it('passes when projectApplicantType is Business and registeredName is provided', () => {
    const body = validBody({
      consentToFeedback: true,
      projectApplicantType: 'Business',
      projectName: 'Test Project',
      projectDescription: 'Desc',
      registeredName: 'Acme'
    });

    const result = schema.submitHousingProjectDraft.body.safeParse(body);

    expect(result.success).toBe(true);
  });

  it('does not require registeredName when projectApplicantType is Individual', () => {
    const body = validBody({
      consentToFeedback: true,
      projectApplicantType: 'Individual',
      projectName: 'Test Project',
      projectDescription: 'Desc'
    });

    const result = schema.submitHousingProjectDraft.body.safeParse(body);

    expect(result.success).toBe(true);
  });

  it('requires basic, contact, housing, location, and permits', () => {
    const result = schema.submitHousingProjectDraft.body.safeParse({});

    expect(result.success).toBe(false);
  });

  it('requires contactId on contact', () => {
    const contactWithoutId: Record<string, unknown> = { ...validContact };
    delete contactWithoutId.contactId;

    const result = schema.submitHousingProjectDraft.body.safeParse({
      contact: contactWithoutId,
      basic: {
        consentToFeedback: true,
        projectApplicantType: 'Individual',
        projectName: 'Test Project',
        projectDescription: 'Desc'
      },
      housing: validHousing,
      location: validLocation,
      permits: validPermits
    });

    expect(result.success).toBe(false);
  });

  it('requires contactPreference on contact', () => {
    const contactWithoutPreference: Record<string, unknown> = { ...validContact };
    delete contactWithoutPreference.contactPreference;

    const result = schema.submitHousingProjectDraft.body.safeParse({
      contact: contactWithoutPreference,
      basic: {
        consentToFeedback: true,
        projectApplicantType: 'Individual',
        projectName: 'Test Project',
        projectDescription: 'Desc'
      },
      housing: validHousing,
      location: validLocation,
      permits: validPermits
    });

    expect(result.success).toBe(false);
  });

  it('rejects unrecognized fields on contact', () => {
    const result = schema.submitHousingProjectDraft.body.safeParse({
      contact: { ...validContact, notARealField: true },
      basic: {
        consentToFeedback: true,
        projectApplicantType: 'Individual',
        projectName: 'Test Project',
        projectDescription: 'Desc'
      },
      housing: validHousing,
      location: validLocation,
      permits: validPermits
    });

    expect(result.success).toBe(false);
  });
});

describe('patchHousingProject validator', () => {
  it('passes with an empty body', () => {
    const result = schema.patchHousingProject.body.safeParse({});
    expect(result.success).toBe(true);
  });

  it('passes with a single partial field', () => {
    const result = schema.patchHousingProject.body.safeParse({ projectName: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('accepts naturalDisaster as a boolean', () => {
    const result = schema.patchHousingProject.body.safeParse({ naturalDisaster: true });
    expect(result.success).toBe(true);
  });

  it('rejects naturalDisaster as a string', () => {
    const result = schema.patchHousingProject.body.safeParse({ naturalDisaster: 'No' });
    expect(result.success).toBe(false);
  });

  it('still enforces otherUnits when otherUnitsDescription is non-empty free text', () => {
    const result = schema.patchHousingProject.body.safeParse({ otherUnitsDescription: 'Houseboats' });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues.some((i) => i.message.match(/"otherUnits" is required/))).toBe(true);
  });

  it('still enforces rentalUnits when hasRentalUnits is Yes', () => {
    const result = schema.patchHousingProject.body.safeParse({ hasRentalUnits: 'Yes' });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues.some((i) => i.message.match(/"rentalUnits" is required/))).toBe(true);
  });

  it('still enforces indigenousDescription when financiallySupportedIndigenous is Yes', () => {
    const result = schema.patchHousingProject.body.safeParse({ financiallySupportedIndigenous: 'Yes' });
    expect(result.success).toBe(false);
    expect(
      !result.success && result.error.issues.some((i) => i.message.match(/"indigenousDescription" is required/))
    ).toBe(true);
  });

  it('still enforces nonProfitDescription when financiallySupportedNonProfit is Yes', () => {
    const result = schema.patchHousingProject.body.safeParse({ financiallySupportedNonProfit: 'Yes' });
    expect(result.success).toBe(false);
    expect(
      !result.success && result.error.issues.some((i) => i.message.match(/"nonProfitDescription" is required/))
    ).toBe(true);
  });

  it('still enforces housingCoopDescription when financiallySupportedHousingCoop is Yes', () => {
    const result = schema.patchHousingProject.body.safeParse({ financiallySupportedHousingCoop: 'Yes' });
    expect(result.success).toBe(false);
    expect(
      !result.success && result.error.issues.some((i) => i.message.match(/"housingCoopDescription" is required/))
    ).toBe(true);
  });

  it('rejects fields not in the patchable schema', () => {
    const result = schema.patchHousingProject.body.safeParse({ notARealField: true });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].message).toMatch(/Unrecognized key: "notARealField"/);
  });
});
