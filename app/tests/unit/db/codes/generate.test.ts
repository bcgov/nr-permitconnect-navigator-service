import { writeFileSync } from 'node:fs';
import { normalize } from 'node:path';

import { prismaMock } from '../../../__mocks__/prismaMock.ts';

import type { Mock, MockInstance } from 'vitest';

vi.mock('node:fs', () => ({
  writeFileSync: vi.fn()
}));

vi.mock('../../../../src/db/codes/tables.ts', () => ({
  CODE_TABLES: [{ name: 'TestEnum', model: 'testCodeModel' }]
}));

const mockLogError = vi.fn();
vi.mock('../../../../src/utils/log.ts', () => ({
  getLogger: () => ({ info: vi.fn(), error: mockLogError })
}));

describe('codes/generate script', () => {
  let exitSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code}) was called. Check the error log above.`);
    });
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('should fetch codes, format them, and write to both directories', async () => {
    // @ts-expect-error - dynamically attaching a mock model to the deep mock
    prismaMock.testCodeModel = {
      findMany: vi.fn().mockResolvedValue([{ code: 'VALID_CODE' }, { code: 'INVALID-CHAR' }])
    };

    await import('../../../../src/db/codes/generate.ts');

    await new Promise(process.nextTick);

    // @ts-expect-error - testing the mock
    expect(prismaMock.testCodeModel.findMany).toHaveBeenCalledWith({
      where: { active: true },
      select: { code: true },
      orderBy: { code: 'asc' }
    });

    expect(writeFileSync).toHaveBeenCalledTimes(2);

    const [appPath, appOutput] = (writeFileSync as Mock).mock.calls[0];
    const [frontendPath, frontendOutput] = (writeFileSync as Mock).mock.calls[1];

    expect(normalize(appPath)).toContain(normalize('src/db/codes/enums.ts'));
    expect(normalize(frontendPath)).toContain(normalize('frontend/src/utils/enums/codeEnums.ts'));

    const valid = 'VALID_CODE';
    const invalid = 'INVALID-CHAR';

    expect(appOutput).toContain(`VALID_CODE: '${valid}'`);
    expect(appOutput).toContain(`INVALID_CHAR: '${invalid}'`);
    expect(appOutput).toContain('export type TestEnum = (typeof TestEnum)[keyof typeof TestEnum];');

    expect(appOutput).toEqual(frontendOutput);
  });
});
