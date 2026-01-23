import { roadmapTemplate } from '@/utils/templates';

/**
 * Helper function for setting up the expected templated output.
 * @param contactName             Contact name
 * @param projectName             Project name
 * @param activityId              Linked activity ID
 * @param permitStateNew          Required permit(s).
 *                                 If multiple, each should be separated by a newline.
 * @param permitPossiblyNeeded    Permit(s) that may be needed.
 *                                 If multiple, each should be separated by a newline.
 * @param permitStateApplied      Permit(s) that have already been applied.
 *                                If multiple, each should be separated by a newline.
 * @param permitStateCompleted   Permit(s) that are completed.
 *                                If multiple, each should be separated by a newline.
 * @param navigatorName          Navigator name
 * @returns                       Templated output, with all the parameters substituted in.
 */
function setupOutputTemplate(inputs: {
  contactName: string;
  projectName: string;
  activityId: string;
  permitStateNew: string[];
  permitPossiblyNeeded: string[];
  permitStateApplied: string[];
  permitStateCompleted: string[];
  navigatorName: string;
}) {
  // Note: roadmapTemplate() contains logic to add/remove sections depending on whether it contains permits.
  //       We don't do that here - we expect the caller to remove those sections before using them in an expect(),
  //       with something like string.replace('You need to apply...\n\n\n','')
  return `Dear ${inputs.contactName},

Here is your Permit Roadmap for ${inputs.projectName}: ${inputs.activityId}.

You need to apply for the following permit(s):
${inputs.permitStateNew.join('\n')}

Based on the information provided, you may need the following permit(s):
${inputs.permitPossiblyNeeded.join('\n')}

Based on the information provided, you have already applied for the following permit(s):
${inputs.permitStateApplied.join('\n')}

Based on the information provided, you have completed the process for the following permit(s):
${inputs.permitStateCompleted.join('\n')}

Regards,

${inputs.navigatorName}`;
}

let replaceConfig: Record<string, string | string[] | undefined> = {};
const sampleInputs = {
  contactName: 'Contact Name',
  projectName: 'My Permit Project',
  activityId: '12345678',
  permitStateNew: ['Contaminated Sites Remediation Permit', 'Rezoning'],
  permitPossiblyNeeded: ['Rezoning'],
  permitStateApplied: ['Groundwater Licence - Wells'],
  permitStateCompleted: ['Site Alteration Permit'],
  navigatorName: 'Permit Navigator'
};

let testCases: typeof sampleInputs = {} as typeof sampleInputs;

beforeEach(() => {
  testCases = Object.assign(testCases, sampleInputs);
  replaceConfig = {
    '{{ contactName }}': sampleInputs.contactName,
    '{{ projectName }}': sampleInputs.projectName,
    '{{ activityId }}': sampleInputs.activityId,
    '{{ permitStateNew }}': sampleInputs.permitStateNew,
    '{{ permitPossiblyNeeded }}': sampleInputs.permitPossiblyNeeded,
    '{{ permitStateApplied }}': sampleInputs.permitStateApplied,
    '{{ permitStateCompleted }}': sampleInputs.permitStateCompleted,
    '{{ navigatorName }}': sampleInputs.navigatorName
  };
});

describe('templates.ts', () => {
  describe('roadmapTemplate', () => {
    it('returns a correctly-formatted roadmap message when there are permits in each section', () => {
      expect(roadmapTemplate(replaceConfig)).toEqual(setupOutputTemplate(sampleInputs));
    });

    it('omit "required permits" section if it does not have any permits', () => {
      testCases.permitStateNew = [];
      replaceConfig['{{ permitStateNew }}'] = [];
      const expectedOutput = setupOutputTemplate(testCases).replace(
        'You need to apply for the following permit(s):\n\n\n',
        ''
      );
      expect(roadmapTemplate(replaceConfig)).toEqual(expectedOutput);
    });

    it('omit "potentially required permits" section if it does not have any permits', () => {
      testCases.permitPossiblyNeeded = [];
      replaceConfig['{{ permitPossiblyNeeded }}'] = [];
      const expectedOutput = setupOutputTemplate(testCases).replace(
        'Based on the information provided, you may need the following permit(s):\n\n\n',
        ''
      );
      expect(roadmapTemplate(replaceConfig)).toEqual(expectedOutput);
    });

    it('omit "already applied permits" section if it does not have any permits', () => {
      testCases.permitStateApplied = [];
      replaceConfig['{{ permitStateApplied }}'] = [];
      const expectedOutput = setupOutputTemplate(testCases).replace(
        'Based on the information provided, you have already applied for the following permit(s):\n\n\n',
        ''
      );
      expect(roadmapTemplate(replaceConfig)).toEqual(expectedOutput);
    });

    it('omit "completed permits" section if it does not have any permits', () => {
      testCases.permitStateCompleted = [];
      replaceConfig['{{ permitStateCompleted }}'] = [];
      const expectedOutput = setupOutputTemplate(testCases).replace(
        'Based on the information provided, you have completed the process for the following permit(s):\n\n\n',
        ''
      );
      expect(roadmapTemplate(replaceConfig)).toEqual(expectedOutput);
    });

    it('omit all permit sections if the project does not have any associated permits', () => {
      testCases.permitStateNew = [];
      testCases.permitPossiblyNeeded = [];
      testCases.permitStateApplied = [];
      testCases.permitStateCompleted = [];
      replaceConfig['{{ permitStateNew }}'] = [];
      replaceConfig['{{ permitPossiblyNeeded }}'] = [];
      replaceConfig['{{ permitStateApplied }}'] = [];
      replaceConfig['{{ permitStateCompleted }}'] = [];
      const expectedOutput = setupOutputTemplate(testCases)
        .replace('You need to apply for the following permit(s):\n\n\n', '')
        .replace('Based on the information provided, you may need the following permit(s):\n\n\n', '')
        .replace('Based on the information provided, you have already applied for the following permit(s):\n\n\n', '')
        .replace(
          'Based on the information provided, you have completed the process for the following permit(s):\n\n\n',
          ''
        );
      expect(roadmapTemplate(replaceConfig)).toEqual(expectedOutput);
    });
  });
});
