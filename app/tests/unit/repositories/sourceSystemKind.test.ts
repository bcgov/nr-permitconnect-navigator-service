import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { SourceSystemKindRepository } from '../../../src/repositories/sourceSystemKind.ts';
import { PeachIntegratedSystem } from '../../../src/utils/enums/permit.ts';

// Test data for sourceSystemKind
const TEST_SOURCE_SYSTEM_KIND_1 = {
  sourceSystemKindId: 1,
  sourceSystem: PeachIntegratedSystem.VFCBC,
  integrated: true,
  kind: null,
  description: 'Tracking Number',
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedAt: null,
  deletedBy: null,
  permitTypeSourceSystemKindXref: [{ permitTypeId: 10 }, { permitTypeId: 20 }]
};

const TEST_SOURCE_SYSTEM_KIND_2 = {
  sourceSystemKindId: 2,
  sourceSystem: 'ITSM-5644',
  integrated: false,
  kind: null,
  description: 'Project Number',
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedAt: null,
  deletedBy: null,
  permitTypeSourceSystemKindXref: [{ permitTypeId: 30 }]
};

// Construct the real repo — its constructor picks tx.source_system_kind, so prismaTxMock.source_system_kind
// acts as the deep-mocked delegate. prismaMock setup resets it before each test.
const makeRepo = () => new SourceSystemKindRepository(prismaTxMock, 'principal-id');

describe('SourceSystemKindRepository', () => {
  describe('list', () => {
    it('retrieves all source system kinds ordered by sourceSystem', async () => {
      prismaTxMock.source_system_kind.findMany.mockResolvedValueOnce([
        TEST_SOURCE_SYSTEM_KIND_1,
        TEST_SOURCE_SYSTEM_KIND_2
      ]);

      await makeRepo().list();

      expect(prismaTxMock.source_system_kind.findMany).toHaveBeenCalledTimes(1);
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
    });

    it('transforms permitTypeSourceSystemKindXref to permitTypeIds array', async () => {
      prismaTxMock.source_system_kind.findMany.mockResolvedValueOnce([
        TEST_SOURCE_SYSTEM_KIND_1,
        TEST_SOURCE_SYSTEM_KIND_2
      ]);

      const result = await makeRepo().list();

      expect(result).toEqual([
        {
          sourceSystemKindId: 1,
          sourceSystem: PeachIntegratedSystem.VFCBC,
          integrated: true,
          kind: null,
          description: 'Tracking Number',
          createdAt: null,
          createdBy: null,
          updatedAt: null,
          updatedBy: null,
          deletedAt: null,
          deletedBy: null,
          permitTypeIds: [10, 20]
        },
        {
          sourceSystemKindId: 2,
          sourceSystem: 'ITSM-5644',
          integrated: false,
          kind: null,
          description: 'Project Number',
          createdAt: null,
          createdBy: null,
          updatedAt: null,
          updatedBy: null,
          deletedAt: null,
          deletedBy: null,
          permitTypeIds: [30]
        }
      ]);
    });

    it('handles empty permitTypeSourceSystemKindXref array', async () => {
      const sourceSystemKindWithNoPermitTypes = {
        ...TEST_SOURCE_SYSTEM_KIND_1,
        permitTypeSourceSystemKindXref: []
      };

      prismaTxMock.source_system_kind.findMany.mockResolvedValueOnce([sourceSystemKindWithNoPermitTypes]);

      const result = await makeRepo().list();

      expect(result).toEqual([
        expect.objectContaining({
          sourceSystemKindId: 1,
          permitTypeIds: []
        })
      ]);
    });

    it('returns empty array when no source system kinds exist', async () => {
      prismaTxMock.source_system_kind.findMany.mockResolvedValueOnce([]);

      const result = await makeRepo().list();

      expect(result).toEqual([]);
    });
  });
});
