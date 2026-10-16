import { runSchema, t } from '../../helpers';
import { createEnquiryFormSchema } from '@/validators/enquiryFormSchema';
import { ApplicationStatus, EnquirySubmittedMethod, SubmissionType } from '@/utils/enums/projectCommon';

// Mocks

// Fixtures

const ENQUIRY_TYPES = 'Assistance, General enquiry, Status request, Escalation, Inapplicable';

const testForm = {
  contact: { email: 'a@b.co', firstName: 'First' },
  enquiryDescription: 'Description',
  addedToAts: false,
  submissionState: {
    assignedUser: null,
    enquiryStatus: ApplicationStatus.NEW,
    submissionType: SubmissionType.GENERAL_ENQUIRY,
    submittedMethod: EnquirySubmittedMethod.EMAIL
  }
};

// Mount

const schema = createEnquiryFormSchema({ t });

// Tests

describe('createEnquiryFormSchema', () => {
  it('accepts a well-formed enquiry', async () => {
    const { value, errors } = await runSchema(schema, testForm);

    expect(errors).toEqual({});
    expect(value).toMatchObject(testForm);
  });

  it('reports every required field on an empty form', async () => {
    expect((await runSchema(schema, {})).errors).toEqual({
      'contact.email': 'Contact email is a required field',
      'contact.firstName': 'Contact first name is a required field',
      enquiryDescription: 'Enquiry detail is a required field',
      addedToAts: 'Authorized Tracking System (ATS) updated is a required field',
      'submissionState.assignedUser': 'Assigned to must be empty or a selected user'
    });
  });

  // Nothing trims, so whitespace satisfies required
  it('accepts a blank related submission and a whitespace-only description', async () => {
    expect((await runSchema(schema, { ...testForm, relatedActivityId: '', enquiryDescription: '  ' })).errors).toEqual(
      {}
    );
  });

  it('rejects malformed values', async () => {
    expect(
      (
        await runSchema(schema, {
          ...testForm,
          relatedActivityId: 'a'.repeat(256),
          addedToAts: null,
          atsInfo: { atsClientId: -1, atsEnquiryId: 'abc' },
          submissionState: { assignedUser: 'typed', submittedMethod: 'x', submissionType: '', enquiryStatus: 'x' }
        })
      ).errors
    ).toEqual({
      relatedActivityId: 'Related submission must be at most 255 characters',
      addedToAts: 'Authorized Tracking System (ATS) updated is a required field',
      'atsInfo.atsClientId': 'ATS Client # must be greater than or equal to 0',
      'atsInfo.atsEnquiryId': 'ATS enquiry # must be a number',
      'submissionState.assignedUser': 'Assigned to must be empty or a selected user',
      'submissionState.submittedMethod': 'Submitted method must be one of the following values: Email, PCNS, Phone',
      'submissionState.submissionType': `Submission type must be one of the following values: ${ENQUIRY_TYPES}`,
      'submissionState.enquiryStatus':
        'Activity state must be one of the following values: New, In Progress, Delayed, Completed'
    });
  });

  // Matches the navigator panel and the API, which both reject these
  it.each([
    [-1, 'ATS enquiry # must be greater than or equal to 0'],
    [1.5, 'ATS enquiry # must be an integer']
  ])('rejects an ATS enquiry # of %j', async (atsEnquiryId, message) => {
    expect((await runSchema(schema, { ...testForm, atsInfo: { atsClientId: null, atsEnquiryId } })).errors).toEqual({
      'atsInfo.atsEnquiryId': message
    });
  });

  it('casts numeric ATS ids', async () => {
    expect(
      (await runSchema(schema, { ...testForm, atsInfo: { atsClientId: '12', atsEnquiryId: '34' } })).value
    ).toEqual(expect.objectContaining({ atsInfo: { atsClientId: 12, atsEnquiryId: 34 } }));
  });

  // Submit handlers spread the whole form, so keys outside the schema must survive parsing
  it('passes unknown keys through', async () => {
    const form = { ...testForm, extra: true };

    expect((await runSchema(schema, form)).value).toMatchObject(form);
  });
});
