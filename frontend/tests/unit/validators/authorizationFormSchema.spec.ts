import { runSchema, t } from '../../helpers';
import { createAuthorizationFormSchema } from '@/validators/authorizationFormSchema';
import { PermitStage, PermitState } from '@/utils/enums/codeEnums';
import { PermitNeeded } from '@/utils/enums/permit';

// Mocks

// Fixtures

const NOW = new Date('2026-06-15T12:00:00.000Z');
const NOTE_REQUIRED = 'The status of this application has changed. Please add an update for the proponent.';

const initial = { stage: PermitStage.PRE_SUBMISSION, state: PermitState.NONE };

const testForm = {
  authorizationType: { permitTypeId: 1 },
  needed: PermitNeeded.YES,
  stage: PermitStage.PRE_SUBMISSION,
  state: PermitState.NONE
};

const inReview = { ...testForm, stage: PermitStage.TECHNICAL_REVIEW, state: PermitState.IN_PROGRESS };

// Mount

const schema = createAuthorizationFormSchema({ t }, initial);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

// Tests

describe('createAuthorizationFormSchema', () => {
  it('accepts a well-formed authorization and passes unknown keys through', async () => {
    const form = { ...testForm, createdBy: 'me' };

    expect(await runSchema(schema, form)).toEqual({ value: form, errors: {} });
  });

  it('reports every required field on an empty form', async () => {
    expect((await runSchema(schema, {})).errors).toEqual({
      authorizationType: 'Authorization type is a required field',
      needed: 'Needed is a required field',
      permitNote: NOTE_REQUIRED,
      stage: 'Application stage is a required field',
      state: 'Authorization status is a required field'
    });
  });

  describe('permit note', () => {
    it('is required once the stage or state changes', async () => {
      expect((await runSchema(schema, inReview)).errors).toEqual({ permitNote: NOTE_REQUIRED });
      expect((await runSchema(schema, { ...inReview, permitNote: '' })).errors).toEqual({ permitNote: NOTE_REQUIRED });
      expect((await runSchema(schema, { ...inReview, permitNote: 'Update' })).errors).toEqual({});
    });

    it('is not required for a new authorization opened without a stage or state', async () => {
      expect((await runSchema(createAuthorizationFormSchema({ t }), {})).errors).not.toHaveProperty('permitNote');
    });
  });

  it('rejects invalid needed, status and stage combinations', async () => {
    expect(
      (await runSchema(schema, { ...inReview, needed: PermitNeeded.UNDER_INVESTIGATION, permitNote: 'n' })).errors
    ).toEqual({ needed: t('authorization.authorizationForm.neededCondition') });
    expect(
      (await runSchema(schema, { ...testForm, stage: PermitStage.TECHNICAL_REVIEW, permitNote: 'n' })).errors
    ).toEqual({ state: 'Invalid status and stage combination' });
  });

  it('rejects malformed values', async () => {
    expect(
      (
        await runSchema(schema, {
          ...testForm,
          authorizationType: 'x',
          needed: 'x',
          permitTracking: [{ trackingId: 'a'.repeat(256) }],
          decisionDate: new Date(NOW.getTime() + 1000),
          statusLastVerified: 'nope',
          targetDate: 'nope',
          technicalReviewer: 'a'.repeat(256)
        })
      ).errors
    ).toEqual({
      authorizationType: 'Authorization type is a required field',
      needed: 'Needed must be one of the following values: Yes, Under investigation, No',
      'permitTracking.0.trackingId': 'Tracking ID must be at most 255 characters',
      decisionDate: 'Date cannot be in the future',
      statusLastVerified: 'Status last verified must be a valid date',
      targetDate: 'Target date must be a valid date',
      technicalReviewer: 'Technical reviewer must be at most 255 characters'
    });
  });

  it('casts dates and tracking ids, and defaults shownToProponent', async () => {
    expect(
      (
        await runSchema(schema, {
          ...testForm,
          submittedDate: '2020-01-01',
          targetDate: new Date(NOW.getTime() + 1000),
          permitTracking: [{ sourceSystemKindId: '3', trackingId: 'T1' }]
        })
      ).value
    ).toMatchObject({
      submittedDate: new Date('2020-01-01T00:00'),
      targetDate: new Date(NOW.getTime() + 1000),
      permitTracking: [{ sourceSystemKindId: 3, trackingId: 'T1', shownToProponent: false }]
    });
  });
});
