import { schema } from '#src/validators/electrificationProject';

describe('createElectrificationProject validator', () => {
  it('accepts an empty body', () => {
    const result = schema.createElectrificationProject.body.safeParse({});
    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({});
  });

  it('rejects unrecognized fields', () => {
    const result = schema.createElectrificationProject.body.safeParse({ notARealField: true });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].message).toMatch(/Unrecognized key: "notARealField"/);
  });
});

describe('submitElectrificationProjectDraft validator', () => {
  const validContact = {
    contactId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    email: 'test@example.com',
    firstName: 'Jane',
    phoneNumber: '778-555-1234',
    contactApplicantRelationship: 'Property owner',
    contactPreference: 'Email'
  };

  function validBody(project: Record<string, unknown>) {
    return {
      contact: validContact,
      basic: { projectName: 'Test', registeredName: 'Acme' },
      project
    };
  }

  it('requires projectDescription when projectType is OTHER', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse(validBody({ projectType: 'OTHER' }));
    expect(result.success).toBe(false);
    expect(
      !result.success && result.error.issues.some((i) => i.message.match(/"projectDescription" is required/))
    ).toBe(true);
  });

  it('passes when projectType is OTHER and projectDescription is provided', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      contact: validContact,
      basic: { projectName: 'Test', registeredName: 'Acme', projectDescription: 'desc' },
      project: { projectType: 'OTHER' }
    });
    expect(result.success).toBe(true);
  });

  it('does not require projectDescription for a non-OTHER projectType', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse(validBody({ projectType: 'IPP_SOLAR' }));
    expect(result.success).toBe(true);
  });

  it('requires basic, contact, and project', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse({});
    expect(result.success).toBe(false);
  });

  it('requires registeredName on basic', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      contact: validContact,
      basic: { projectName: 'Test' },
      project: { projectType: 'IPP_SOLAR' }
    });
    expect(result.success).toBe(false);
  });

  it('requires contactId on contact', () => {
    const contactWithoutId: Record<string, unknown> = { ...validContact };
    delete contactWithoutId.contactId;
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      contact: contactWithoutId,
      basic: { projectName: 'Test', registeredName: 'Acme' },
      project: { projectType: 'IPP_SOLAR' }
    });
    expect(result.success).toBe(false);
  });

  it('requires contactPreference on contact', () => {
    const contactWithoutPreference: Record<string, unknown> = { ...validContact };
    delete contactWithoutPreference.contactPreference;
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      contact: contactWithoutPreference,
      basic: { projectName: 'Test', registeredName: 'Acme' },
      project: { projectType: 'IPP_SOLAR' }
    });
    expect(result.success).toBe(false);
  });

  it('rejects unrecognized fields on contact', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      contact: { ...validContact, notARealField: true },
      basic: { projectName: 'Test', registeredName: 'Acme' },
      project: { projectType: 'IPP_SOLAR' }
    });
    expect(result.success).toBe(false);
  });
});

describe('patchElectrificationProject validator', () => {
  it('passes with an empty body', () => {
    const result = schema.patchElectrificationProject.body.safeParse({});
    expect(result.success).toBe(true);
  });

  it('passes with a single partial field', () => {
    const result = schema.patchElectrificationProject.body.safeParse({ projectName: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('passes without addedToAts (optional)', () => {
    const result = schema.patchElectrificationProject.body.safeParse({ queuePriority: 1 });
    expect(result.success).toBe(true);
  });

  it('still requires projectDescription when projectType is OTHER', () => {
    const result = schema.patchElectrificationProject.body.safeParse({ projectType: 'OTHER' });
    expect(result.success).toBe(false);
    expect(
      !result.success && result.error.issues.some((i) => i.message.match(/"projectDescription" is required/))
    ).toBe(true);
  });
});
