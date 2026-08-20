import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { ElectrificationProject, SearchElectrificationProjectRequest } from '../types/index.ts';

export class ElectrificationProjectRepository extends WritableRepository<
  PrismaTransactionClient['electrification_project']
> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.electrification_project, principal, true);
  }

  public async search(params: SearchElectrificationProjectRequest): Promise<ElectrificationProject[]> {
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
