import { v4 as uuidv4 } from 'uuid';

import { unitOfWork } from '../repository/unitOfWork.ts';
import { BringForwardType } from '../utils/enums/projectCommon.ts';
import { GroupName, Initiative, Resource } from '../utils/enums/application.ts';

import type {
  BringForward,
  CurrentAuthorization,
  CurrentContext,
  NoteHistory,
  NoteHistoryBase
} from '../types/index.ts';
import { SYSTEM_ID } from '../utils/constants/application.ts';
import { emailBringForwardNotification } from '../domains/noteHistory.ts';

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
      noteHistoryId: uuidv4()
    });

    const noteResult = await note.create({
      noteId: uuidv4(),
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
 * @param initiative The initiative for which the note history belongs to
 * @param state The state to search for
 * @returns A Promise that resolves to the note histories for the given parameters
 */
export const listBringForwardsService = async (
  initiative: Initiative,
  state: BringForwardType = BringForwardType.UNRESOLVED
): Promise<BringForward[]> => {
  return await unitOfWork.execute(
    async ({ electrificationProject, enquiry, generalProject, housingProject, noteHistory, user }) => {
      const history = await noteHistory.findMany({
        where: {
          bringForwardState: state,
          activity: {
            initiative: {
              code: initiative
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          note: { orderBy: { createdAt: 'desc' } }
        }
      });

      if (history.length) {
        const [elecProj, generalProj, housingProj] = await Promise.all([
          electrificationProject.search({
            activityId: history.map((x) => x.activityId)
          }),
          generalProject.search({
            activityId: history.map((x) => x.activityId)
          }),
          housingProject.search({
            activityId: history.map((x) => x.activityId)
          })
        ]);

        const users = await user.findMany({
          where: {
            AND: [
              {
                userId: {
                  in: history
                    .map((x) => x.createdBy)
                    .filter((x) => !!x)
                    .map((x) => x!)
                }
              }
            ],
            NOT: [
              {
                userId: SYSTEM_ID
              }
            ]
          }
        });

        const enquiries = (
          await Promise.all([
            enquiry.search(
              {
                activityId: history.map((x) => x.activityId)
              },
              Initiative.ELECTRIFICATION
            ),
            enquiry.search(
              {
                activityId: history.map((x) => x.activityId)
              },
              Initiative.GENERAL
            ),
            enquiry.search(
              {
                activityId: history.map((x) => x.activityId)
              },
              Initiative.HOUSING
            )
          ])
        ).flatMap((x) => x);

        return history.map((h) => ({
          activityId: h.activityId,
          noteId: h.noteHistoryId,
          electrificationProjectId: elecProj.find((s) => s.activityId === h.activityId)?.electrificationProjectId,
          generalProjectId: generalProj.find((s) => s.activityId === h.activityId)?.generalProjectId,
          housingProjectId: housingProj.find((s) => s.activityId === h.activityId)?.housingProjectId,
          enquiryId: enquiries.find((s) => s.activityId === h.activityId)?.enquiryId,
          title: h.title,
          projectName:
            elecProj.find((s) => s.activityId === h.activityId)?.projectName ??
            generalProj.find((s) => s.activityId === h.activityId)?.projectName ??
            housingProj.find((s) => s.activityId === h.activityId)?.projectName ??
            null,
          createdByFullName: users.find((u) => u?.userId === h.createdBy)?.fullName ?? null,
          bringForwardDate: h.bringForwardDate?.toISOString(),
          escalateToSupervisor: h.escalateToSupervisor,
          escalateToDirector: h.escalateToDirector
        }));
      } else {
        return [];
      }
    }
  );
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
    const result = await noteHistory.findMany({
      where: {
        activityId: activityId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        note: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (currentAuthorization?.attributes.includes('scope:self')) {
      return result.filter((x) => x.shownToProponent);
    } else {
      return result;
    }
  });
};

/**
 * Update a note history
 * @param currentAuthorization - The authorization of the current authorized user
 * @param currentContext - Context data of current request
 * @param data - The note history to update
 * @param noteStr - Optional string to be added as a note
 * @param resource - The type of Resource the note history belongs to
 * @returns A Promise that resolves to the updated resource
 */
export const updateNoteHistoryService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  data: NoteHistoryBase,
  noteStr: string | undefined,
  resource: Resource
): Promise<NoteHistory> => {
  return await unitOfWork.execute(
    async ({ electrificationProject, generalProject, housingProject, note, noteHistory, subjectGroup, user }) => {
      await noteHistory.update(
        {
          noteHistoryId: data.noteHistoryId
        },
        data
      );

      if (note) {
        await note.create({
          noteHistoryId: data.noteHistoryId,
          noteId: uuidv4(),
          note: noteStr
        });
      }

      const response = await noteHistory.findFirstOrThrow({ where: { noteHistoryId: data.noteHistoryId } });

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
