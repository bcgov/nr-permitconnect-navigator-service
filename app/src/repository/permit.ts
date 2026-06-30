import { WritableRepository } from './writable.ts';
import { Initiative } from '../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import { SearchPermitsOptions } from '../types/stuff';

export class PermitRepository extends WritableRepository<PrismaTransactionClient['permit']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.permit, principal, true);
  }

  public async search(initiativeCode: Exclude<Initiative, Initiative.PCNS>, options: SearchPermitsOptions) {
    // Determine project table based on initiative, exclude PCNS
    const projectTableMap = {
      [Initiative.ELECTRIFICATION]: 'electrificationProject',
      [Initiative.GENERAL]: 'generalProject',
      [Initiative.HOUSING]: 'housingProject'
    } as const;

    const projectTable = projectTableMap[initiativeCode];

    const validSortFields = ['decisionDate', 'stage', 'state', 'statusLastChanged', 'submittedDate'];

    let orderBy: Record<string, 'asc' | 'desc'> | undefined;

    if (options?.sortOrder !== '0' && options?.sortField && validSortFields.includes(options.sortField)) {
      const sortDirection = options.sortOrder === '1' ? 'asc' : 'desc';
      orderBy = { [options.sortField]: sortDirection };
    }

    const whereClause = {
      AND: [
        {
          activity: {
            [projectTable]: { isNot: null }
          }
        },
        options.dateRange
          ? {
              OR: [
                { submittedDate: { gte: options.dateRange[0], lte: options.dateRange[1] } },
                { decisionDate: { gte: options.dateRange[0], lte: options.dateRange[1] } },
                { statusLastChanged: { gte: options.dateRange[0], lte: options.dateRange[1] } }
              ]
            }
          : {},
        options?.permitTypeId ? { permitTypeId: Number.parseInt(options.permitTypeId) } : {},
        options?.sourceSystemKindId
          ? {
              permitTracking: {
                some: {
                  sourceSystemKindId: Number.parseInt(options.sourceSystemKindId)
                }
              }
            }
          : {},
        options?.searchTag
          ? {
              OR: [
                { activityId: { contains: options.searchTag, mode: 'insensitive' as const } },
                { stage: { contains: options.searchTag, mode: 'insensitive' as const } },
                { state: { contains: options.searchTag, mode: 'insensitive' as const } },
                { permitType: { name: { contains: options.searchTag, mode: 'insensitive' as const } } },
                { permitType: { businessDomain: { contains: options.searchTag, mode: 'insensitive' as const } } },
                {
                  activity: {
                    [projectTable]: {
                      OR: [
                        { projectName: { contains: options.searchTag, mode: 'insensitive' as const } },
                        { companyNameRegistered: { contains: options.searchTag, mode: 'insensitive' as const } },
                        // Only include location fields for initiatives that have them (not ELECTRIFICATION)
                        ...(initiativeCode === Initiative.ELECTRIFICATION
                          ? []
                          : [
                              { streetAddress: { contains: options.searchTag, mode: 'insensitive' as const } },
                              { locality: { contains: options.searchTag, mode: 'insensitive' as const } },
                              { province: { contains: options.searchTag, mode: 'insensitive' as const } }
                            ])
                      ]
                    }
                  }
                },
                {
                  permitTracking: {
                    some: {
                      trackingId: { contains: options.searchTag, mode: 'insensitive' as const }
                    }
                  }
                }
              ]
            }
          : {}
      ]
    };

    // Get total count (without pagination)
    const totalRecords = await this.model.count({
      where: whereClause
    });

    // Get paginated data
    const permits = await this.model.findMany({
      skip: options?.skip ? Number.parseInt(options.skip) : 0,
      take: options?.take ? Number.parseInt(options.take) : 10,
      where: whereClause,
      orderBy: orderBy,
      select: {
        permitId: true,
        activityId: true,
        permitTypeId: true,
        decisionDate: true,
        stage: true,
        state: true,
        statusLastChanged: true,
        submittedDate: true,
        permitType: {
          select: {
            businessDomain: true,
            name: true
          }
        },
        activity: {
          select: {
            electrificationProject: {
              select: {
                projectId: true,
                projectName: true,
                companyNameRegistered: true
              }
            },
            generalProject: {
              select: {
                projectId: true,
                projectName: true,
                companyNameRegistered: true,
                streetAddress: true,
                locality: true,
                province: true
              }
            },
            housingProject: {
              select: {
                projectId: true,
                projectName: true,
                companyNameRegistered: true,
                streetAddress: true,
                locality: true,
                province: true
              }
            }
          }
        }
      }
    });

    // Map the results to alias the project table as 'project'
    const permitsWithProjectAlias = permits.map((permit) => {
      const project =
        permit.activity.housingProject ?? permit.activity.generalProject ?? permit.activity.electrificationProject;

      return {
        permitId: permit.permitId,
        activityId: permit.activityId,
        permitTypeId: permit.permitTypeId,
        decisionDate: permit.decisionDate,
        stage: permit.stage,
        state: permit.state,
        statusLastChanged: permit.statusLastChanged,
        submittedDate: permit.submittedDate,
        permitType: permit.permitType,
        project
      };
    });

    return { permits: permitsWithProjectAlias, totalRecords };
  }
}
