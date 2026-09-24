import { addDays } from 'date-fns';
import { Prisma } from '#prismaClient';

import { jsonToPrismaInputJson } from '#src/db/utils/utils';
import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';
import type { PatchGeneralProjectRequest, SearchGeneralProjectRequest, SearchProjectResponse } from '#types';

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

  public async search(params: SearchGeneralProjectRequest): Promise<SearchProjectResponse> {
    const validSortFields = [
      'activityId',
      'applicationStatus',
      'assignedTo',
      'companyNameRegistered',
      'location',
      'projectName',
      'queuePriority',
      'submittedAt'
    ];

    let orderBy:
      Prisma.general_projectOrderByWithRelationInput | Prisma.general_projectOrderByWithRelationInput[] | undefined;

    if (params?.sortOrder !== '0' && params?.sortField) {
      const sortDirection = params.sortOrder === '1' ? 'asc' : 'desc';

      if (params.sortField === 'assignedTo') {
        // display sorts as "Lastname, Firstname"; user.fullName is a separate, not reliably synced column
        orderBy = [{ user: { lastName: sortDirection } }, { user: { firstName: sortDirection } }];
      } else if (params.sortField === 'location') {
        // location is streetAddress/locality/province joined client-side; approximate with the same field priority
        orderBy = [{ streetAddress: sortDirection }, { locality: sortDirection }, { province: sortDirection }];
      } else if (validSortFields.includes(params.sortField)) {
        orderBy = { [params.sortField]: sortDirection };
      }
    }

    const whereClause = {
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
        },
        params.dateRange
          ? {
              OR: [{ submittedAt: { gte: params.dateRange[0], lt: addDays(params.dateRange[1], 1) } }]
            }
          : {},
        params.applicationStatus
          ? {
              applicationStatus: { in: params.applicationStatus }
            }
          : {},
        params?.searchTag
          ? {
              OR: [
                { projectName: { contains: params.searchTag, mode: 'insensitive' as const } },
                { activityId: { contains: params.searchTag, mode: 'insensitive' as const } },
                { companyNameRegistered: { contains: params.searchTag, mode: 'insensitive' as const } },
                { streetAddress: { contains: params.searchTag, mode: 'insensitive' as const } },
                { locality: { contains: params.searchTag, mode: 'insensitive' as const } },
                { province: { contains: params.searchTag, mode: 'insensitive' as const } },
                {
                  activity: {
                    activityContact: {
                      some: {
                        contact: {
                          OR: [
                            { firstName: { contains: params.searchTag, mode: 'insensitive' as const } },
                            { lastName: { contains: params.searchTag, mode: 'insensitive' as const } }
                          ]
                        }
                      }
                    }
                  }
                }
              ]
            }
          : {}
      ]
    };
    const projects = await this.findMany({
      skip: params?.skip ? Number.parseInt(params.skip) : 0,
      take: params?.take ? Number.parseInt(params.take) : 10,
      orderBy: orderBy,
      where: whereClause,
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

    const totalRecords = await this.count({
      where: whereClause
    });

    return { projects, totalRecords };
  }
}
