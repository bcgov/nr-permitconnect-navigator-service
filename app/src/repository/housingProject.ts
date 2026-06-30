import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { HousingProject } from '../types/models.ts';
import type { HousingProjectSearchParameters } from '../types/stuff';

export class HousingProjectRepository extends WritableRepository<PrismaTransactionClient['housing_project']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.housing_project, principal, true);
  }

  async search(params: HousingProjectSearchParameters): Promise<HousingProject[]> {
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
            housingProjectId: { in: params.housingProjectId }
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
