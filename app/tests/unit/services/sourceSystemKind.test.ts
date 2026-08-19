import { mockReset } from 'vitest-mock-extended';

import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import { listSourceSystemKindsService } from '#src/services/sourceSystemKind';

vi.mock('config');

describe('sourceSystemKind service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('listSourceSystemKindsService', () => {
    it('delegates to repo.list() and returns result', async () => {
      const mockResult = [
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
          permitTypeIds: [10, 20, 30]
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
          permitTypeIds: [5]
        }
      ];

      mockRepos.sourceSystemKind.list.mockResolvedValue(mockResult as never);

      const result = await listSourceSystemKindsService();

      expect(mockRepos.sourceSystemKind.list).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('returns result with empty permitTypeIds when no xref exists', async () => {
      const mockResult = [
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
          permitTypeIds: []
        }
      ];

      mockRepos.sourceSystemKind.list.mockResolvedValue(mockResult as never);

      const result = await listSourceSystemKindsService();

      expect(result).toHaveLength(1);
      expect(result[0].permitTypeIds).toEqual([]);
    });

    it('returns empty array when no source system kinds exist', async () => {
      mockRepos.sourceSystemKind.list.mockResolvedValue([] as never);

      const result = await listSourceSystemKindsService();

      expect(result).toEqual([]);
    });

    it('returns multiple source system kinds in expected order', async () => {
      const mockResult = [
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
          permitTypeIds: []
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
          permitTypeIds: []
        }
      ];

      mockRepos.sourceSystemKind.list.mockResolvedValue(mockResult as never);

      const result = await listSourceSystemKindsService();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockResult);
    });
  });
});
