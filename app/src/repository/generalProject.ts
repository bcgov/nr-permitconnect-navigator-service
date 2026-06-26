import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { GeneralProject } from '../types/models.ts';
import type { GeneralProjectSearchParameters } from '../types/stuff';

export class GeneralProjectRepository extends WritableRepository<PrismaTransactionClient['general_project']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.general_project, principal, true);
  }

  async search(params: GeneralProjectSearchParameters): Promise<GeneralProject[]> {
    return await this.model.findMany({
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
