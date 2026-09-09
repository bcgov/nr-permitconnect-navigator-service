import { buildEnumsOutput, formatEnumBlock } from '#src/db/generators/codeEnums';

describe('formatEnumBlock', () => {
  it('builds a const object and matching type from code rows', () => {
    const block = formatEnumBlock('PermitStageCode', [
      { code: 'APPLICATION_SUBMISSION' },
      { code: 'TECHNICAL_REVIEW' }
    ]);

    expect(block).toBe(
      [
        'export const PermitStageCode = {',
        "  APPLICATION_SUBMISSION: 'APPLICATION_SUBMISSION',",
        "  TECHNICAL_REVIEW: 'TECHNICAL_REVIEW'",
        '} as const;',
        '',
        'export type PermitStageCode = (typeof PermitStageCode)[keyof typeof PermitStageCode];'
      ].join('\n')
    );
  });

  it('sanitizes non-word characters in the code into the enum key, but leaves the value untouched', () => {
    const block = formatEnumBlock('Foo', [{ code: 'a-b c' }]);

    expect(block).toContain("A_B_C: 'a-b c'");
  });

  it('produces an empty object body when there are no rows', () => {
    const block = formatEnumBlock('Empty', []);

    expect(block).toBe(
      ['export const Empty = {', '', '} as const;', '', 'export type Empty = (typeof Empty)[keyof typeof Empty];'].join(
        '\n'
      )
    );
  });

  it('wraps the type definition onto a second line once the name is long enough to exceed 120 characters', () => {
    const longName = 'A'.repeat(100);

    const block = formatEnumBlock(longName, [{ code: 'X' }]);

    expect(block).toContain(`export type ${longName} =\n  (typeof ${longName})[keyof typeof ${longName}];`);
  });
});

describe('buildEnumsOutput', () => {
  it('emits the auto-generated header followed by each table block', () => {
    const output = buildEnumsOutput([
      { name: 'A', rows: [{ code: 'X' }] },
      { name: 'B', rows: [{ code: 'Y' }] }
    ]);

    expect(output).toContain('AUTO-GENERATED FILE - DO NOT EDIT');
    expect(output).toContain('export const A = {');
    expect(output).toContain('export const B = {');
    expect(output.indexOf('export const A')).toBeLessThan(output.indexOf('export const B'));
  });

  it('ends with exactly one trailing newline, regardless of blank lines accumulated between blocks', () => {
    const output = buildEnumsOutput([{ name: 'A', rows: [{ code: 'X' }] }]);

    expect(output.endsWith('\n')).toBe(true);
    expect(output.endsWith('\n\n')).toBe(false);
  });

  it('returns just the header when there are no code tables', () => {
    const output = buildEnumsOutput([]);

    expect(output).toContain('AUTO-GENERATED FILE - DO NOT EDIT');
    expect(output).not.toContain('export const');
  });
});
