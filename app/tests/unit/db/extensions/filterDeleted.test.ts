import { Prisma } from '#src/db/generated/client/client';

import { captureExtension } from './captureExtension.ts';
import filterDeletedTransform from '#src/db/extensions/filterDeleted';

const ext = captureExtension(filterDeletedTransform);

// Naming convention: `{Model[0].toUpperCase()}{model.slice(1)}ScalarFieldEnum` (Prisma's generated export name).
const scalarFieldEnums = Prisma as unknown as Record<string, Record<string, string> | undefined>;

const SOFT_DELETED_MODELS = Object.values(Prisma.ModelName).filter((name) => {
  const fieldEnum = scalarFieldEnums[`${name[0].toUpperCase()}${name.slice(1)}ScalarFieldEnum`];
  return fieldEnum !== undefined && 'deletedAt' in fieldEnum;
});

const EXCLUDED_OPERATIONS = ['create', 'createMany', 'createManyAndReturn'];

describe('filterDeleted extension', () => {
  const run = async (model: string, args: Record<string, unknown>, operation = 'findMany') => {
    const query = vi.fn().mockResolvedValue('ok');
    await ext.query.$allModels.$allOperations({ model, operation, args, query });
    return query.mock.calls[0][0];
  };

  it('registers an $allOperations handler via $allModels', () => {
    expect(typeof ext.query.$allModels.$allOperations).toBe('function');
  });

  it('detects soft deleted models', () => {
    // Guards the it.each below, which would silently generate zero tests if detection broke
    expect(SOFT_DELETED_MODELS).toEqual(expect.arrayContaining(['activity', 'activity_contact', 'contact', 'permit']));
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

    it.each(['count', 'aggregate', 'groupBy'])('applies filtering to %s operations', async (operation) => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'housing_project',
        operation,
        args: { where: { applicationStatus: 'New' } },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { applicationStatus: 'New', deletedAt: null } });
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

    it('bypasses filtering for the entire query, including nested relations', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { includeDeleted: true, include: { activityContact: { include: { contact: true } } } },
        query
      });

      expect(query).toHaveBeenCalledWith({ include: { activityContact: { include: { contact: true } } } });
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
    it('filters list includes and leaves to-one includes alone, at any depth', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'housing_project',
        operation: 'findMany',
        args: { include: { activity: { include: { activityContact: { include: { contact: true } } } } } },
        query
      });

      expect(query).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: {
          // to-one relations can't take a where in Prisma
          activity: {
            include: {
              activityContact: {
                where: { deletedAt: null },
                include: { contact: {} }
              }
            }
          }
        }
      });
    });

    it('converts a boolean list include into a filtered include', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { include: { activityContact: true } },
        query
      });

      expect(query).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: { activityContact: { where: { deletedAt: null } } }
      });
    });

    it('preserves an existing where on a nested list include', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { include: { activityContact: { where: { role: 'PRIMARY' } } } },
        query
      });

      expect(query).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: { activityContact: { where: { role: 'PRIMARY', deletedAt: null } } }
      });
    });

    it('leaves a false include untouched', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { include: { activityContact: false } },
        query
      });

      expect(query).toHaveBeenCalledWith({ where: { deletedAt: null }, include: { activityContact: false } });
    });

    it('filters list relations inside a select', async () => {
      const query = vi.fn().mockResolvedValue('ok');

      await ext.query.$allModels.$allOperations({
        model: 'activity',
        operation: 'findMany',
        args: { select: { activityId: true, activityContact: { select: { contactId: true } } } },
        query
      });

      expect(query).toHaveBeenCalledWith({
        where: { deletedAt: null },
        select: { activityId: true, activityContact: { select: { contactId: true }, where: { deletedAt: null } } }
      });
    });

    it('does not mutate the caller args', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      const args = { where: { activityId: 'a1' }, include: { activityContact: { include: { contact: true } } } };
      const original = structuredClone(args);

      await ext.query.$allModels.$allOperations({ model: 'activity', operation: 'findMany', args, query });

      // Search repositories reuse one where object for findMany and count
      expect(args).toEqual(original);
    });

    it('passes through a select without relations', async () => {
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

  describe('_count selections', () => {
    const live = { where: { deletedAt: null } };

    it('filters a counted list relation', async () => {
      const result = await run('activity', { include: { _count: { select: { permit: true } } } });

      expect(result.include).toEqual({ _count: { select: { permit: live } } });
    });

    it('keeps and walks an existing where on a counted relation', async () => {
      const result = await run('activity', {
        include: { _count: { select: { permit: { where: { needed: 'Yes', permitType: { name: 'x' } } } } } }
      });

      expect(result.include).toEqual({
        _count: {
          select: {
            permit: { where: { needed: 'Yes', permitType: { name: 'x', deletedAt: null }, deletedAt: null } }
          }
        }
      });
    });

    it('expands _count: true into a filtered count of every list relation', async () => {
      const result = await run('activity', { include: { _count: true } });

      expect(result.include).toEqual({
        _count: {
          select: {
            activityContact: live,
            document: live,
            draft: live,
            enquiry: live,
            noteHistory: live,
            permit: live
          }
        }
      });
    });

    it('filters _count inside a select', async () => {
      const result = await run('activity', { select: { activityId: true, _count: { select: { permit: true } } } });

      expect(result.select).toEqual({ activityId: true, _count: { select: { permit: live } } });
    });

    it('filters _count in nested includes', async () => {
      // The project search shape
      const result = await run('housing_project', {
        include: { activity: { include: { _count: { select: { permit: { where: { needed: 'Yes' } } } } } } }
      });

      expect(result.include).toEqual({
        activity: { include: { _count: { select: { permit: { where: { needed: 'Yes', deletedAt: null } } } } } }
      });
    });

    it.each([
      { name: '_count: false', include: { _count: false } },
      { name: 'a relation counted as false', include: { _count: { select: { permit: false } } } }
    ])('leaves $name alone', async ({ include }) => {
      const result = await run('activity', { include });

      expect(result.include).toEqual(include);
    });

    it('leaves _count alone when includeDeleted is true', async () => {
      const include = { _count: { select: { permit: true } } };

      const result = await run('activity', { include, includeDeleted: true });

      expect(result).toEqual({ include });
    });
  });

  describe('relation filters in where', () => {
    const contactFilter = { activityContact: { some: { contactId: 'c1' } } };
    const filteredContactFilter = { activityContact: { some: { contactId: 'c1', deletedAt: null } } };

    it('filters list relations under some', async () => {
      const result = await run('activity', { where: contactFilter });

      expect(result.where).toEqual({ ...filteredContactFilter, deletedAt: null });
    });

    it('filters list relations under none', async () => {
      const result = await run('activity', { where: { activityContact: { none: { contactId: 'c1' } } } });

      expect(result.where).toEqual({
        activityContact: { none: { contactId: 'c1', deletedAt: null } },
        deletedAt: null
      });
    });

    it('filters to-one relations given as a direct filter', async () => {
      const result = await run('activity_contact', { where: { contact: { userId: 'u1' } } });

      expect(result.where).toEqual({ contact: { userId: 'u1', deletedAt: null }, deletedAt: null });
    });

    it('filters to-one relations given with is', async () => {
      const result = await run('activity_contact', { where: { contact: { is: { userId: 'u1' } } } });

      expect(result.where).toEqual({ contact: { is: { userId: 'u1', deletedAt: null } }, deletedAt: null });
    });

    it('treats isNot: null as requiring a live related record', async () => {
      const result = await run('permit', { where: { activity: { housingProject: { isNot: null } } } });

      expect(result.where).toEqual({
        activity: { housingProject: { is: { deletedAt: null } }, deletedAt: null },
        deletedAt: null
      });
    });

    it('rewrites every so only live related rows must match', async () => {
      // A nested deletedAt: null inside every would fail whenever any soft-deleted row exists
      const result = await run('activity', { where: { activityContact: { every: { role: 'PRIMARY' } } } });

      expect(result.where).toEqual({
        activityContact: { none: { deletedAt: null, NOT: { role: 'PRIMARY' } } },
        deletedAt: null
      });
    });

    it('walks relations nested inside every', async () => {
      const result = await run('activity', { where: { activityContact: { every: { contact: { userId: 'u1' } } } } });

      expect(result.where).toEqual({
        activityContact: { none: { deletedAt: null, NOT: { contact: { userId: 'u1', deletedAt: null } } } },
        deletedAt: null
      });
    });

    it('merges every into an existing none', async () => {
      const result = await run('activity', {
        where: { activityContact: { every: { role: 'PRIMARY' }, none: { contactId: 'c1' } } }
      });

      expect(result.where).toEqual({
        activityContact: { none: { deletedAt: null, OR: [{ contactId: 'c1' }, { NOT: { role: 'PRIMARY' } }] } },
        deletedAt: null
      });
    });

    it.each([
      { name: 'an empty every', every: {} },
      { name: 'an every with only undefined conditions', every: { role: undefined } },
      { name: 'an every with an empty AND', every: { AND: [] } },
      { name: 'an every with a nested empty AND', every: { AND: [{ role: undefined }, { AND: {} }] } },
      { name: 'an every with an empty NOT', every: { NOT: [] } },
      { name: 'an every with an OR containing an empty branch', every: { OR: [{ role: 'PRIMARY' }, {}] } }
    ])('leaves $name as written, since it is always true', async ({ every }) => {
      // Rewriting to none + NOT: {} would break it, as Prisma treats NOT: {} as no condition
      const result = await run('activity', { where: { activityContact: { every } } });

      expect(result.where).toEqual({ activityContact: { every }, deletedAt: null });
    });

    it.each([
      { name: 'an empty OR', every: { OR: [] } },
      { name: 'an OR whose branches all have conditions', every: { OR: [{ role: 'PRIMARY' }, { role: 'ADMIN' }] } },
      { name: 'an AND with a nested condition', every: { AND: [{}, { AND: [{ role: 'PRIMARY' }] }] } }
    ])('rewrites $name, since it is not always true', async ({ every }) => {
      // An empty OR is always false, so every live related row failing it means there are none
      const result = await run('activity', { where: { activityContact: { every } } });

      expect(result.where).toEqual({ activityContact: { none: { deletedAt: null, NOT: every } }, deletedAt: null });
    });

    it('still filters none alongside an empty every', async () => {
      const result = await run('activity', { where: { activityContact: { every: {}, none: { contactId: 'c1' } } } });

      expect(result.where).toEqual({
        activityContact: { every: {}, none: { contactId: 'c1', deletedAt: null } },
        deletedAt: null
      });
    });

    it('treats isNot with a filter as no live related record matching it', async () => {
      const result = await run('activity', { where: { housingProject: { isNot: { projectName: 'x' } } } });

      expect(result.where).toEqual({
        housingProject: { isNot: { projectName: 'x', deletedAt: null } },
        deletedAt: null
      });
    });

    it.each([
      { name: 'is: null', filter: { housingProject: { is: null } } },
      { name: 'a null relation', filter: { housingProject: null } }
    ])('treats $name as no live related record', async ({ filter }) => {
      const result = await run('activity', { where: filter });

      expect(result.where).toEqual({ housingProject: { isNot: { deletedAt: null } }, deletedAt: null });
    });

    it('walks nested relations at any depth', async () => {
      const result = await run('housing_project', {
        where: { activity: { activityContact: { some: { contact: { userId: 'u1' } } } } }
      });

      expect(result.where).toEqual({
        activity: {
          activityContact: { some: { contact: { userId: 'u1', deletedAt: null }, deletedAt: null } },
          deletedAt: null
        },
        deletedAt: null
      });
    });

    it('walks AND, OR and NOT given as arrays', async () => {
      const result = await run('activity', {
        where: { AND: [contactFilter], OR: [contactFilter], NOT: [contactFilter] }
      });

      expect(result.where).toEqual({
        AND: [filteredContactFilter],
        OR: [filteredContactFilter],
        NOT: [filteredContactFilter],
        deletedAt: null
      });
    });

    it('walks AND and NOT given as objects', async () => {
      const result = await run('activity', { where: { AND: contactFilter, NOT: contactFilter } });

      expect(result.where).toEqual({ AND: filteredContactFilter, NOT: filteredContactFilter, deletedAt: null });
    });

    it('leaves scalar filters alone', async () => {
      const where = { activityId: { contains: 'ACT' }, createdAt: { gte: new Date(0) } };

      const result = await run('activity', { where });

      expect(result.where).toEqual({ ...where, deletedAt: null });
    });

    it('keeps an explicit deletedAt: null in a relation filter', async () => {
      const result = await run('activity', { where: filteredContactFilter });

      expect(result.where).toEqual({ ...filteredContactFilter, deletedAt: null });
    });

    it('filters relation filters inside a nested include where', async () => {
      const result = await run('activity', { include: { activityContact: { where: { contact: { userId: 'u1' } } } } });

      expect(result.include).toEqual({
        activityContact: { where: { contact: { userId: 'u1', deletedAt: null }, deletedAt: null } }
      });
    });

    it('applies relation filtering to count so totals match the page', async () => {
      const result = await run('activity', { where: contactFilter }, 'count');

      expect(result.where).toEqual({ ...filteredContactFilter, deletedAt: null });
    });

    it('does not walk write data', async () => {
      const data = { activityContact: { deleteMany: { contactId: 'c1' } } };

      const result = await run('activity', { where: { activityId: 'a1' }, data }, 'update');

      expect(result).toEqual({ where: { activityId: 'a1', deletedAt: null }, data });
    });

    it('leaves relation filters alone when includeDeleted is true', async () => {
      const result = await run('activity', { where: contactFilter, includeDeleted: true });

      expect(result).toEqual({ where: contactFilter });
    });

    it('does not mutate the caller relation filter', async () => {
      const where = { activity: { activityContact: { some: { contact: { userId: 'u1' } } } } };
      const original = structuredClone(where);

      await run('housing_project', { where });

      expect(where).toEqual(original);
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
