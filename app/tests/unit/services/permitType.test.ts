import { mockReset } from 'vitest-mock-extended';

import { TEST_PERMIT_TYPE_1 } from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { listPermitTypesService } from '../../../src/services/permitType.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

vi.mock('config');

describe('permitType service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('listPermitTypesService', () => {
    it('returns permit types when no initiative is provided', async () => {
      const mockPermitType = {
        ...TEST_PERMIT_TYPE_1,
        permitTypeInitiativeXref: []
      };

      mockRepos.permitType.findMany.mockResolvedValue([mockPermitType] as never);

      const result = await listPermitTypesService();

      expect(mockRepos.permitType.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.permitType.findMany).toHaveBeenCalledWith({
        include: {
          permitTypeInitiativeXref: {
            include: {
              initiative: true
            }
          }
        },
        where: undefined,
        orderBy: [
          {
            businessDomain: 'asc'
          },
          {
            name: 'asc'
          }
        ]
      });
      expect(result).toEqual([mockPermitType]);
    });

    it('returns permit types filtered by initiative when provided', async () => {
      const mockPermitType = {
        ...TEST_PERMIT_TYPE_1,
        permitTypeInitiativeXref: [
          {
            permitTypeId: TEST_PERMIT_TYPE_1.permitTypeId,
            initiativeId: 1,
            initiative: {
              initiativeId: 1,
              code: Initiative.HOUSING,
              name: 'Housing Project',
              createdAt: null,
              createdBy: null,
              updatedAt: null,
              updatedBy: null,
              deletedBy: null,
              deletedAt: null
            }
          }
        ]
      };

      mockRepos.permitType.findMany.mockResolvedValue([mockPermitType] as never);

      const result = await listPermitTypesService(Initiative.HOUSING);

      expect(mockRepos.permitType.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.permitType.findMany).toHaveBeenCalledWith({
        include: {
          permitTypeInitiativeXref: {
            include: {
              initiative: true
            }
          }
        },
        where: {
          permitTypeInitiativeXref: {
            some: {
              initiative: {
                code: Initiative.HOUSING
              }
            }
          }
        },
        orderBy: [
          {
            businessDomain: 'asc'
          },
          {
            name: 'asc'
          }
        ]
      });
      expect(result).toEqual([mockPermitType]);
    });

    it('returns empty array when no permit types match initiative', async () => {
      mockRepos.permitType.findMany.mockResolvedValue([] as never);

      const result = await listPermitTypesService(Initiative.GENERAL);

      expect(mockRepos.permitType.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('orders results by business domain then name', async () => {
      const permitType1 = { ...TEST_PERMIT_TYPE_1, businessDomain: 'DOMAIN_A', name: 'TYPE_B' };
      const permitType2 = { ...TEST_PERMIT_TYPE_1, permitTypeId: 2, businessDomain: 'DOMAIN_A', name: 'TYPE_A' };
      const permitType3 = { ...TEST_PERMIT_TYPE_1, permitTypeId: 3, businessDomain: 'DOMAIN_B', name: 'TYPE_A' };

      mockRepos.permitType.findMany.mockResolvedValue([permitType2, permitType1, permitType3] as never);

      const result = await listPermitTypesService();

      expect(result).toHaveLength(3);
      expect(mockRepos.permitType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ businessDomain: 'asc' }, { name: 'asc' }]
        })
      );
    });
  });
});
