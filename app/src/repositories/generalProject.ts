import { Prisma } from '@prisma/client';

import { jsonToPrismaInputJson } from '#src/db/utils/utils';
import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';
import type { GeneralProject, PatchGeneralProjectRequest, SearchGeneralProjectRequest } from '#types';

export class GeneralProjectRepository extends WritableRepository<PrismaTransactionClient['general_project']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.general_project, principal, true);
  }

  public async patch(where: { generalProjectId: string }, data: PatchGeneralProjectRequest) {
    const { geoJson, ...rest } = data;

    const updateData: Prisma.general_projectUncheckedUpdateInput = {
      ...rest,
      ...(geoJson !== undefined && { geoJson: jsonToPrismaInputJson(geoJson) })
    };

    return this.update(where, updateData);
  }

  public async search(params: SearchGeneralProjectRequest): Promise<GeneralProject[]> {
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
