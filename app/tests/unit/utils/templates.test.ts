import {
  permitNoteUpdateTemplate,
  permitStatusUpdateTemplate,
  replacePlaceholders
} from '../../../src/utils/templates';

jest.mock('config', () => ({
  get: (key: string) => {
    if (key === 'server.pcns.appUrl') {
      return 'http://localhost:5173';
    }
    return '';
  }
}));

describe('replacePlaceholders', () => {
  it('returns baseText when baseText is an empty string', () => {
    const result = replacePlaceholders('', { name: 'John' });
    expect(result).toBe('');
  });

  it('returns baseText when replacementConfig is empty', () => {
    const baseText = 'Hello {{ name }}';
    const result = replacePlaceholders(baseText, {});
    expect(result).toBe(baseText);
  });

  it('replaces string placeholders globally', () => {
    const baseText = 'Hello {{ name }},\nYour name is {{ name }}.';
    const result = replacePlaceholders(baseText, {
      name: 'John'
    });

    expect(result).toBe('Hello John,\nYour name is John.');
  });

  it('replaces array placeholders with a newline-joined list', () => {
    const baseText = 'Items:\n{{ items }}\nThanks.';
    const result = replacePlaceholders(baseText, {
      items: ['Apples', 'Bananas', 'Carrots']
    });

    expect(result).toBe('Items:\nApples\nBananas\nCarrots\nThanks.');
  });

  it('handles mixed string and array placeholders', () => {
    const baseText = [
      'Dear {{ dearName }},',
      '',
      'Here are your items:',
      '{{ items }}',
      '',
      'Regards,',
      '{{ sender }}'
    ].join('\n');

    const result = replacePlaceholders(baseText, {
      dearName: 'John',
      items: ['Apples', 'Bananas'],
      sender: 'Navigator Service'
    });

    expect(result).toBe(
      ['Dear John,', '', 'Here are your items:', 'Apples', 'Bananas', '', 'Regards,', 'Navigator Service'].join('\n')
    );
  });

  it('ignores keys with undefined values', () => {
    const baseText = 'Hello {{ name }}, your code is {{ code }}.';
    const result = replacePlaceholders(baseText, {
      name: 'John',
      code: undefined
    });

    expect(result).toBe('Hello John, your code is {{ code }}.');
  });
});

describe('permit email templates', () => {
  const replaceConfig = {
    dearName: 'John Doe',
    activityId: 'ACT-123',
    initiative: 'electrification',
    projectId: 'PROJ-456',
    permitId: 'PERMIT-789',
    permitName: 'Special Use Permit',
    submittedDate: 'January 1, 2025'
  };

  it('permitStatusUpdateTemplate replaces placeholders and builds the correct URL', () => {
    const html = permitStatusUpdateTemplate(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('<b>Project ID: ACT-123</b>');
    expect(html).toContain('Special Use Permit');
    expect(html).toContain('submitted on January 1, 2025');

    const expectedUrlPart1 = `/i/${replaceConfig.initiative}/project/${replaceConfig.projectId}`;
    const expectedUrlPart2 = `?initialTab=2#${replaceConfig.permitId}`;
    const expectedUrlPart = expectedUrlPart1 + expectedUrlPart2;
    expect(html).toContain(expectedUrlPart);

    expect(html).not.toContain('{{ dearName }}');
    expect(html).not.toContain('{{ activityId }}');
    expect(html).not.toContain('{{ initiative }}');
    expect(html).not.toContain('{{ projectId }}');
    expect(html).not.toContain('{{ permitId }}');
    expect(html).not.toContain('{{ permitName }}');
    expect(html).not.toContain('{{ submittedDate }}');
  });

  it('permitNoteUpdateTemplate replaces placeholders and builds the correct URL', () => {
    const html = permitNoteUpdateTemplate(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('<b>Project ID: ACT-123</b>');
    expect(html).toContain('Special Use Permit');
    expect(html).toContain('submitted on January 1, 2025');
    expect(html).toContain('Your navigator has an update for you.');

    const expectedUrlPart1 = `/e/${replaceConfig.initiative}/project/${replaceConfig.projectId}`;
    const expectedUrlPart2 = `#${replaceConfig.permitId}`;
    const expectedUrlPart = expectedUrlPart1 + expectedUrlPart2;
    expect(html).toContain(expectedUrlPart);

    expect(html).not.toContain('{{ dearName }}');
    expect(html).not.toContain('{{ activityId }}');
    expect(html).not.toContain('{{ initiative }}');
    expect(html).not.toContain('{{ projectId }}');
    expect(html).not.toContain('{{ permitId }}');
    expect(html).not.toContain('{{ permitName }}');
    expect(html).not.toContain('{{ submittedDate }}');
  });
});
