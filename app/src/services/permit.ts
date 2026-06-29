import { v4 as uuidv4 } from 'uuid';

import { Initiative } from '../utils/enums/application.ts';

import type {
  CurrentAuthorization,
  CurrentContext,
  ListPermitsOptions,
  Permit,
  PermitBase,
  PermitNote,
  PermitTracking,
  PermitTrackingBase,
  PermitType,
  SearchPermitsOptions,
  SearchPermitsResponse,
  SourceSystemKind
} from '../types/index.ts';
import { unitOfWork } from '../repository/unitOfWork.ts';
import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';
import Problem from '../utils/problem.ts';
import { differential, isEmptyObject } from '../utils/utils.ts';
import { sendPermitUpdateNotifications } from '../domains/permit.ts';
import { findPriorityPermitTracking } from '../domains/peach.ts';
import { getPeachRecord } from '../external/peach.ts';
import { summarizePeachRecord } from '../parsers/peach.ts';
import { upsertPermitTracking } from '../domains/permitTracking.ts';

function checkIfPeachIntegratedAuthType(sourceSystem: string, sourceSystemKinds: SourceSystemKind[]): boolean {
  const sourceSystemKind = sourceSystemKinds.find((ssk) => ssk.integrated && ssk.sourceSystem === sourceSystem);
  return !!sourceSystemKind;
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
  return await unitOfWork.execute(async ({ permit }) => {
    await permit.delete({
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
  options?: ListPermitsOptions
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
  options: SearchPermitsOptions
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
  permitData: PermitBase,
  permitNoteData: PermitNote[] | undefined,
  permitTrackingData: PermitTracking[] | undefined,
  permitTypeData: PermitType | undefined
): Promise<Permit> => {
  return await unitOfWork.execute(
    async ({
      electrificationProject,
      generalProject,
      housingProject,
      permit,
      permitNote,
      permitTracking,
      sourceSystemKind,
      user
    }) => {
      // Add permit ID and stamp data if necessary
      const upsertPermitData: PermitBase = {
        ...permitData,
        permitId: permitData.permitId || uuidv4()
      };

      const sourceSystemKinds = await sourceSystemKind.list();
      const isPeachIntegratedAuth = checkIfPeachIntegratedAuthType(
        permitTypeData?.sourceSystem ?? '',
        sourceSystemKinds
      );
      const peachIntegratedTracking = findPriorityPermitTracking(permitTrackingData);
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
      permitTrackingData?.forEach((x: PermitTracking) => {
        x.permitId = x.permitId ?? permitData.permitId;
        x.shownToProponent = x.shownToProponent ?? false;
      });

      // Upserting can't have relational information in the data
      const oldAuthorization = permitData.permitId
        ? await permit.findFirst({ where: { permitId: permitData.permitId } })
        : undefined;
      const data = await permit.upsert(
        {
          permitId: upsertPermitData.permitId
        },
        upsertPermitData,
        upsertPermitData
      );

      await permitTracking.deleteMany({
        permitId: upsertPermitData.permitId,
        permitTrackingId: {
          notIn: permitTrackingData?.map((x: PermitTracking) => x.permitTrackingId).filter((x) => x)
        }
      });

      if (permitTrackingData?.length) {
        await Promise.all(
          permitTrackingData.map(async (p) => {
            const permitTrackingUpsert = {
              permitId: data.permitId,
              permitTrackingId: p.permitTrackingId,
              trackingId: p.trackingId,
              shownToProponent: p.shownToProponent,
              sourceSystemKindId: p.sourceSystemKindId
            } as PermitTrackingBase;

            return await upsertPermitTracking({ permitTracking }, permitTrackingUpsert);
          })
        );
      }

      const before = snapshotPermitStatus(oldAuthorization ?? {});
      const after = snapshotPermitStatus(data);
      const diff = differential(before, after);

      const statusChanged = !isEmptyObject(diff);
      const permitNoteText = (permitNoteData?.[0].note ?? '').trim();
      const isEmptyPermitNote = permitNoteText.length === 0;

      // Prevent creating notes and sending an update email if the above call fails
      if (data?.permitId) {
        if (!isEmptyPermitNote || (isValidPeachPermit && statusChanged)) {
          const note = isEmptyPermitNote
            ? `This application is ${data.state.toLocaleLowerCase()} in the ${data.stage.toLocaleLowerCase()}.`
            : permitNoteText;
          await sendPermitUpdateNotifications(
            { electrificationProject, generalProject, housingProject, permitNote, user },
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
