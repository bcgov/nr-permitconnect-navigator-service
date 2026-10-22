import { runSchema } from '../../helpers';
import { roadmapFormSchema } from '@/validators/roadmapFormSchema';

// Mocks

// Fixtures

const testForm = {
  from: 'nav@gov.bc.ca',
  to: ['a@b.co'],
  cc: [],
  bcc: ['bcc@gov.bc.ca'],
  subject: 'Subject',
  body: 'Body',
  bodyType: 'text'
};

// Mount

// Tests

describe('roadmapFormSchema', () => {
  it('accepts a well-formed email', async () => {
    expect(await runSchema(roadmapFormSchema, testForm)).toEqual({ value: testForm, errors: {} });
  });

  it('requires a recipient, a BCC, a subject and a body', async () => {
    expect(
      (await runSchema(roadmapFormSchema, { from: 'nav@gov.bc.ca', bodyType: 'text', to: '', bcc: '' })).errors
    ).toEqual({
      to: 'To is required',
      bcc: 'BCC is required',
      subject: 'Subject is a required field',
      body: 'Body is a required field'
    });
  });

  it('splits and trims separated addresses typed into a field', async () => {
    expect(
      (await runSchema(roadmapFormSchema, { ...testForm, to: ' a@b.co; c@d.co ,e@f.co', cc: 'g@h.co' })).value
    ).toMatchObject({ to: ['a@b.co', 'c@d.co', 'e@f.co'], cc: ['g@h.co'] });
  });

  // No assignee email and no configured BCC leaves the sender empty
  it.each(['', 'not-an-email'])('rejects a sender of %j', async (from) => {
    expect((await runSchema(roadmapFormSchema, { ...testForm, from })).errors).toEqual({
      from: 'The roadmap has no valid sender email'
    });
  });

  it('rejects invalid addresses', async () => {
    expect((await runSchema(roadmapFormSchema, { ...testForm, to: 'a@b.co; nope' })).errors).toEqual({
      'to.1': 'nope is not a valid email'
    });
  });
});
