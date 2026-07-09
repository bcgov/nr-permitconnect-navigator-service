import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { WritableRepository } from '../../../src/repositories/writable.ts';
import { TEST_ENQUIRY_1 } from '../data/index.ts';

import type { PrismaTransactionClient } from '../../../src/db/database.ts';

const PRINCIPAL = 'principal-id';

// Tiny concrete subclass exposing the protected constructor over a real (deep-mocked) delegate.
class TestWritableRepository extends WritableRepository<PrismaTransactionClient['enquiry']> {
  constructor(softDeleteEnabled = false) {
    super(prismaTxMock.enquiry, PRINCIPAL, softDeleteEnabled);
  }
}

const CREATE_DATA = {
  enquiryId: 'e1',
  activityId: 'ACTI1234',
  submittedAt: new Date(),
  submittedBy: 'testuser'
};

describe('WritableRepository', () => {
  describe('execute error handling', () => {
    it('catches and maps Prisma errors during execution', async () => {
      const repo = new TestWritableRepository();
      prismaTxMock.enquiry.create.mockRejectedValueOnce(new Error('Prisma error'));

      await expect(repo.create(CREATE_DATA)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('stamps create audit fields and calls the delegate', async () => {
      const repo = new TestWritableRepository();
      prismaTxMock.enquiry.create.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.create(CREATE_DATA);

      expect(prismaTxMock.enquiry.create).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.create).toHaveBeenCalledWith({
        data: { ...CREATE_DATA, createdAt: expect.any(Date), createdBy: PRINCIPAL }
      });
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });
  });

  describe('createIfNotExists', () => {
    it('stamps create audit fields and calls upsert with empty update', async () => {
      const repo = new TestWritableRepository();
      prismaTxMock.enquiry.upsert.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.createIfNotExists({ enquiryId: 'e1' }, CREATE_DATA);

      expect(prismaTxMock.enquiry.upsert).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.upsert).toHaveBeenCalledWith({
        where: { enquiryId: 'e1' },
        create: { ...CREATE_DATA, createdAt: expect.any(Date), createdBy: PRINCIPAL },
        update: {}
      });
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });
  });

  describe('update', () => {
    it('stamps update audit fields and calls the delegate', async () => {
      const repo = new TestWritableRepository();
      prismaTxMock.enquiry.update.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.update({ enquiryId: 'e1' }, { enquiryStatus: 'NEW' });

      expect(prismaTxMock.enquiry.update).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.update).toHaveBeenCalledWith({
        where: { enquiryId: 'e1' },
        data: { enquiryStatus: 'NEW', updatedAt: expect.any(Date), updatedBy: PRINCIPAL }
      });
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });
  });

  describe('upsert', () => {
    it('stamps create audit on create and update audit on update', async () => {
      const repo = new TestWritableRepository();
      prismaTxMock.enquiry.upsert.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.upsert({ enquiryId: 'e1' }, CREATE_DATA, { enquiryStatus: 'NEW' });

      expect(prismaTxMock.enquiry.upsert).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.upsert).toHaveBeenCalledWith({
        where: { enquiryId: 'e1' },
        create: { ...CREATE_DATA, createdAt: expect.any(Date), createdBy: PRINCIPAL },
        update: { enquiryStatus: 'NEW', updatedAt: expect.any(Date), updatedBy: PRINCIPAL }
      });
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });
  });

  describe('delete', () => {
    it('soft deletes (update with audit + soft-delete stamps) when soft delete is enabled', async () => {
      const repo = new TestWritableRepository(true);
      prismaTxMock.enquiry.update.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.delete({ enquiryId: 'e1' });

      expect(prismaTxMock.enquiry.update).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.update).toHaveBeenCalledWith({
        where: { enquiryId: 'e1' },
        data: {
          updatedAt: expect.any(Date),
          updatedBy: PRINCIPAL,
          deletedAt: expect.any(Date),
          deletedBy: PRINCIPAL
        }
      });
      expect(prismaTxMock.enquiry.delete).not.toHaveBeenCalled();
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });

    it('hard deletes when the hard option is set even with soft delete enabled', async () => {
      const repo = new TestWritableRepository(true);
      prismaTxMock.enquiry.delete.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.delete({ enquiryId: 'e1' }, { hard: true });

      expect(prismaTxMock.enquiry.delete).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.delete).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
      expect(prismaTxMock.enquiry.update).not.toHaveBeenCalled();
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });

    it('hard deletes when soft delete is disabled', async () => {
      const repo = new TestWritableRepository(false);
      prismaTxMock.enquiry.delete.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.delete({ enquiryId: 'e1' });

      expect(prismaTxMock.enquiry.delete).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.delete).toHaveBeenCalledWith({ where: { enquiryId: 'e1' } });
      expect(prismaTxMock.enquiry.update).not.toHaveBeenCalled();
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });
  });

  describe('deleteMany', () => {
    it('soft deletes (update with audit + soft-delete stamps) when soft delete is enabled', async () => {
      const repo = new TestWritableRepository(true);
      prismaTxMock.enquiry.update.mockResolvedValueOnce(TEST_ENQUIRY_1);

      const result = await repo.deleteMany({ enquiryStatus: 'NEW' });

      expect(prismaTxMock.enquiry.update).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.update).toHaveBeenCalledWith({
        where: { enquiryStatus: 'NEW' },
        data: {
          updatedAt: expect.any(Date),
          updatedBy: PRINCIPAL,
          deletedAt: expect.any(Date),
          deletedBy: PRINCIPAL
        }
      });
      expect(prismaTxMock.enquiry.deleteMany).not.toHaveBeenCalled();
      expect(result).toStrictEqual(TEST_ENQUIRY_1);
    });

    it('hard deletes when the hard option is set even with soft delete enabled', async () => {
      const repo = new TestWritableRepository(true);
      prismaTxMock.enquiry.deleteMany.mockResolvedValueOnce({ count: 1 });

      await repo.deleteMany({ enquiryStatus: 'NEW' }, { hard: true });

      expect(prismaTxMock.enquiry.deleteMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.deleteMany).toHaveBeenCalledWith({ where: { enquiryStatus: 'NEW' } });
      expect(prismaTxMock.enquiry.update).not.toHaveBeenCalled();
    });

    it('hard deletes when soft delete is disabled', async () => {
      const repo = new TestWritableRepository(false);
      prismaTxMock.enquiry.deleteMany.mockResolvedValueOnce({ count: 1 });

      await repo.deleteMany({ enquiryStatus: 'NEW' });

      expect(prismaTxMock.enquiry.deleteMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.enquiry.deleteMany).toHaveBeenCalledWith({ where: { enquiryStatus: 'NEW' } });
      expect(prismaTxMock.enquiry.update).not.toHaveBeenCalled();
    });
  });
});
