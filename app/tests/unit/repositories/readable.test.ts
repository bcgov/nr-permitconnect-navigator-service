import { TEST_ENQUIRY_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { ReadableRepository } from '../../../src/repositories/readable.ts';

import type { PrismaTransactionClient } from '../../../src/db/database.ts';

// Tiny concrete subclass exposing the protected constructor over a real (deep-mocked) delegate.
class TestReadableRepository extends ReadableRepository<PrismaTransactionClient['enquiry']> {
  constructor(softDeleteEnabled = false) {
    super(prismaTxMock.enquiry, softDeleteEnabled);
  }
}

describe('ReadableRepository', () => {
  describe('count', () => {
    it('passes args through to the delegate and returns the result', async () => {
      const repo = new TestReadableRepository();
      prismaTxMock.enquiry.count.mockResolvedValueOnce(3);

      const result = await repo.count({ where: { enquiryId: 'e1' } });

      expect(prismaTxMock.enquiry.count).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.count).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
      expect(result).toBe(3);
    });
  });

  describe('findMany', () => {
    it('passes args through to the delegate and returns the result', async () => {
      const repo = new TestReadableRepository();
      prismaTxMock.enquiry.findMany.mockResolvedValueOnce([TEST_ENQUIRY_1]);

      const result = await repo.findMany({ where: { enquiryId: 'e1' } });

      expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
      expect(result).toStrictEqual([TEST_ENQUIRY_1]);
    });
  });

  describe('findFirst', () => {
    it('passes args through to the delegate and returns the result', async () => {
      const repo = new TestReadableRepository();
      prismaTxMock.enquiry.findFirst.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.findFirst({ where: { enquiryId: 'e1' } });

      expect(prismaTxMock.enquiry.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.findFirst).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });
  });

  describe('findFirstOrThrow', () => {
    it('passes args through to the delegate and returns the result', async () => {
      const repo = new TestReadableRepository();
      prismaTxMock.enquiry.findFirstOrThrow.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.findFirstOrThrow({ where: { enquiryId: 'e1' } });

      expect(prismaTxMock.enquiry.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.findFirstOrThrow).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });
  });

  describe('findUnique', () => {
    it('passes args through to the delegate and returns the result', async () => {
      const repo = new TestReadableRepository();
      prismaTxMock.enquiry.findUnique.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.findUnique({ where: { enquiryId: 'e1' } });

      expect(prismaTxMock.enquiry.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.findUnique).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });
  });

  describe('findUniqueOrThrow', () => {
    it('returns the entity when one is found', async () => {
      const repo = new TestReadableRepository();
      prismaTxMock.enquiry.findUnique.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.findUniqueOrThrow({ where: { enquiryId: 'e1' } });

      expect(prismaTxMock.enquiry.findUnique).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });

    it('throws when no entity is found', async () => {
      const repo = new TestReadableRepository();
      prismaTxMock.enquiry.findUnique.mockResolvedValueOnce(null);

      await expect(repo.findUniqueOrThrow({ where: { enquiryId: 'e1' } })).rejects.toThrow(
        '[404] Record Not Found (/problems/not-found)'
      );
    });
  });

  describe('withNotDeleted', () => {
    it('adds deletedAt:null when soft delete is enabled and includeDeleted is not set', async () => {
      const repo = new TestReadableRepository(true);
      prismaTxMock.enquiry.findMany.mockResolvedValueOnce([]);

      await repo.findMany({ where: { enquiryId: 'e1' } });

      expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledWith({
        where: { enquiryId: 'e1', deletedAt: null }
      });
    });

    it('defaults to a where with deletedAt:null when soft delete is enabled and no args are given', async () => {
      const repo = new TestReadableRepository(true);
      prismaTxMock.enquiry.findMany.mockResolvedValueOnce([]);

      await repo.findMany();

      expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledWith({ where: { deletedAt: null } });
    });

    it('does not add deletedAt:null when includeDeleted is true', async () => {
      const repo = new TestReadableRepository(true);
      prismaTxMock.enquiry.findMany.mockResolvedValueOnce([]);

      await repo.findMany({ where: { enquiryId: 'e1' } }, { includeDeleted: true });

      expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
    });

    it('does not add deletedAt:null when soft delete is disabled', async () => {
      const repo = new TestReadableRepository(false);
      prismaTxMock.enquiry.findMany.mockResolvedValueOnce([]);

      await repo.findMany({ where: { enquiryId: 'e1' } });

      expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
    });
  });
});
