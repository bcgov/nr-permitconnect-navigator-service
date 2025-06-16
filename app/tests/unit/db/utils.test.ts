import { prismaMock } from '../../__mocks__/prismaMock';
import { castInput, checkDatabaseHealth, checkDatabaseSchema, prismaTypeFieldIndex } from '../../../src/db/utils/utils';

import { Prisma } from '@prisma/client';

describe('prismaTypeFieldIndex', () => {
  it('contains expected scalars and their DateTime fields', () => {
    expect(prismaTypeFieldIndex).toHaveProperty('DateTime');
    expect(prismaTypeFieldIndex.DateTime).toHaveProperty('activity');
    expect(prismaTypeFieldIndex.DateTime.activity).toEqual(expect.arrayContaining(['createdAt', 'updatedAt']));

    for (const [scalar, models] of Object.entries(prismaTypeFieldIndex)) {
      for (const [modelName, fields] of Object.entries(models)) {
        const modelMeta = Prisma.dmmf.datamodel.models.find((m) => m.name === modelName);
        expect(modelMeta).toBeDefined();
        fields.forEach((f) => {
          const fieldMeta = modelMeta!.fields.find((fm) => fm.name === f);
          expect(fieldMeta?.type).toBe(scalar);
        });
      }
    }
  });
});

describe('castInput - DateTime', () => {
  it('converts ISO strings to Date instances', () => {
    const model = 'activity';
    const payload: Record<string, unknown> = {
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-02T11:11:11Z',
      untouched: 'foo'
    };

    castInput(model, payload, ['DateTime']);

    expect(payload.createdAt).toBeInstanceOf(Date);
    expect((payload.createdAt as Date).toISOString()).toBe('2024-01-01T10:00:00.000Z');
    expect(payload.updatedAt).toBeInstanceOf(Date);
    expect(payload.untouched).toBe('foo');
  });

  it('is a no-op when model has no DateTime fields', () => {
    const payload: Record<string, unknown> = { some: 'value' };
    castInput('NonexistentModel', payload, ['DateTime']);
    expect(payload.some).toBe('value');
  });

  it('does nothing for non-object inputs', () => {
    expect(() => castInput('activity', null, ['DateTime'])).not.toThrow();
    expect(() => castInput('activity', 123, ['DateTime'])).not.toThrow();
  });
});

describe('castInput - Decimal', () => {
  it('wraps numbers in Prisma.Decimal', () => {
    const model = 'electrification_project';
    const payload: Record<string, unknown> = { megawatts: 3.14 };

    castInput(model, payload, ['Decimal']);

    expect(payload.megawatts).toBeInstanceOf(Prisma.Decimal);
    expect((payload.megawatts as Prisma.Decimal).toNumber()).toBeCloseTo(3.14);
  });
});

describe('checkDatabaseHealth', () => {
  it('should return true when the database is healthy', async () => {
    const queryRawSpy = jest.spyOn(prismaMock, '$queryRaw');

    prismaMock.$queryRaw.mockResolvedValue([{ result: 1 }]);
    const result = await checkDatabaseHealth();

    expect(queryRawSpy).toHaveBeenCalledWith(['SELECT 1 AS result']);
    expect(result).toBe(true);
  });

  it('should return false and log an error when the database is unhealthy', async () => {
    const queryRawSpy = jest.spyOn(prismaMock, '$queryRaw');

    prismaMock.$queryRaw.mockRejectedValue(new Error('Database error'));
    const result = await checkDatabaseHealth();

    expect(queryRawSpy).toHaveBeenCalledWith(['SELECT 1 AS result']);
    expect(result).toBe(false);
  });
});

describe('checkDatabaseSchema', () => {
  const freezeSpy = jest.spyOn(Object, 'freeze');

  it('should return true when the database schema matches the expected structure', async () => {
    const result = await checkDatabaseSchema();

    expect(result).toBe(true);
    expect(freezeSpy).toHaveBeenCalledTimes(1);
    expect(freezeSpy).toHaveBeenCalledWith({
      schemas: ['public', 'yars'],
      tables: [
        'access_request',
        'activity',
        'activity_contact',
        'contact',
        'document',
        'enquiry',
        'identity_provider',
        'initiative',
        'note',
        'permit',
        'permit_note',
        'permit_type',
        'user',
        'draft',
        'draft_code',
        'email_log',
        'electrification_project',
        'electrification_project_category_code',
        'electrification_project_type_code',
        'housing_project',
        'permit_type_initiative_xref'
      ]
    });
  });
});
