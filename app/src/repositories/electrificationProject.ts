import { addDays } from 'date-fns';
import { Prisma } from '@prisma/client';

import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';
import type { SearchElectrificationProjectRequest, SearchProjectResponse } from '#types';

export class ElectrificationProjectRepository extends WritableRepository<
  PrismaTransactionClient['electrification_project']
> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.electrification_project, principal, true);
  }

  public async search(params: SearchElectrificationProjectRequest): Promise<SearchProjectResponse> {
    const validSortFields = [
      'projectName',
      'activityId',
      'companyNameRegistered',
      'submittedAt',
      'queuePriority',
      'projectType'
    ];

    let orderBy:
      | Prisma.electrification_projectOrderByWithRelationInput
      | Prisma.electrification_projectOrderByWithRelationInput[]
      | undefined;

    if (params?.sortOrder !== '0' && params?.sortField) {
      const sortDirection = params.sortOrder === '1' ? 'asc' : 'desc';

      if (params.sortField === 'assignedTo') {
        // display sorts as "Lastname, Firstname"; user.fullName is a separate, not reliably synced column
        orderBy = [{ user: { lastName: sortDirection } }, { user: { firstName: sortDirection } }];
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
          electrificationProjectId: { in: params.electrificationProjectId }
        },
        {
          projectType: { in: params.projectType }
        },
        {
          projectCategory: { in: params.projectCategory }
        },
        params.dateRange
          ? {
              // dateRange[1] is midnight of end date; use exclusive upper bound one day later to include whole day
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
