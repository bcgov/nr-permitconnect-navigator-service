import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';
import type { HousingProject, HousingProjectSearchParameters } from '#types';

export class HousingProjectRepository extends WritableRepository<PrismaTransactionClient['housing_project']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.housing_project, principal, true);
  }

  public async search(params: HousingProjectSearchParameters): Promise<HousingProject[]> {
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
