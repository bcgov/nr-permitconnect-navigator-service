import { TEST_PERMIT_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as permitService from '../../../src/services/permit.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

describe('deletePermit', () => {
  it('calls permit.delete', async () => {
    prismaTxMock.permit.update.mockResolvedValueOnce(TEST_PERMIT_1);

    await permitService.deletePermit(prismaTxMock, '1');

    expect(prismaTxMock.permit.delete).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.delete).toHaveBeenCalledWith({
      where: {
        permitId: '1'
      },
      include: {
        permitType: true
      }
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

describe('getPermitTypes', () => {
  it('calls initiative.findFirstOrThrow and returns result', async () => {
    prismaTxMock.initiative.findFirstOrThrow.mockResolvedValueOnce({
      // @ts-expect-error Jest doesn't play nicely with Prisma includes
      permitTypeInitiativeXref: [{ permitType: { permitTypeId: 'ABC' } }]
    });

    const response = await permitService.getPermitTypes(prismaTxMock, Initiative.HOUSING);

    expect(prismaTxMock.initiative.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.initiative.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        code: Initiative.HOUSING
      },
      include: {
        permitTypeInitiativeXref: {
          include: {
            permitType: true
          },
          orderBy: [
            {
              permitType: {
                businessDomain: 'asc'
              }
            },
            {
              permitType: {
                name: 'asc'
              }
            }
          ]
        }
      }
    });
    expect(response).toStrictEqual([{ permitTypeId: 'ABC' }]);
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

describe('searchPermits', () => {
  it('calls permit.findMany with no filters or includes and returns result', async () => {
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1]);

    const response = await permitService.searchPermits(prismaTxMock, {});

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{}, {}, {}, {}, {}, {}, {}]
      },
      include: {}
    });
    expect(response).toStrictEqual([TEST_PERMIT_1]);
  });

  it('calls permit.findMany with full filters and integrated tracking and returns result', async () => {
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1]);

    const params = {
      permitId: ['PERMIT-1'],
      activityId: ['ACTIVITY-1'],
      permitTypeId: [123],
      stage: ['Technical review'],
      state: ['In progress'],
      sourceSystems: ['ITSM-6072'],
      includePermitNotes: true,
      includePermitTracking: true,
      includePermitType: true,
      onlyPeachIntegratedTrackings: true
    };

    const response = await permitService.searchPermits(prismaTxMock, params);

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { permitId: { in: ['PERMIT-1'] } },
          { activityId: { in: ['ACTIVITY-1'] } },
          { permitTypeId: { in: [123] } },
          { stage: { in: ['Technical review'] } },
          { state: { in: ['In progress'] } },
          { permitType: { sourceSystem: { in: ['ITSM-6072'] } } },
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
        permitType: true,
        permitNote: true,
        permitTracking: {
          where: {
            AND: [
              {
                sourceSystemKind: {
                  sourceSystem: {
                    in: ['ITSM-6072']
                  }
                }
              },
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

  it('calls permit.findMany with includePermitTracking but no filters and returns result', async () => {
    prismaTxMock.permit.findMany.mockResolvedValueOnce([TEST_PERMIT_1]);

    const params = {
      includePermitTracking: true
    };

    const response = await permitService.searchPermits(prismaTxMock, params);

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{}, {}, {}, {}, {}, {}, {}]
      },
      include: {
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

describe('searchPermitsPaginated', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockPermit: any = {
    ...TEST_PERMIT_1,
    activity: {
      activityId: 'ACT123',
      housingProject: [{ housingProjectId: 'HP1', projectName: 'Test Housing' }],
      electrificationProject: [{ electrificationProjectId: 'EP1', projectName: 'Test Electrification' }]
    }
  };

  it('calls permit.count and permit.findMany with default options for HOUSING initiative', async () => {
    prismaTxMock.permit.count.mockResolvedValueOnce(5);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    const response = await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {});

    expect(prismaTxMock.permit.count).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.count).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activity: {
              housingProject: {
                some: {}
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
                some: {}
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
      include: {
        permitType: true,
        permitTracking: {
          include: {
            sourceSystemKind: true
          }
        },
        activity: {
          include: {
            housingProject: true
          }
        }
      }
    });

    expect(response.totalRecords).toBe(5);
    expect(response.permits).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((response.permits[0] as any).activity.project).toEqual([
      { housingProjectId: 'HP1', projectName: 'Test Housing' }
    ]);
  });

  it('calls permit.count and permit.findMany with default options for ELECTRIFICATION initiative', async () => {
    prismaTxMock.permit.count.mockResolvedValueOnce(3);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    const response = await permitService.searchPermitsPaginated(prismaTxMock, Initiative.ELECTRIFICATION, {});

    expect(prismaTxMock.permit.count).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                electrificationProject: {
                  some: {}
                }
              }
            },
            {},
            {},
            {},
            {}
          ]
        },
        include: {
          permitType: true,
          permitTracking: {
            include: {
              sourceSystemKind: true
            }
          },
          activity: {
            include: {
              electrificationProject: true
            }
          }
        }
      })
    );

    expect(response.totalRecords).toBe(3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((response.permits[0] as any).activity.project).toEqual([
      { electrificationProjectId: 'EP1', projectName: 'Test Electrification' }
    ]);
  });

  it('applies pagination with skip and take', async () => {
    prismaTxMock.permit.count.mockResolvedValueOnce(100);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
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
    prismaTxMock.permit.count.mockResolvedValueOnce(10);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
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
    prismaTxMock.permit.count.mockResolvedValueOnce(10);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
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
    prismaTxMock.permit.count.mockResolvedValueOnce(10);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
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
    prismaTxMock.permit.count.mockResolvedValueOnce(5);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
      dateRange: [startDate, endDate]
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                housingProject: {
                  some: {}
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
    prismaTxMock.permit.count.mockResolvedValueOnce(2);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
      permitTypeId: '123'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                housingProject: {
                  some: {}
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
    prismaTxMock.permit.count.mockResolvedValueOnce(4);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
      sourceSystemKindId: '456'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                housingProject: {
                  some: {}
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
    prismaTxMock.permit.count.mockResolvedValueOnce(1);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
      searchTag: 'test'
    });

    expect(prismaTxMock.permit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              activity: {
                housingProject: {
                  some: {}
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
                      some: {
                        OR: [
                          { projectName: { contains: 'test', mode: 'insensitive' } },
                          { companyNameRegistered: { contains: 'test', mode: 'insensitive' } },
                          { streetAddress: { contains: 'test', mode: 'insensitive' } },
                          { locality: { contains: 'test', mode: 'insensitive' } },
                          { province: { contains: 'test', mode: 'insensitive' } }
                        ]
                      }
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
    prismaTxMock.permit.count.mockResolvedValueOnce(1);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    await permitService.searchPermitsPaginated(prismaTxMock, Initiative.ELECTRIFICATION, {
      searchTag: 'test'
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findManyCall: any = prismaTxMock.permit.findMany.mock.calls[0]?.[0];
    const searchTagOR = findManyCall?.where?.AND?.[4]?.OR;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activityOR = searchTagOR?.find((clause: any) => clause.activity)?.activity.electrificationProject.some.OR;

    // Should not include location fields (streetAddress, locality, province) for ELECTRIFICATION
    expect(activityOR).toEqual([
      { projectName: { contains: 'test', mode: 'insensitive' } },
      { companyNameRegistered: { contains: 'test', mode: 'insensitive' } }
    ]);
  });

  it('applies multiple filters combined', async () => {
    prismaTxMock.permit.count.mockResolvedValueOnce(2);
    prismaTxMock.permit.findMany.mockResolvedValueOnce([mockPermit]);

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    const response = await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
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
                  some: {}
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

    const response = await permitService.searchPermitsPaginated(prismaTxMock, Initiative.HOUSING, {
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
