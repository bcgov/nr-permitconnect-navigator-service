import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { ElectrificationProject } from '../types/models.ts';
import type { ElectrificationProjectSearchParameters } from '../types/stuff';

export class ElectrificationProjectRepository extends WritableRepository<
  PrismaTransactionClient['electrification_project']
> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.electrification_project, principal, true);
  }

  async search(params: ElectrificationProjectSearchParameters): Promise<ElectrificationProject[]> {
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
            electrificationProjectId: { in: params.electrificationProjectId }
          },
          {
            projectType: { in: params.projectType }
          },
          {
            projectCategory: { in: params.projectCategory }
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
