import { runSchema, t } from '../../helpers';
import { createNoteFormSchema } from '@/validators/noteFormSchema';
import { BringForwardType, NoteType } from '@/utils/enums/projectCommon';

// Mocks

// Fixtures

const testNote = { title: 'Title', note: 'Note', type: NoteType.GENERAL };

const testBringForward = {
  ...testNote,
  type: NoteType.BRING_FORWARD,
  bringForwardDate: new Date('2026-01-01'),
  bringForwardState: BringForwardType.UNRESOLVED
};

// Mount

const schema = createNoteFormSchema({ t });

// Tests

describe('createNoteFormSchema', () => {
  it('accepts a well-formed note', async () => {
    expect(await runSchema(schema, testNote)).toEqual({ value: testNote, errors: {} });
  });

  it('requires a title and, for a new note, the note text', async () => {
    expect((await runSchema(schema, {})).errors).toEqual({
      note: 'Note is a required field',
      title: 'Title is a required field'
    });
    expect((await runSchema(schema, { ...testNote, title: '', note: '' })).errors).toEqual({
      note: 'Note is a required field',
      title: 'Title is a required field'
    });
  });

  // Nothing trims, so whitespace satisfies required
  it('accepts whitespace-only title and note', async () => {
    const note = { ...testNote, title: '  ', note: '  ' };

    expect(await runSchema(schema, note)).toEqual({ value: note, errors: {} });
  });

  it('does not require note text when editing an existing note', async () => {
    expect((await runSchema(schema, { title: 'Title', noteHistoryId: 'abc' })).errors).toEqual({});
  });

  it('rejects a long title and an unknown type', async () => {
    expect((await runSchema(schema, { ...testNote, title: 'a'.repeat(256), type: 'x' })).errors).toEqual({
      title: 'Title too long',
      type: 'Note type must be one of the following values: General, Bring forward, Roadmap'
    });
  });

  // Submit handlers spread the whole form, so keys outside the schema must survive parsing
  it('passes unknown keys through', async () => {
    const note = { ...testNote, shownToProponent: true };

    expect(await runSchema(schema, note)).toEqual({ value: note, errors: {} });
  });

  describe('bring forward', () => {
    it('accepts a well-formed bring forward', async () => {
      expect(await runSchema(schema, testBringForward)).toEqual({ value: testBringForward, errors: {} });
    });

    it.each([undefined, null])('requires a bring forward date, rejecting %j', async (bringForwardDate) => {
      expect((await runSchema(schema, { ...testBringForward, bringForwardDate })).errors).toEqual({
        bringForwardDate: 'Bring forward date is a required field'
      });
    });

    it('rejects an unknown bring forward state', async () => {
      expect((await runSchema(schema, { ...testBringForward, bringForwardState: 'x' })).errors).toEqual({
        bringForwardState: 'Bring forward state must be one of the following values: Unresolved, Resolved'
      });
    });

    it('does not check bring forward fields on other note types', async () => {
      expect(
        (await runSchema(schema, { ...testNote, bringForwardDate: 'garbage', bringForwardState: 'x' })).errors
      ).toEqual({});
    });
  });

  describe('escalation', () => {
    it.each([{ escalateToSupervisor: true }, { escalateToDirector: true }])(
      'requires an escalation type when %j',
      async (escalation) => {
        expect((await runSchema(schema, { ...testNote, ...escalation })).errors).toEqual({
          escalationType: 'Escalation type is a required field'
        });
      }
    );

    it('rejects a null escalation type but accepts an empty string', async () => {
      expect(
        (await runSchema(schema, { ...testNote, escalateToSupervisor: true, escalationType: null })).errors
      ).toEqual({ escalationType: 'Escalation type is a required field' });
      expect((await runSchema(schema, { ...testNote, escalateToSupervisor: true, escalationType: '' })).errors).toEqual(
        {}
      );
    });

    // Checkboxes only emit booleans, so strings are no longer cast
    it('rejects non-boolean escalation flags', async () => {
      expect(Object.keys((await runSchema(schema, { ...testNote, escalateToSupervisor: 'true' })).errors)).toEqual([
        'escalateToSupervisor',
        'escalationType'
      ]);
    });

    it('accepts an escalation type without escalation', async () => {
      expect((await runSchema(schema, { ...testNote, escalationType: 'Any' })).errors).toEqual({});
    });
  });
});
