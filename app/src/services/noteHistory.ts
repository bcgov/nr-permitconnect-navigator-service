import { randomUUID } from 'node:crypto';

import { unitOfWork } from '#src/db/unitOfWork';
import { emailBringForwardNotification } from '#src/domains/noteHistory';
import { GroupName } from '#src/utils/enums/application';
import { BringForwardType } from '#src/utils/enums/projectCommon';

import type {
  BringForward,
  CurrentAuthorization,
  CurrentContext,
  NoteHistory,
  NoteHistoryBase,
  PatchNoteHistoryRequest
} from '#types';
import type { Initiative, Resource } from '#src/utils/enums/application';

/**
 * Create a note history
 * @param data - The note history object to create
 * @param noteStr - String to be given as the initial note
 * @returns A Promise that resolves to the created resource
 */
export const createNoteHistoryService = async (data: NoteHistoryBase, noteStr: string): Promise<NoteHistory> => {
  return await unitOfWork.execute(async ({ note, noteHistory }) => {
    const historyResult = await noteHistory.create({
      ...data,
      noteHistoryId: randomUUID()
    });

    const noteResult = await note.create({
      noteId: randomUUID(),
      noteHistoryId: historyResult.noteHistoryId,
      note: noteStr
    });

    return { ...historyResult, note: [noteResult] };
  });
};

/**
 * Deletes a note history
 * @param noteHistoryId The ID of the note history to delete
 * @returns A promise that resolves when the operation is complete
 */
export const deleteNoteHistoryService = async (noteHistoryId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ noteHistory, note }) => {
    await noteHistory.delete({
      noteHistoryId
    });

    await note.deleteMany({ noteHistoryId });
  });
};

/**
 * Retrieve a list of bring forward type note histories by the given state
 * @param initiativeCode The initiative for which the note history belongs to
 * @param state The state to search for
 * @returns A Promise that resolves to the note histories for the given parameters
 */
export const listBringForwardsService = async (
  initiativeCode: Exclude<Initiative, Initiative.PCNS> | undefined,
  state: BringForwardType = BringForwardType.UNRESOLVED
): Promise<BringForward[]> => {
  return await unitOfWork.execute(async ({ noteHistory, user }) => {
    const history = await noteHistory.listBringForwards(initiativeCode, state);

    if (history.length) {
      const users = await user.search({
        userId: history
          .map((x) => x.createdBy)
          .filter((x) => !!x)
          .map((x) => x!)
      });

      return history.map((h) => {
        const project = h.activity.housingProject ?? h.activity.generalProject ?? h.activity.electrificationProject;

        return {
          activityId: h.activityId,
          noteHistoryId: h.noteHistoryId,
          projectId: project?.projectId,
          enquiryId: h.activity.enquiry?.find((e) => e.activityId === h.activityId)?.enquiryId,
          initiative: initiativeCode,
          title: h.title,
          projectName: project?.projectName ?? null,
          createdByFullName: users.find((u) => u?.userId === h.createdBy)?.fullName ?? null,
          bringForwardDate: h.bringForwardDate?.toISOString(),
          escalateToSupervisor: h.escalateToSupervisor,
          escalateToDirector: h.escalateToDirector
        } satisfies BringForward;
      });
    } else {
      return [];
    }
  });
};

/**
 * Get all note histories for the given activity
 * @param currentAuthorization - The authorization of the current authorized user
 * @param activityId - The ID of the activity the note histories belong to
 * @returns A Promise that resolves to a list of note histories
 */
export const listNoteHistoriesService = async (
  currentAuthorization: CurrentAuthorization,
  activityId: string
): Promise<NoteHistory[]> => {
  return await unitOfWork.execute(async ({ noteHistory }) => {
    const result = await noteHistory.listNoteHistories(activityId);

    if (currentAuthorization?.attributes.includes('scope:self')) {
      return result.filter((x) => x.shownToProponent);
    } else {
      return result;
    }
  });
};

/**
 * Patches a note history
 * @param noteHistoryId - ID of the note history to update
 * @param currentAuthorization - The authorization of the current authorized user
 * @param currentContext - Context data of current request
 * @param data - The note history fields to update
 * @param noteStr - Optional string to be added as a note
 * @param resource - Control-flow flag identifying which project/enquiry type the note history belongs to;
 *   not a persisted note_history column, only used to route the bring-forward notification email
 * @returns A Promise that resolves to the updated resource
 */
export const patchNoteHistoryService = async (
  noteHistoryId: string,
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  data: Omit<PatchNoteHistoryRequest, 'noteHistoryId' | 'note' | 'resource'>,
  noteStr: string | undefined,
  resource: Resource
): Promise<NoteHistory> => {
  return await unitOfWork.execute(
    async ({ electrificationProject, generalProject, housingProject, note, noteHistory, subjectGroup, user }) => {
      await noteHistory.update({ noteHistoryId }, data);

      if (noteStr) {
        await note.create({
          noteHistoryId,
          noteId: randomUUID(),
          note: noteStr
        });
      }

      const response = await noteHistory.findFirstOrThrow({ where: { noteHistoryId } });

      const isNavigator = !!currentAuthorization?.groups.some((group) => group.name === GroupName.NAVIGATOR);
      if (isNavigator)
        await emailBringForwardNotification(
          { electrificationProject, generalProject, housingProject, subjectGroup, user },
          response,
          currentContext.initiative,
          resource
        );

      return response;
    }
  );
};
