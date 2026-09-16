import { buildRelationsMap } from '#src/db/generators/relations';

describe('buildRelationsMap', () => {
  it('collects relation fields per model, keyed by field name', () => {
    const models = [
      {
        name: 'activity',
        fields: [
          { name: 'activityId', kind: 'scalar', type: 'String', isList: false },
          {
            name: 'initiative',
            kind: 'object',
            type: 'initiative',
            isList: false,
            relationName: 'ActivityToInitiative'
          },
          { name: 'permit', kind: 'object', type: 'permit', isList: true, relationName: 'ActivityToPermit' }
        ]
      }
    ];

    expect(buildRelationsMap(models)).toEqual({
      activity: {
        initiative: { targetModel: 'initiative', isList: false },
        permit: { targetModel: 'permit', isList: true }
      }
    });
  });

  it('excludes scalar fields', () => {
    const models = [
      {
        name: 'permit_type',
        fields: [
          { name: 'permitTypeId', kind: 'scalar', type: 'Int', isList: false },
          { name: 'name', kind: 'scalar', type: 'String', isList: false }
        ]
      }
    ];

    expect(buildRelationsMap(models)).toEqual({});
  });

  it('excludes object-kind fields with no relationName', () => {
    const models = [
      {
        name: 'note',
        fields: [{ name: 'metadata', kind: 'object', type: 'Json', isList: false }]
      }
    ];

    expect(buildRelationsMap(models)).toEqual({});
  });

  it('omits models with zero relations from the output entirely', () => {
    const models = [{ name: 'knex_migrations', fields: [{ name: 'id', kind: 'scalar', type: 'Int', isList: false }] }];

    const result = buildRelationsMap(models);

    expect(result).toEqual({});
    expect(Object.prototype.hasOwnProperty.call(result, 'knex_migrations')).toBe(false);
  });

  it('handles multiple models independently', () => {
    const models = [
      {
        name: 'draft',
        fields: [{ name: 'activity', kind: 'object', type: 'activity', isList: false, relationName: 'ActivityToDraft' }]
      },
      {
        name: 'draft_code',
        fields: [{ name: 'draft', kind: 'object', type: 'draft', isList: true, relationName: 'DraftToDraftCode' }]
      }
    ];

    expect(buildRelationsMap(models)).toEqual({
      draft: { activity: { targetModel: 'activity', isList: false } },
      draft_code: { draft: { targetModel: 'draft', isList: true } }
    });
  });
});
