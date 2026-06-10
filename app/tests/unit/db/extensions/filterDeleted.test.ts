import filterDeletedTransform from '../../../../src/db/extensions/filterDeleted.ts';
import { captureExtension } from './captureExtension.ts';

const ext = captureExtension(filterDeletedTransform);

const SOFT_DELETED_MODELS = [
  'activity',
  'enquiry',
  'electrification_project',
  'general_project',
  'housing_project',
  'note_history',
  'permit',
  'permit_note'
];

const EXCLUDED_OPERATIONS = ['create', 'createMany', 'createManyAndReturn'];

describe('filterDeleted extension', () => {
  it.each(SOFT_DELETED_MODELS)('registers an $allOperations handler for %s', (model) => {
    expect(typeof ext.query[model].$allOperations).toBe('function');
  });

  it.each(SOFT_DELETED_MODELS)('injects deletedAt: null into the where clause for %s.findMany', async (model) => {
    const query = vi.fn().mockResolvedValue('ok');

    await ext.query[model].$allOperations({
      operation: 'findMany',
      args: { where: { id: 'a' } },
      query
    });

    expect(query).toHaveBeenCalledWith({ where: { id: 'a', deletedAt: null } });
  });

  it('creates a where clause when one is missing', async () => {
    const query = vi.fn().mockResolvedValue('ok');

    await ext.query.activity.$allOperations({
      operation: 'findFirst',
      args: {},
      query
    });

    expect(query).toHaveBeenCalledWith({ where: { deletedAt: null } });
  });

  it.each(EXCLUDED_OPERATIONS)('passes args through unchanged for %s operations', async (operation) => {
    const query = vi.fn().mockResolvedValue('ok');
    const args = { data: { foo: 'bar' } };

    await ext.query.activity.$allOperations({ operation, args, query });

    expect(query).toHaveBeenCalledWith(args);
  });
});
