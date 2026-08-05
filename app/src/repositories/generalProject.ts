import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { GeneralProject, GeneralProjectSearchParameters } from '../types/index.ts';

export class GeneralProjectRepository extends WritableRepository<PrismaTransactionClient['general_project']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.general_project, principal, true);
  }

  public async search(params: GeneralProjectSearchParameters): Promise<GeneralProject[]> {
    return await this.findMany({
      where: {
        AND: [
          {
            activityId: { in: params.activityId }
          },
          {
            createdBy: { in: params.createdBy }
          },
          {
            generalProjectId: { in: params.generalProjectId }
          },
          {
            submissionType: { in: params.submissionType }
          }
        ]
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        },
        user: params.includeUser
      }
    });
  }
}
