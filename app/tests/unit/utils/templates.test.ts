import {
  bringForwardEnquiryNotificationTemplate,
  bringForwardProjectNotificationTemplate,
  confirmationTemplateElectrificationSubmission,
  confirmationTemplateEnquiry,
  confirmationTemplateHousingSubmission,
  initialPeachPermitUpdateTemplate,
  permitNoteUpdateTemplate,
  navPermitStatusUpdateTemplate,
  replacePlaceholders,
  roadmapTemplate,
  teamAdminAddedTemplate,
  teamMemberAddedTemplate,
  teamMemberRevokedTemplate
} from '../../../src/utils/templates.ts';

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
    const html = navPermitStatusUpdateTemplate(replaceConfig);

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

describe('add team member templates', () => {
  const replaceConfig = {
    dearName: 'John Doe',
    adminName: 'Bob Smith',
    projectName: 'The Project',
    initiative: 'housing',
    projectId: 'PROJ-456'
  };

  it('teamMemberAddedTemplate replaces placeholders', () => {
    const html = teamMemberAddedTemplate(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('Bob Smith (project admin)');
    expect(html).toContain('>The Project</a>');
    expect(html).toContain('project in the Navigator Service');

    expect(html).not.toContain('{{ dearName }}');
    expect(html).not.toContain('{{ adminName }}');
    expect(html).not.toContain('{{ projectName }}');
  });

  it('teamAdminAddedTemplate replaces placeholders', () => {
    const html = teamAdminAddedTemplate(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('The Project</a>');
    expect(html).toContain('the Admin role for');

    expect(html).not.toContain('{{ dearName }}');
    expect(html).not.toContain('{{ projectName }}');
  });

  it('teamMemberRevokedTemplate replaces placeholders', () => {
    const html = teamMemberRevokedTemplate(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('Bob Smith (project admin)');
    expect(html).toContain('The Project project');

    expect(html).not.toContain('{{ dearName }}');
    expect(html).not.toContain('{{ adminName }}');
    expect(html).not.toContain('{{ projectName }}');
  });
});

describe('roadmap template', () => {
  it('includes all permit states when provided', () => {
    const replaceConfig = {
      contactName: 'John Doe',
      projectName: 'Test Project',
      activityId: 'ACT-123',
      permitStateNew: ['Permit A', 'Permit B'],
      permitPossiblyNeeded: ['Permit C'],
      permitStateApplied: ['Permit D'],
      permitStateCompleted: ['Permit E'],
      navigatorName: 'Jane Navigator'
    };

    const text = roadmapTemplate(replaceConfig);

    expect(text).toContain('Dear John Doe');
    expect(text).toContain('Test Project: ACT-123');
    expect(text).toContain('You need to apply for the following permit(s):');
    expect(text).toContain('Permit A\nPermit B');
    expect(text).toContain('you may need the following permit(s):');
    expect(text).toContain('Permit C');
    expect(text).toContain('you have already applied for the following permit(s):');
    expect(text).toContain('Permit D');
    expect(text).toContain('you have completed the process for the following permit(s):');
    expect(text).toContain('Permit E');
    expect(text).toContain('Regards,');
    expect(text).toContain('Jane Navigator');
  });

  it('omits empty permit state sections', () => {
    const replaceConfig = {
      contactName: 'John Doe',
      projectName: 'Test Project',
      activityId: 'ACT-123',
      permitStateNew: ['Permit A'],
      navigatorName: 'Jane Navigator'
    };

    const text = roadmapTemplate(replaceConfig);

    expect(text).toContain('You need to apply for the following permit(s):');
    expect(text).not.toContain('you may need the following permit(s):');
    expect(text).not.toContain('you have already applied for the following permit(s):');
    expect(text).not.toContain('you have completed the process for the following permit(s):');
  });

  it('handles null and undefined permit state values', () => {
    const replaceConfig = {
      contactName: 'John Doe',
      projectName: 'Test Project',
      activityId: 'ACT-123',
      permitStateNew: undefined,
      permitPossiblyNeeded: null,
      permitStateApplied: undefined,
      permitStateCompleted: null,
      navigatorName: 'Jane Navigator'
    };

    const text = roadmapTemplate(replaceConfig);

    expect(text).toContain('Dear John Doe');
    expect(text).toContain('Regards,');
    expect(text).not.toContain('You need to apply for the following permit(s):');
    expect(text).not.toContain('you may need the following permit(s):');
    expect(text).not.toContain('you have already applied for the following permit(s):');
    expect(text).not.toContain('you have completed the process for the following permit(s):');
  });
});

describe('confirmation templates', () => {
  it('confirmationTemplateElectrificationSubmission replaces placeholders', () => {
    const replaceConfig = {
      contactName: 'John Doe',
      activityId: 'ACT-123',
      initiative: 'electrification',
      projectId: 'PROJ-456'
    };

    const html = confirmationTemplateElectrificationSubmission(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('<b>Project ID: ACT-123</b>');
    expect(html).toContain('electrification project');
    expect(html).toContain('/e/electrification/project/PROJ-456/intake');
    expect(html).not.toContain('{{ contactName }}');
    expect(html).not.toContain('{{ activityId }}');
    expect(html).not.toContain('{{ projectId }}');
  });

  it('confirmationTemplateHousingSubmission replaces placeholders', () => {
    const replaceConfig = {
      contactName: 'John Doe',
      activityId: 'ACT-123',
      initiative: 'housing',
      projectId: 'PROJ-456'
    };

    const html = confirmationTemplateHousingSubmission(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('<b>Project ID: ACT-123</b>');
    expect(html).toContain('housing project');
    expect(html).toContain('/e/housing/project/PROJ-456/intake');
    expect(html).not.toContain('{{ contactName }}');
    expect(html).not.toContain('{{ activityId }}');
    expect(html).not.toContain('{{ projectId }}');
  });

  it('confirmationTemplateEnquiry with project replaces placeholders', () => {
    const replaceConfig = {
      contactName: 'John Doe',
      activityId: 'ACT-123',
      enquiryDescription: 'I have a question about permits.',
      enquiryId: 'ENQ-789',
      projectId: 'PROJ-456',
      initiative: 'housing'
    };

    const html = confirmationTemplateEnquiry(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('<b>Enquiry ID: ACT-123</b>');
    expect(html).toContain('I have a question about permits.');
    expect(html).toContain('/e/housing/project/PROJ-456/enquiry/ENQ-789');
    expect(html).not.toContain('{{ contactName }}');
    expect(html).not.toContain('{{ activityId }}');
  });

  it('confirmationTemplateEnquiry without project replaces placeholders', () => {
    const replaceConfig = {
      contactName: 'John Doe',
      activityId: 'ACT-123',
      enquiryDescription: 'General question.',
      enquiryId: 'ENQ-789',
      initiative: 'housing'
    };

    const html = confirmationTemplateEnquiry(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('/e/housing/enquiry/ENQ-789');
    expect(html).not.toContain('project/');
  });
});

describe('permit note notification templates', () => {
  const replaceConfig = {
    dearName: 'John Doe',
    activityId: 'ACT-123',
    initiative: 'housing',
    permitName: 'Special Use Permit',
    submittedDate: 'January 1, 2025',
    projectId: 'PROJ-456',
    permitId: 'PERMIT-789'
  };

  it('peachPermitNoteNotificationTemplate replaces placeholders', () => {
    const html = initialPeachPermitUpdateTemplate(replaceConfig);

    expect(html).toContain('Dear John Doe');
    expect(html).toContain('<b>Project ID: ACT-123</b>');
    expect(html).toContain('Special Use Permit<a>');
    expect(html).toContain('submitted on January 1, 2025');
    expect(html).toContain('You can now track your application progress here');
    expect(html).toContain('/e/housing/project/PROJ-456#PERMIT-789');
    expect(html).not.toContain('{{ contactName }}');
    expect(html).not.toContain('{{ permitName }}');
  });
});

describe('bring forward notification templates', () => {
  it('bringForwardProjectNotificationTemplate replaces placeholders', () => {
    const replaceConfig = {
      projectName: 'Test Project',
      activityId: 'ACT-123'
    };

    const html = bringForwardProjectNotificationTemplate(replaceConfig);

    expect(html).toContain('<b>Test Project: ACT-123</b>');
    expect(html).toContain('A navigator has escalated');
    expect(html).toContain('Bring Forward notifications');
    expect(html).not.toContain('{{ projectName }}');
    expect(html).not.toContain('{{ activityId }}');
  });

  it('bringForwardEnquiryNotificationTemplate replaces placeholders', () => {
    const replaceConfig = {
      activityId: 'ACT-123'
    };

    const html = bringForwardEnquiryNotificationTemplate(replaceConfig);

    expect(html).toContain('<b>Enquiry ID: ACT-123</b>');
    expect(html).toContain('A navigator has escalated');
    expect(html).toContain('Bring Forward notifications');
    expect(html).not.toContain('{{ activityId }}');
  });
});
