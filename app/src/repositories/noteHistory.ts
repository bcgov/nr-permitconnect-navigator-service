import { WritableRepository } from './writable.ts';
import { Initiative } from '../utils/enums/application.ts';
import { BringForwardType } from '../utils/enums/projectCommon.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class NoteHistoryRepository extends WritableRepository<PrismaTransactionClient['note_history']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.note_history, principal, true);
  }

  public async listBringForwards(
    initiativeCode: Exclude<Initiative, Initiative.PCNS> | undefined,
    state: BringForwardType
  ) {
    return await this.findMany({
      where: {
        bringForwardState: state,
        activity: {
          initiative: {
            code: initiativeCode
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        noteHistoryId: true,
        activityId: true,
        createdBy: true,
        bringForwardDate: true,
        bringForwardState: true,
        escalateToSupervisor: true,
        escalateToDirector: true,
        title: true,
        activity: {
          select: {
            enquiry: {
              select: {
                activityId: true,
                enquiryId: true
              }
            },
            electrificationProject: {
              select: {
                projectId: true,
                projectName: true
              }
            },
            generalProject: {
              select: {
                projectId: true,
                projectName: true
              }
            },
            housingProject: {
              select: {
                projectId: true,
                projectName: true
              }
            }
          }
        },
        note: { orderBy: { createdAt: 'desc' } }
      }
    });
  }

  public async listNoteHistories(activityId: string) {
    return await this.findMany({
      where: {
        activityId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        note: { orderBy: { createdAt: 'desc' } }
      }
    });
  }
}
