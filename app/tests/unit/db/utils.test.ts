import { prismaMock } from '../../__mocks__/prismaMock';
import {
  castDateOutputAsIso,
  castIsoInputAsDate,
  checkDatabaseHealth,
  checkDatabaseSchema,
  dateFieldsByModel
} from '../../../src/db/utils/utils';

import { Prisma } from '@prisma/client';

describe('dateFieldsByModel', () => {
  it('should include known models and their DateTime fields', () => {
    // Check that at least the "activity" model exists and has "createdAt"
    expect(dateFieldsByModel).toHaveProperty('activity');
    expect(Array.isArray(dateFieldsByModel.activity)).toBe(true);
    expect(dateFieldsByModel.activity).toContain('createdAt');
    expect(dateFieldsByModel.activity).toContain('updatedAt');

    // Check another model with DateTime, e.g., "document"
    if (dateFieldsByModel.document) {
      expect(dateFieldsByModel.document).toContain('createdAt');
      expect(dateFieldsByModel.document).toContain('updatedAt');
    }

    // Ensure no non-DateTime fields are listed (all fields come from Prisma.dmmf)
    for (const model in dateFieldsByModel) {
      for (const field of dateFieldsByModel[model]) {
        // Verify the DMMF metadata reports this field as type DateTime
        const fieldMeta = Prisma.dmmf.datamodel.models
          .find((m) => m.name === model)
          ?.fields.find((f) => f.name === field);
        expect(fieldMeta).toBeDefined();
        expect(fieldMeta?.type).toBe('DateTime');
      }
    }
  });
});

describe('castIsoInputAsDate', () => {
  it('converts ISO strings to Date for a model with DateTime fields', () => {
    const model = 'activity';
    // Build a fake input object with a DateTime field and a non-DateTime field
    const input: Record<string, unknown> = {
      createdAt: '2021-01-01T12:00:00.000Z',
      updatedAt: '2021-02-01T15:30:00.000Z',
      someOther: 'keepMe'
    };

    castIsoInputAsDate(model, input);

    expect(input.createdAt).toBeInstanceOf(Date);
    expect((input.createdAt as Date).toISOString()).toBe('2021-01-01T12:00:00.000Z');
    expect(input.updatedAt).toBeInstanceOf(Date);
    expect((input.updatedAt as Date).toISOString()).toBe('2021-02-01T15:30:00.000Z');

    // Non‐DateTime field should remain unchanged
    expect(input.someOther).toBe('keepMe');
  });

  it('does nothing when model has no DateTime fields', () => {
    const model = 'NonexistentModel';
    const input: Record<string, unknown> = {
      createdAt: '2021-01-01T00:00:00.000Z'
    };

    castIsoInputAsDate(model, input);
    // Since the model is unknown, the input stays as the original string
    expect(input.createdAt).toBe('2021-01-01T00:00:00.000Z');
  });

  it('does not throw if data is not an object', () => {
    expect(() => castIsoInputAsDate('activity', null)).not.toThrow();
    expect(() => castIsoInputAsDate('activity', 'not-an-object')).not.toThrow();
    expect(() => castIsoInputAsDate('activity', 123)).not.toThrow();
  });
});

describe('castDateOutputAsIso', () => {
  it('converts Date objects to ISO strings for a model with DateTime fields', () => {
    const model = 'activity';
    // Build a fake row with Date instances and a non-DateTime field
    const row: Record<string, unknown> = {
      createdAt: new Date('2022-03-01T08:00:00.000Z'),
      updatedAt: new Date('2022-04-01T17:45:00.000Z'),
      someOtherField: 42
    };

    castDateOutputAsIso(model, row);

    expect(row.createdAt).toBe('2022-03-01T08:00:00.000Z');
    expect(row.updatedAt).toBe('2022-04-01T17:45:00.000Z');
    // Non‐DateTime field should remain unchanged
    expect(row.someOtherField).toBe(42);
  });

  it('does nothing when model has no DateTime fields', () => {
    const model = 'NonexistentModel';
    const row: Record<string, unknown> = {
      createdAt: new Date('2022-01-01T00:00:00.000Z')
    };

    castDateOutputAsIso(model, row);
    // Since the model is unknown, the row stays with Date instance
    expect(row.createdAt).toBeInstanceOf(Date);
  });

  it('does not throw if row is not an object', () => {
    expect(() => castDateOutputAsIso('activity', null)).not.toThrow();
    expect(() => castDateOutputAsIso('activity', 'string')).not.toThrow();
    expect(() => castDateOutputAsIso('activity', 123)).not.toThrow();
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
