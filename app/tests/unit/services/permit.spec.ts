import { TEST_CURRENT_CONTEXT, TEST_PERMIT_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as permitService from '../../../src/services/permit.ts';
import { generateDeleteStamps } from '../../../src/db/utils/utils.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

describe('deletePermit', () => {
  it('calls permit.update', async () => {
    prismaTxMock.permit.update.mockResolvedValueOnce(TEST_PERMIT_1);

    await permitService.deletePermit(prismaTxMock, '1', generateDeleteStamps(TEST_CURRENT_CONTEXT));

    expect(prismaTxMock.permit.delete).not.toHaveBeenCalled();
    expect(prismaTxMock.permit.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.update).toHaveBeenCalledWith({
      data: { deletedAt: expect.any(Date), deletedBy: TEST_CURRENT_CONTEXT.userId },
      where: {
        permitId: '1'
      }
    });

    expect(prismaTxMock.permit_note.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit_note.updateMany).toHaveBeenCalledWith({
      data: { deletedAt: expect.any(Date), deletedBy: TEST_CURRENT_CONTEXT.userId },
      where: { permitId: TEST_PERMIT_1.permitId, deletedAt: null }
    });

    expect(prismaTxMock.permit_tracking.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit_tracking.updateMany).toHaveBeenCalledWith({
      data: { deletedAt: expect.any(Date), deletedBy: TEST_CURRENT_CONTEXT.userId },
      where: { permitId: TEST_PERMIT_1.permitId, deletedAt: null }
    });
  });
});

describe('getPermit', () => {
  it('calls permit.findFirstOrThrow and returns result', async () => {
    prismaTxMock.permit.findFirstOrThrow.mockResolvedValueOnce(TEST_PERMIT_1);

    const response = await permitService.getPermit(prismaTxMock, '1');

    expect(prismaTxMock.permit.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        permitId: '1'
      },
      include: {
        permitType: true,
        permitNote: { orderBy: { createdAt: 'desc' } },
        permitTracking: { include: { sourceSystemKind: true } }
      }
    });
    expect(response).toStrictEqual(TEST_PERMIT_1);
  });
});

describe('listPermits', () => {
  it('calls permit.findMany and returns result', async () => {
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1]);

    const response = await permitService.listPermits(prismaTxMock, {});

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      where: {
        activityId: undefined
      },
      orderBy: {
        permitType: {
          name: 'asc'
        }
      },
      include: {
        activity: {
          include: {
            activityContact: true
          }
        },
        permitType: true,
        permitNote: false,
        permitTracking: {
          include: {
            sourceSystemKind: true
          }
        }
      }
    });
    expect(response).toStrictEqual([TEST_PERMIT_1]);
  });
});

describe('listPeachIntegratedTrackings', () => {
  it('calls permit.findMany with full filters and integrated tracking and returns result', async () => {
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1]);

    const response = await permitService.listPeachIntegratedTrackings(prismaTxMock);

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            permitTracking: {
              some: {
                sourceSystemKind: {
                  integrated: true
                }
              }
            }
          }
        ]
      },
      include: {
        permitTracking: {
          where: {
            AND: [
              {
                sourceSystemKind: {
                  integrated: true
                }
              }
            ]
          },
          include: { sourceSystemKind: true }
        }
      }
    });
    expect(response).toStrictEqual([TEST_PERMIT_1]);
  });
});

describe('searchPermits', () => {
  it('calls permit.count and permit.findMany with default options for HOUSING initiative', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        housingProject: { projectId: 'HP1', projectName: 'Test Housing' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(5);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    const response = await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {});

    expect(prismaTxMock.permit.count).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.count).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activity: {
              housingProject: {
                isNot: null
              }
            }
          },
          {},
          {},
          {},
          {}
        ]
      }
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: {
        AND: [
          {
            activity: {
              housingProject: {
                isNot: null
              }
            }
          },
          {},
          {},
          {},
          {}
        ]
      },
      orderBy: undefined,
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

    expect(response.totalRecords).toBe(5);
    expect(response.permits).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((response.permits[0] as any).project).toEqual({ projectId: 'HP1', projectName: 'Test Housing' });
  });

  it('calls permit.count and permit.findMany with default options for ELECTRIFICATION initiative', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(3);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    const response = await permitService.searchPermits(prismaTxMock, Initiative.ELECTRIFICATION, {});

    expect(prismaTxMock.permit.count).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                electrificationProject: {
                  isNot: null
                }
              }
            },
            {},
            {},
            {},
            {}
          ]
        },
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
      })
    );

    expect(response.totalRecords).toBe(3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((response.permits[0] as any).project).toEqual({ projectId: 'EP1', projectName: 'Test Electrification' });
  });

  it('applies pagination with skip and take', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(100);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      skip: '20',
      take: '25'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 25
      })
    );
  });

  it('applies sorting by submittedDate ascending', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(10);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      sortField: 'submittedDate',
      sortOrder: '1'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { submittedDate: 'asc' }
      })
    );
  });

  it('applies sorting by decisionDate descending', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(10);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      sortField: 'decisionDate',
      sortOrder: '0'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: undefined
      })
    );
  });

  it('applies sorting by stage', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(10);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      sortField: 'stage',
      sortOrder: '1'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { stage: 'asc' }
      })
    );
  });

  it('applies dateRange filter', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(5);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      dateRange: [startDate, endDate]
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                housingProject: {
                  isNot: null
                }
              }
            },
            {
              OR: [
                { submittedDate: { gte: startDate, lte: endDate } },
                { decisionDate: { gte: startDate, lte: endDate } },
                { statusLastChanged: { gte: startDate, lte: endDate } }
              ]
            },
            {},
            {},
            {}
          ]
        }
      })
    );
  });

  it('applies permitTypeId filter', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(2);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      permitTypeId: '123'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                housingProject: {
                  isNot: null
                }
              }
            },
            {},
            { permitTypeId: 123 },
            {},
            {}
          ]
        }
      })
    );
  });

  it('applies sourceSystemKindId filter', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(4);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      sourceSystemKindId: '456'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                housingProject: {
                  isNot: null
                }
              }
            },
            {},
            {},
            {
              permitTracking: {
                some: {
                  sourceSystemKindId: 456
                }
              }
            },
            {}
          ]
        }
      })
    );
  });

  it('applies searchTag filter for HOUSING initiative', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(1);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      searchTag: 'test'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                housingProject: {
                  isNot: null
                }
              }
            },
            {},
            {},
            {},
            {
              OR: [
                { activityId: { contains: 'test', mode: 'insensitive' } },
                { stage: { contains: 'test', mode: 'insensitive' } },
                { state: { contains: 'test', mode: 'insensitive' } },
                { permitType: { name: { contains: 'test', mode: 'insensitive' } } },
                { permitType: { businessDomain: { contains: 'test', mode: 'insensitive' } } },
                {
                  activity: {
                    housingProject: {
                      OR: [
                        { projectName: { contains: 'test', mode: 'insensitive' } },
                        { companyNameRegistered: { contains: 'test', mode: 'insensitive' } },
                        { streetAddress: { contains: 'test', mode: 'insensitive' } },
                        { locality: { contains: 'test', mode: 'insensitive' } },
                        { province: { contains: 'test', mode: 'insensitive' } }
                      ]
                    }
                  }
                },
                {
                  permitTracking: {
                    some: {
                      trackingId: { contains: 'test', mode: 'insensitive' }
                    }
                  }
                }
              ]
            }
          ]
        }
      })
    );
  });

  it('applies searchTag filter for ELECTRIFICATION initiative without location fields', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(1);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    await permitService.searchPermits(prismaTxMock, Initiative.ELECTRIFICATION, {
      searchTag: 'test'
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findManyCall: any = prismaTxMock.permit.findMany.mock.calls[0]?.[0];
    const searchTagOR = findManyCall?.where?.AND?.[4]?.OR;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activityOR = searchTagOR?.find((clause: any) => clause.activity)?.activity.electrificationProject.OR;

    // Should not include location fields (streetAddress, locality, province) for ELECTRIFICATION
    expect(activityOR).toEqual([
      { projectName: { contains: 'test', mode: 'insensitive' } },
      { companyNameRegistered: { contains: 'test', mode: 'insensitive' } }
    ]);
  });

  it('applies multiple filters combined', async () => {
    const mockRes = {
      ...TEST_PERMIT_1,
      activity: {
        activityId: 'ACT123',
        electrificationProject: { projectId: 'EP1', projectName: 'Test Electrification' }
      }
    };

    prismaTxMock.permit.count.mockResolvedValueOnce(2);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockRes]);

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    const response = await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      dateRange: [startDate, endDate],
      permitTypeId: '123',
      searchTag: 'test',
      skip: '10',
      take: '20',
      sortField: 'submittedDate',
      sortOrder: '1'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 20,
        orderBy: { submittedDate: 'asc' },
        where: {
          AND: [
            {
              activity: {
                housingProject: {
                  isNot: null
                }
              }
            },
            {
              OR: [
                { submittedDate: { gte: startDate, lte: endDate } },
                { decisionDate: { gte: startDate, lte: endDate } },
                { statusLastChanged: { gte: startDate, lte: endDate } }
              ]
            },
            { permitTypeId: 123 },
            {},
            {
              OR: expect.arrayContaining([
                { activityId: { contains: 'test', mode: 'insensitive' } },
                { stage: { contains: 'test', mode: 'insensitive' } }
              ])
            }
          ]
        }
      })
    );

    expect(response.totalRecords).toBe(2);
  });

  it('returns empty results when no permits match', async () => {
    prismaTxMock.permit.count.mockResolvedValueOnce(0);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([]);

    const response = await permitService.searchPermits(prismaTxMock, Initiative.HOUSING, {
      searchTag: 'nonexistent'
    });

    expect(response.totalRecords).toBe(0);
    expect(response.permits).toEqual([]);
  });
});

describe('upsertPermit', () => {
  it('calls permit.upsert with correct data and returns result', async () => {
    prismaTxMock.permit.upsert.mockResolvedValueOnce(TEST_PERMIT_1);

    const response = await permitService.upsertPermit(prismaTxMock, TEST_PERMIT_1);

    expect(prismaTxMock.permit.upsert).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.upsert).toHaveBeenCalledWith({
      update: TEST_PERMIT_1,
      create: TEST_PERMIT_1,
      where: { permitId: TEST_PERMIT_1.permitId },
      include: {
        permitType: true,
        permitNote: { orderBy: { createdAt: 'desc' } }
      }
    });
    expect(response).toStrictEqual(TEST_PERMIT_1);
  });
});
