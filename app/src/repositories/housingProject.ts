import { Prisma } from '@prisma/client';

import { jsonToPrismaInputJson } from '#src/db/utils/utils';
import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';
import type { HousingProject, PatchHousingProjectRequest, SearchHousingProjectRequest } from '#types';

export class HousingProjectRepository extends WritableRepository<PrismaTransactionClient['housing_project']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.housing_project, principal, true);
  }

  public async patch(where: { housingProjectId: string }, data: PatchHousingProjectRequest) {
    const { geoJson, ...rest } = data;

    const updateData: Prisma.housing_projectUncheckedUpdateInput = {
      ...rest,
      ...(geoJson !== undefined && { geoJson: jsonToPrismaInputJson(geoJson) })
    };

    return this.update(where, updateData);
  }

  public async search(params: SearchHousingProjectRequest): Promise<HousingProject[]> {
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
