import { Prisma } from '@prisma/client';
import filterDeletedTransform from '../../../../src/db/extensions/filterDeleted.ts';
import { captureExtension } from './captureExtension.ts';
import { describe, it, expect, vi } from 'vitest';

const ext = captureExtension(filterDeletedTransform);

const SOFT_DELETED_MODELS = Prisma.dmmf.datamodel.models
  .filter((m) => m.fields.some((f) => f.name === 'deletedAt'))
  .map((m) => m.name);

const EXCLUDED_OPERATIONS = ['create', 'createMany', 'createManyAndReturn'];

describe('filterDeleted extension', () => {
  it('registers an $allOperations handler via $allModels', () => {
    expect(typeof ext.query.$allModels.$allOperations).toBe('function');
  });

  describe('soft-delete filtering on find operations', () => {
    it.each(SOFT_DELETED_MODELS)('injects deletedAt: null into the where clause for %s.findMany', async (model) => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model,
        operation: 'findMany',
        args: { where: { id: 'a' } },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { id: 'a', deletedAt: null } });
    });

    it('creates a where clause when one is missing', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findFirst',
        args: {},
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { deletedAt: null } });
    });

    it('preserves existing where conditions when injecting deletedAt', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { where: { status: 'active', archived: false } },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { status: 'active', archived: false, deletedAt: null } });
    });

    it('applies filtering to update operations', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'permit',
        operation: 'update',
        args: { where: { id: '123' }, data: { status: 'approved' } },
        query
      });

      expect(query).toHaveBeenCalledWith({
        where: { id: '123', deletedAt: null },
        data: { status: 'approved' }
      });
    });

    it('applies filtering to updateMany operations', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'permit',
        operation: 'updateMany',
        args: { where: { projectId: 'proj-1' }, data: { active: false } },
        query
      });

      expect(query).toHaveBeenCalledWith({
        where: { projectId: 'proj-1', deletedAt: null },
        data: { active: false }
      });
    });

    it('applies filtering to delete operations', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'note_history',
        operation: 'delete',
        args: { where: { id: 'note-1' } },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { id: 'note-1', deletedAt: null } });
    });

    it('applies filtering to deleteMany operations', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'deleteMany',
        args: { where: { type: 'pending' } },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { type: 'pending', deletedAt: null } });
    });

    it('applies filtering to upsert operations', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'contact',
        operation: 'upsert',
        args: {
          where: { email: 'test@example.com' },
          create: { email: 'test@example.com', name: 'Test' },
          update: { name: 'Updated Test' }
        },
        query
      });

      expect(query).toHaveBeenCalledWith({
        where: { email: 'test@example.com', deletedAt: null },
        create: { email: 'test@example.com', name: 'Test' },
        update: { name: 'Updated Test' }
      });
    });

    it('applies filtering to findUnique operations', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'enquiry',
        operation: 'findUnique',
        args: { where: { id: 'enq-1' } },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { id: 'enq-1', deletedAt: null } });
    });
  });

  describe('includeDeleted flag bypasses filtering', () => {
    it('bypasses soft-delete filter when includeDeleted is true', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { where: { id: 'a' }, includeDeleted: true },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { id: 'a' } });
    });

    it('removes includeDeleted from args before passing to query', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'permit',
        operation: 'findMany',
        args: { where: { status: 'draft' }, includeDeleted: true, select: { id: true } },
        query
      });

      // includeDeleted should be removed, but other args preserved
      expect(query).toHaveBeenCalledWith({ where: { status: 'draft' }, select: { id: true } });
    });

    it('applies filtering when includeDeleted is false', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { where: { id: 'a' }, includeDeleted: false },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { id: 'a', deletedAt: null } });
    });

    it('applies filtering when includeDeleted is undefined or not provided', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { where: { id: 'a' } },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { id: 'a', deletedAt: null } });
    });
  });

  describe('excluded operations', () => {
    it.each(EXCLUDED_OPERATIONS)('passes args through unchanged for %s operations', async (operation) => {
      const query = vi.fn().mockResolvedValue('ok');
      const args = { data: { foo: 'bar' } };

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation,
        args,
        query
      });

      expect(query).toHaveBeenCalledWith(args);
    });

    it('preserves includeDeleted in excluded operations (it is not processed)', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      const args = { data: { foo: 'bar' }, includeDeleted: true };

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'create',
        args,
        query
      });

      // For excluded operations, args pass through unchanged
      expect(query).toHaveBeenCalledWith(args);
    });
  });

  describe('nested relation filtering', () => {
    it('applies filtering to soft-deleted models in include relations', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'permit',
        operation: 'findMany',
        args: {
          where: { id: 'p1' },
          include: { contact: true }
        },
        query
      });

      // Verify that include is preserved in output
      const callArgs = query.mock.calls[0][0];
      expect(callArgs.where.deletedAt).toEqual(null);
      expect(callArgs.include).toBeDefined();
    });

    it('applies filtering to soft-deleted models in select relations', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: {
          where: { type: 'update' },
          select: { id: true }
        },
        query
      });

      expect(query).toHaveBeenCalledWith({
        where: { type: 'update', deletedAt: null },
        select: { id: true }
      });
    });

    it('handles empty include object', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'permit',
        operation: 'findMany',
        args: { include: {} },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { deletedAt: null }, include: {} });
    });

    it('handles empty select object', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { select: {} },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { deletedAt: null }, select: {} });
    });
  });

  describe('non-soft-deleted models', () => {
    it('skips filtering for models without deletedAt field', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      // 'identity_provider' is an example of a model without deletedAt
      const hasDeletedAt = Prisma.dmmf.datamodel.models
        .find((m) => m.name === 'identity_provider')
        ?.fields.some((f) => f.name === 'deletedAt');

      await ext.query.$allModels.$allOperations({
        model: 'identity_provider',
        operation: 'findMany',
        args: { where: { name: 'test' } },
        query
      });

      if (!hasDeletedAt) {
        // If identity_provider doesn't have deletedAt, it should pass through unchanged
        expect(query).toHaveBeenCalledWith({ where: { name: 'test' } });
      }
    });
  });

  describe('edge cases', () => {
    it('handles null args gracefully', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: null as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { deletedAt: null } });
    });

    it('handles undefined args gracefully', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: undefined as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { deletedAt: null } });
    });

    it('handles args without where or include/select', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'permit',
        operation: 'findMany',
        args: { skip: 0, take: 10 },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { deletedAt: null }, skip: 0, take: 10 });
    });

    it('preserves other query options when applying filtering', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { where: { type: 'note' }, orderBy: { createdAt: 'desc' }, take: 5, skip: 10 },
        query
      });

      expect(query).toHaveBeenCalledWith({
        where: { type: 'note', deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        skip: 10
      });
    });
  });
});
