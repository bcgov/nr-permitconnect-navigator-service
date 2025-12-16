import { prismaTxMock } from '../../__mocks__/prismaMock';
import { getSourceSystemKinds } from '../../../src/services/sourceSystemKind';

describe('sourceSystemKind', () => {
  describe('getSourceSystemKinds', () => {
    it('should return source system kinds with permit type IDs', async () => {
      const mockResponse = [
        {
          sourceSystemKindId: 1,
          kind: null,
          description: 'File Number',
          sourceSystem: 'ITSM-6197',
          integrated: false,
          createdBy: 'system',
          createdAt: new Date('2025-01-01'),
          updatedBy: null,
          updatedAt: null,
          deletedBy: null,
          deletedAt: null,
          permitTypeSourceSystemKindXref: [{ permitTypeId: 10 }, { permitTypeId: 20 }, { permitTypeId: 30 }]
        },
        {
          sourceSystemKindId: 2,
          kind: null,
          description: 'Authorization Number',
          sourceSystem: 'ITSM-5939',
          integrated: true,
          createdBy: 'system',
          createdAt: new Date('2025-01-01'),
          updatedBy: null,
          updatedAt: null,
          deletedBy: null,
          deletedAt: null,
          permitTypeSourceSystemKindXref: [{ permitTypeId: 5 }]
        }
      ];

      prismaTxMock.source_system_kind.findMany.mockResolvedValue(mockResponse);

      const result = await getSourceSystemKinds(prismaTxMock);

      expect(prismaTxMock.source_system_kind.findMany).toHaveBeenCalledWith({
        orderBy: {
          sourceSystem: 'asc'
        },
        include: {
          permitTypeSourceSystemKindXref: {
            select: {
              permitTypeId: true
            }
          }
        }
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        sourceSystemKindId: 1,
        kind: null,
        description: 'File Number',
        sourceSystem: 'ITSM-6197',
        integrated: false,
        createdBy: 'system',
        createdAt: new Date('2025-01-01'),
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null,
        permitTypeIds: [10, 20, 30]
      });
      expect(result[1]).toEqual({
        sourceSystemKindId: 2,
        kind: null,
        description: 'Authorization Number',
        sourceSystem: 'ITSM-5939',
        integrated: true,
        createdBy: 'system',
        createdAt: new Date('2025-01-01'),
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null,
        permitTypeIds: [5]
      });
    });

    it('should return source system kinds with empty permitTypeIds when no xref exists', async () => {
      const mockResponse = [
        {
          sourceSystemKindId: 3,
          kind: null,
          description: 'Tracking Number',
          sourceSystem: 'ITSM-6117',
          integrated: false,
          createdBy: 'system',
          createdAt: new Date('2025-01-01'),
          updatedBy: null,
          updatedAt: null,
          deletedBy: null,
          deletedAt: null,
          permitTypeSourceSystemKindXref: []
        }
      ];

      prismaTxMock.source_system_kind.findMany.mockResolvedValue(mockResponse);

      const result = await getSourceSystemKinds(prismaTxMock);

      expect(result).toHaveLength(1);
      expect(result[0].permitTypeIds).toEqual([]);
    });

    it('should return empty array when no source system kinds exist', async () => {
      prismaTxMock.source_system_kind.findMany.mockResolvedValue([]);

      const result = await getSourceSystemKinds(prismaTxMock);

      expect(result).toEqual([]);
    });

    it('should order results by sourceSystem ascending', async () => {
      const mockResponse = [
        {
          sourceSystemKindId: 1,
          kind: null,
          description: 'Test A',
          sourceSystem: 'ITSM-1000',
          integrated: false,
          createdBy: 'system',
          createdAt: new Date('2025-01-01'),
          updatedBy: null,
          updatedAt: null,
          deletedBy: null,
          deletedAt: null,
          permitTypeSourceSystemKindXref: []
        },
        {
          sourceSystemKindId: 2,
          kind: null,
          description: 'Test B',
          sourceSystem: 'ITSM-2000',
          integrated: false,
          createdBy: 'system',
          createdAt: new Date('2025-01-01'),
          updatedBy: null,
          updatedAt: null,
          deletedBy: null,
          deletedAt: null,
          permitTypeSourceSystemKindXref: []
        }
      ];

      prismaTxMock.source_system_kind.findMany.mockResolvedValue(mockResponse);

      await getSourceSystemKinds(prismaTxMock);

      expect(prismaTxMock.source_system_kind.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            sourceSystem: 'asc'
          }
        })
      );
    });
  });
});
