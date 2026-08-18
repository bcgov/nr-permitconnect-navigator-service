import { WritableRepository } from './writable.ts';
import { jsonToPrismaInputJson } from '../db/utils/utils.ts';

import type { Prisma } from '@prisma/client';
import type { PrismaTransactionClient } from '../db/database.ts';
import type { HousingProject, HousingProjectSearchParameters, PatchHousingProjectRequest } from '../types/index.ts';

export class HousingProjectRepository extends WritableRepository<PrismaTransactionClient['housing_project']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.housing_project, principal, true);
  }

  public async patch(where: { housingProjectId: string }, data: PatchHousingProjectRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { housingProjectId: _id, geoJson, ...rest } = data;

    const updateData: Prisma.housing_projectUncheckedUpdateInput = {
      ...rest,
      ...(geoJson !== undefined && { geoJson: jsonToPrismaInputJson(geoJson) })
    };

    return this.update(where, updateData);
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
