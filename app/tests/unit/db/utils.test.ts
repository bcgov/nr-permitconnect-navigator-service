import { prismaMock } from '../../__mocks__/prismaMock.ts';
import { checkDatabaseHealth, checkDatabaseSchema } from '../../../src/db/utils/utils.ts';

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
        'draft',
        'draft_code',
        'electrification_project',
        'electrification_project_category_code',
        'electrification_project_type_code',
        'email_log',
        'enquiry',
        'general_project',
        'housing_project',
        'identity_provider',
        'initiative',
        'note',
        'note_history',
        'permit',
        'permit_note',
        'permit_type',
        'user',
        'permit_type_initiative_xref'
      ]
    });
  });
});
