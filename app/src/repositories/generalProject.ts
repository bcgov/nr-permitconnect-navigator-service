import { jsonToPrismaInputJson } from '../db/utils/utils.ts';
import { WritableRepository } from './writable.ts';

import type { Prisma } from '@prisma/client';
import type { PrismaTransactionClient } from '../db/database.ts';
import type { GeneralProject, GeneralProjectSearchParameters, PatchGeneralProjectRequest } from '../types/index.ts';

export class GeneralProjectRepository extends WritableRepository<PrismaTransactionClient['general_project']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.general_project, principal, true);
  }

  public async patch(where: { generalProjectId: string }, data: PatchGeneralProjectRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { generalProjectId: _id, geoJson, ...rest } = data;

    const updateData: Prisma.general_projectUncheckedUpdateInput = {
      ...rest,
      ...(geoJson !== undefined && { geoJson: jsonToPrismaInputJson(geoJson) })
    };

    return this.update(where, updateData);
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
