import { z } from 'zod';

import { BRING_FORWARD_TYPE_LIST, NOTE_TYPE_LIST } from '@/utils/constants/projectCommon';
import { NoteType } from '@/utils/enums/projectCommon';
import { isOneOf } from '@/utils/utils';
import { addIssue, evenWithIssues, oneOfMessage, requiredString } from '@/utils/zodSchema';

import type { CreateSchemaOptions } from '@/types';
import type { FormValues } from '@/utils/zodSchema';

export function createNoteFormSchema({ t }: Pick<CreateSchemaOptions, 't'>) {
  // Loose so submit handlers still receive form fields the schema doesn't declare
  return z
    .looseObject({
      bringForwardDate: z.unknown().optional(),
      bringForwardState: z.unknown().optional(),
      noteHistoryId: z.string().optional(),
      note: z.string().nullish(),
      type: z.enum(NOTE_TYPE_LIST as [NoteType, ...NoteType[]], oneOfMessage('Note type', NOTE_TYPE_LIST)).optional(),
      title: requiredString('Title').max(255, t('note.noteForm.titleLong')),
      escalateToDirector: z.boolean().optional(),
      escalateToSupervisor: z.boolean().optional(),
      escalationType: z.unknown().optional()
    })
    .superRefine((note, ctx) => {
      if (note.noteHistoryId === undefined && !note.note) {
        addIssue(ctx, 'note', t('note.noteForm.noteReqd'));
      }

      if (note.type === NoteType.BRING_FORWARD) {
        if (note.bringForwardDate == null) {
          addIssue(ctx, 'bringForwardDate', t('note.noteForm.bfDateReqd'));
        }
        if (note.bringForwardState !== undefined && !isOneOf(BRING_FORWARD_TYPE_LIST, note.bringForwardState)) {
          addIssue(ctx, 'bringForwardState', oneOfMessage('Bring forward state', BRING_FORWARD_TYPE_LIST));
        }
      }

      if ((note.escalateToSupervisor || note.escalateToDirector) && note.escalationType == null) {
        addIssue(ctx, 'escalationType', t('note.noteForm.escalationTypeReqd'));
      }
    }, evenWithIssues);
}

export type FormSchemaType = FormValues<z.infer<ReturnType<typeof createNoteFormSchema>>>;
