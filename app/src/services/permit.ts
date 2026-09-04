import { randomUUID } from 'node:crypto';

import { PermitStage, PermitState } from '#src/db/codes/enums';
import { unitOfWork } from '#src/db/unitOfWork';
import { findPriorityPermitTracking } from '#src/domains/peach';
import { buildNewPermitRecord, sendPermitUpdateNotifications } from '#src/domains/permit';
import { upsertPermitTracking } from '#src/domains/permitTracking';
import { getPeachRecord } from '#src/external/peach';
import { summarizePeachRecord } from '#src/parsers/peach';
import { filterActivityResponseByScope } from '#src/parsers/responseFiltering';
import { PermitNeeded } from '#src/utils/enums/permit';
import Problem from '#src/utils/problem';
import { differential, isEmptyObject } from '#src/utils/utils';

import type {
  CurrentAuthorization,
  CurrentContext,
  IntakePermitInput,
  ListPermitsInput,
  Permit,
  PermitTracking,
  PermitTrackingUpsertInput,
  SearchPermitsInput,
  SearchPermitsResponse,
  SourceSystemKind,
  UpsertPermitBodyInput,
  UpsertPermitInput
} from '#types';
import type { Initiative } from '#src/utils/enums/application';

function checkIfPeachIntegratedAuthType(sourceSystem: string, sourceSystemKinds: SourceSystemKind[]): boolean {
  const hasIntegratedSourceSystemKind = sourceSystemKinds.some(
    (ssk) => ssk.integrated && ssk.sourceSystem === sourceSystem
  );
  return hasIntegratedSourceSystemKind;
}

const snapshotPermitStatus = (p: Partial<Permit>) => ({
  state: p.state,
  stage: p.stage,
  decisionDate: p.decisionDate,
  submittedDate: p.submittedDate,
  statusLastChanged: p.statusLastChanged
});

/**
 * Delete a specific permit.
 * @param permitId - ID of the permit to delete.
 * @returns A promise that resolves when the operation is complete.
 */
export const deletePermitService = async (permitId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ permit, permitNote, permitTracking }) => {
    await permit.delete({
      permitId
    });

    await permitNote.deleteMany({
      permitId
    });

    await permitTracking.deleteMany({
      permitId
    });
  });
};

/**
 * Gets a specific permit
 * @param permitId Permit ID
 * @returns A Promise that resolves to the specific permit
 */
export const getPermitService = async (permitId: string): Promise<Permit> => {
  return await unitOfWork.execute(async ({ permit }) => {
    return await permit.findFirstOrThrow({
      where: {
        permitId: permitId
      },
      include: {
        permitType: true,
        permitNote: { orderBy: { createdAt: 'desc' } },
        permitTracking: { include: { sourceSystemKind: true } }
      }
    });
  });
};

export const intakePermitService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  data: IntakePermitInput[]
): Promise<Permit[]> => {
  return await unitOfWork.execute(async ({ activityContact, permit, permitTracking }) => {
    // Validate the calling user is a delegate for every activity in the permit request list
    // if the calling user has `scope:self`
    if (currentAuthorization?.attributes.includes('scope:self')) {
      const userActivities = (
        await activityContact.findMany({
          where: {
            contact: { user: { userId: currentContext.userId! } }
          },
          select: { activityId: true }
        })
      ).map((x) => x.activityId);

      const permitActivities = data.map((x: IntakePermitInput) => x.activityId);

      if (!permitActivities.every((activityId) => userActivities.includes(activityId))) {
        throw new Problem(403, {
          detail: 'User is not a delegate for one or more activities in the permit request list'
        });
      }
    }

    // Build new permit and tracking ID arrays
    const appliedPermitTrackers: PermitTrackingUpsertInput[] = [];

    const appliedPermits = data.map((x: IntakePermitInput) => {
      const permitId = randomUUID();

      // Add each tracker for this permit with the proper permitId
      if (x.trackingId) appliedPermitTrackers.push({ trackingId: x.trackingId, permitId } as PermitTrackingUpsertInput);

      return buildNewPermitRecord({
        permitId,
        permitTypeId: x.permitTypeId,
        activityId: x.activityId,
        stage: PermitStage.APPLICATION_SUBMISSION,
        needed: PermitNeeded.YES,
        state: PermitState.IN_PROGRESS,
        submittedDate: x.submittedDate
      });
    });

    // Create each permit and tracking IDs
    await Promise.all(appliedPermits.map(async (p) => permit.upsert({ permitId: p.permitId }, p, p)));
    await Promise.all(appliedPermitTrackers.map(async (pt) => upsertPermitTracking({ permitTracking }, pt)));

    return permit.findMany({ where: { permitId: { in: appliedPermits.map((x) => x.permitId) } } });
  });
};

/**
 * Retrieve all permits if no activityId is provided, otherwise retrieve permits for a specific activity
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @param options Optional filtering parameters
 * @param options.activityId Optional PCNS Activity ID
 * @param options.includeNotes Optional flag to include permit notes
 * @returns A Promise that resolves to an array of permits
 */
export const listPermitsService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  options?: ListPermitsInput
): Promise<Permit[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, permit }) => {
    const result = await permit.findMany({
      where: {
        activityId: options?.activityId ?? undefined
      },
      orderBy: {
        permitType: {
          name: 'asc'
        }
      },
      include: {
        activity: {
          include: {
            activityContact: true
          }
        },
        permitType: true,
        permitNote: options?.includeNotes ? { orderBy: { createdAt: 'desc' } } : false,
        permitTracking: {
          include: {
            sourceSystemKind: true
          }
        }
      }
    });

    return await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result
    );
  });
};

/**
 * Search and retrieve permits with pagination, filtering, and sorting
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @param initiative Initiative code (excludes PCNS)
 * @param options Search and filter options
 * @returns A Promise that resolves to an object with permits array and total count
 */
export const searchPermitsService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  initiative: Exclude<Initiative, Initiative.PCNS>,
  options: SearchPermitsInput
): Promise<SearchPermitsResponse> => {
  return await unitOfWork.execute(async ({ activityContact, contact, permit }) => {
    const result = await permit.search(initiative, options);

    const filtered = await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result.permits
    );

    // TODO: totalRecords will be incorrect as its based on all permits
    // TBH we probably need filtering at the prisma level somehow
    // Not an immediate priority as pagination is currently internal only and Navs always see full results
    // Will need to be addressed when pagination goes to the proponent side
    return { permits: filtered, totalRecords: result.totalRecords };
  });
};

/**
 * Upsert a Permit
 * @param permitData Permit object
 * @param permitNoteData Permit note array
 * @param permitTrackingData Permit tracking array
 * @param permitTypeData Permit type object
 * @returns A Promise that resolves to the created/updated permit
 */
export const upsertPermitService = async (
  permitData: UpsertPermitInput,
  permitNoteData: UpsertPermitBodyInput['permitNote'],
  permitTrackingData: UpsertPermitBodyInput['permitTracking'],
  permitTypeData: UpsertPermitBodyInput['permitType']
): Promise<Permit> => {
  return await unitOfWork.execute(
    async ({
      electrificationProject,
      generalProject,
      housingProject,
      permit,
      permitNote,
      permitTracking,
      permitType,
      sourceSystemKind,
      user
    }) => {
      // Add permit ID and stamp data if necessary
      const upsertPermitData: UpsertPermitInput & { permitId: string } = {
        ...permitData,
        permitId: permitData.permitId || randomUUID()
      };

      const sourceSystemKinds = await sourceSystemKind.list();
      const isPeachIntegratedAuth = checkIfPeachIntegratedAuthType(
        permitTypeData?.sourceSystem ?? '',
        sourceSystemKinds
      );
      const peachIntegratedTracking = findPriorityPermitTracking(permitTrackingData as PermitTracking[] | undefined);
      let isValidPeachPermit = false;

      if (isPeachIntegratedAuth && !!peachIntegratedTracking) {
        const peachRecord = await getPeachRecord(
          peachIntegratedTracking.trackingId!,
          peachIntegratedTracking.sourceSystemKind!.sourceSystem
        );
        const peachSummary = summarizePeachRecord(peachRecord);
        isValidPeachPermit = !!peachSummary;
        if (!isValidPeachPermit) throw new Problem(400, { detail: 'Invalid Peach record summary' });
      }

      // Add data to tracking IDs if necessary
      permitTrackingData?.forEach((x) => {
        x.permitId = x.permitId ?? permitData.permitId;
        x.shownToProponent = x.shownToProponent ?? false;
      });

      // Upserting can't have relational information in the data
      const oldAuthorization = permitData.permitId
        ? await permit.findFirst({ where: { permitId: permitData.permitId } })
        : undefined;
      const upsert = await permit.upsert(
        {
          permitId: upsertPermitData.permitId
        },
        // activityId is optional in the request schema (updates may omit it) but required for a create -
        // matches original pre-migration Joi behavior, which had the same gap.
        upsertPermitData as typeof upsertPermitData & { activityId: string },
        upsertPermitData
      );
      const data = await permit.findUniqueOrThrow({
        where: { permitId: upsert.permitId },
        include: { permitType: true }
      });

      await permitTracking.deleteMany(
        {
          permitId: upsertPermitData.permitId,
          permitTrackingId: {
            notIn: permitTrackingData?.map((x) => x.permitTrackingId).filter((id): id is number => id != null)
          }
        },
        { hard: true }
      );

      if (permitTrackingData?.length) {
        await Promise.all(
          permitTrackingData.map(async (p) => {
            const permitTrackingUpsert = {
              permitId: data.permitId,
              permitTrackingId: p.permitTrackingId ?? undefined,
              trackingId: p.trackingId,
              shownToProponent: p.shownToProponent ?? undefined,
              sourceSystemKindId: p.sourceSystemKindId
            } satisfies PermitTrackingUpsertInput;

            return await upsertPermitTracking({ permitTracking }, permitTrackingUpsert);
          })
        );
      }

      const before = snapshotPermitStatus(oldAuthorization ?? {});
      const after = snapshotPermitStatus(data);
      const diff = differential(before, after);

      const statusChanged = !isEmptyObject(diff);
      const permitNoteText = (permitNoteData?.[0]?.note ?? '').trim();
      const isEmptyPermitNote = permitNoteText.length === 0;

      // Prevent creating notes and sending an update email if the above call fails
      if (data?.permitId) {
        if (!isEmptyPermitNote || (isValidPeachPermit && statusChanged)) {
          const note = isEmptyPermitNote
            ? `This application is ${data.state.toLocaleLowerCase()} in the ${data.stage.toLocaleLowerCase()}.`
            : permitNoteText;
          await sendPermitUpdateNotifications(
            { electrificationProject, generalProject, housingProject, permitNote, permitType, user },
            data,
            false,
            note
          );
        }
      }

      return data;
    }
  );
};
