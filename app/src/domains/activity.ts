import { randomUUID } from 'node:crypto';

import { ActivityContactRole } from '#src/utils/enums/projectCommon';

import type { Repositories } from '#src/db/unitOfWork';
import type { Activity, CurrentContext } from '#types';
import type { Initiative } from '#src/utils/enums/application';

/**
 * Create an activity for the given initiative with a unique identifier
 * @param repositories - The required repositories
 * @param initiative - The initiative code the activity will belong to
 * @returns A Promise that resolves to the created activity
 */
export const createActivity = async (
  repositories: Pick<Repositories, 'activity' | 'initiative'>,
  initiative: Initiative
): Promise<Activity> => {
  // Generate a new unique activity ID
  let id, queryResult;

  do {
    id = randomUUID().substring(0, 8).toUpperCase();
    queryResult = await repositories.activity.findUnique({
      where: { activityId: id },
      select: { activityId: true }
    });
  } while (queryResult);

  // Create the activity
  const initiativeResult = await repositories.initiative.findFirstOrThrow({ where: { code: initiative } });

  const response = await repositories.activity.create({
    activityId: id,
    initiativeId: initiativeResult.initiativeId
  });

  return response;
};

/**
 * Reuses an existing activity ID if given, otherwise creates a new activity and links the current
 * user's contact to it as the primary contact. Consolidates the create-activity-then-link-contact
 * sequence duplicated across the project/enquiry intake domains.
 * @param repositories - The required repositories
 * @param initiative - The initiative code the activity will belong to
 * @param currentContext - The current context of the request
 * @param existingActivityId - An activity ID to reuse (e.g. a draft that already has one), if any
 * @returns The activity ID, new or reused
 */
export const ensureActivityWithPrimaryContact = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  initiative: Initiative,
  currentContext: CurrentContext,
  existingActivityId?: string | null
): Promise<string> => {
  if (existingActivityId) return existingActivityId;

  const [activity, contacts] = await Promise.all([
    createActivity({ activity: repositories.activity, initiative: repositories.initiative }, initiative),
    repositories.contact.search({ userId: [currentContext.userId!] })
  ]);

  const activityId = activity?.activityId;
  if (!activityId) throw new Error('Failed to generate activity ID');

  if (contacts[0]) {
    await repositories.activityContact.create({
      activityId,
      contactId: contacts[0].contactId,
      role: ActivityContactRole.PRIMARY
    });
  }

  return activityId;
};

/**
 * Soft or hard delete an activity
 * Soft delete will cascade soft deletes by manually calling each repository
 * Hard delete utilizes set DB cascades
 * @param repositories - The required repositories
 * @param activityId - Unique activity ID
 * @param options - Optional delete operation parameters
 * @param options.hard - Force a hard delete of data in the database
 */
export const deleteActivity = async (
  repositories: Pick<
    Repositories,
    | 'activity'
    | 'activityContact'
    | 'document'
    | 'electrificationProject'
    | 'enquiry'
    | 'generalProject'
    | 'housingProject'
    | 'note'
    | 'noteHistory'
    | 'permit'
    | 'permitNote'
    | 'permitTracking'
  >,
  activityId: string,
  options?: { hard?: boolean }
): Promise<void> => {
  await repositories.activity.delete({ activityId, deletedAt: null }, options);

  if (!options?.hard) {
    await repositories.activityContact.deleteMany({ activityId, deletedAt: null });
    await repositories.document.deleteMany({ activityId, deletedAt: null });
    await repositories.electrificationProject.deleteMany({ activityId, deletedAt: null });
    await repositories.enquiry.deleteMany({ activityId, deletedAt: null });
    await repositories.generalProject.deleteMany({ activityId, deletedAt: null });
    await repositories.housingProject.deleteMany({ activityId, deletedAt: null });
    await repositories.noteHistory.deleteMany({ activityId, deletedAt: null });
    await repositories.permit.deleteMany({ activityId, deletedAt: null });

    const deletedNotes = (
      await repositories.noteHistory.findMany(
        { where: { activityId }, select: { noteHistoryId: true } },
        { includeDeleted: true }
      )
    ).map((x) => x.noteHistoryId);
    const deletedPermits = (
      await repositories.permit.findMany(
        { where: { activityId }, select: { permitId: true } },
        { includeDeleted: true }
      )
    ).map((x) => x.permitId);

    await repositories.note.deleteMany({
      noteHistoryId: { in: deletedNotes },
      deletedAt: null
    });
    await repositories.permitNote.deleteMany({
      permitId: { in: deletedPermits },
      deletedAt: null
    });
    await repositories.permitTracking.deleteMany({
      permitId: { in: deletedPermits },
      deletedAt: null
    });
  }
};
