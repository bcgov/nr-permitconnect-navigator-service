import { schema } from '#src/schemas/request/electrificationProject';

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
      basic: { projectName: 'Test', registeredName: 'Acme', projectDescription: 'desc' },
      project
    };
  }

  it('passes with a projectDescription', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse(validBody({ projectType: 'IPP_SOLAR' }));
    expect(result.success).toBe(true);
  });

  it.each([undefined, null, '', '  '])('requires projectDescription for any projectType (%j)', (projectDescription) => {
    const body = validBody({ projectType: 'IPP_SOLAR' });
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      ...body,
      basic: { ...body.basic, projectDescription }
    });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].path).toEqual(['basic', 'projectDescription']);
  });

  it('requires basic, contact, and project', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse({});
    expect(result.success).toBe(false);
  });

  it('requires registeredName on basic', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      contact: validContact,
      basic: { projectName: 'Test', projectDescription: 'desc' },
      project: { projectType: 'IPP_SOLAR' }
    });
    expect(result.success).toBe(false);
  });

  it('requires contactId on contact', () => {
    const contactWithoutId: Record<string, unknown> = { ...validContact };
    delete contactWithoutId.contactId;
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      contact: contactWithoutId,
      basic: { projectName: 'Test', registeredName: 'Acme', projectDescription: 'desc' },
      project: { projectType: 'IPP_SOLAR' }
    });
    expect(result.success).toBe(false);
  });

  it('requires contactPreference on contact', () => {
    const contactWithoutPreference: Record<string, unknown> = { ...validContact };
    delete contactWithoutPreference.contactPreference;
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      contact: contactWithoutPreference,
      basic: { projectName: 'Test', registeredName: 'Acme', projectDescription: 'desc' },
      project: { projectType: 'IPP_SOLAR' }
    });
    expect(result.success).toBe(false);
  });

  it('rejects unrecognized fields on contact', () => {
    const result = schema.submitElectrificationProjectDraft.body.safeParse({
      contact: { ...validContact, notARealField: true },
      basic: { projectName: 'Test', registeredName: 'Acme', projectDescription: 'desc' },
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

  it.each([null, '', '  '])('rejects clearing projectDescription (%j)', (projectDescription) => {
    const result = schema.patchElectrificationProject.body.safeParse({ projectDescription });
    expect(result.success).toBe(false);
  });
});
