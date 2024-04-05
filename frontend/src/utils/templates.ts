export const roadmapTemplate = (replaceConfig: { [key: string]: string | string[] | undefined }) => {
  const baseTemplate =
    'Dear {{ contactName }},\n\n' +
    'Here is your Permit Roadmap for {{ locationAddress }}.\n\n' +
    // You need to apply for the following permit(s):
    (replaceConfig['{{ permitStateNew }}']?.length ? templateConfig.permitStateNew : '') +
    // Based on the information provided, you may need the following permit(s):
    (replaceConfig['{{ permitPossiblyNeeded }}']?.length ? templateConfig.permitPossiblyNeeded : '') +
    // Based on the information provided, you have already applied for the following permit(s):
    (replaceConfig['{{ permitStateApplied }}']?.length ? templateConfig.permitStateApplied : '') +
    // Based on the information provided, you have completed the process for the following permit(s):
    (replaceConfig['{{ permitStateCompleted }}']?.length ? templateConfig.permitStateCompleted : '') +
    'Regards,\n\n' +
    '{{ navigatorName }}';

  return replacePlaceholders(baseTemplate, replaceConfig);
};

// Optional template sections - don't show if corresponding replaceConfig key is blank
// prettier-ignore
const templateConfig = {
  permitStateNew:
    'You need to apply for the following permit(s):\n' +
    '{{ permitStateNew }}\n\n',
  permitPossiblyNeeded:
    'Based on the information provided, you may need the following permit(s):\n' +
    '{{ permitPossiblyNeeded }}\n\n',
  permitStateApplied:
    'Based on the information provided, you have already applied for the following permit(s):\n' +
    '{{ permitStateApplied }}\n\n',
  permitStateCompleted:
    'Based on the information provided, you have completed the process for the following permit(s):\n' +
    '{{ permitStateCompleted }}\n\n'
};

const replacePlaceholders = (baseText: string, replacementConfig: { [key: string]: string | string[] | undefined }) => {
  if (!baseText || !Object.keys(replacementConfig)) return baseText;

  let newText = baseText;

  for (const [key, value] of Object.entries(replacementConfig)) {
    if (typeof value === 'string') {
      // Workaround: str.replaceAll() isn't available in ES2020
      newText = newText.replace(new RegExp(key, 'g'), value);
    } else if (Array.isArray(value)) {
      let listString: string = '';

      value.forEach((element, index) => {
        if (index) {
          listString += `\n${element}`;
        } else {
          listString = element;
        }
      });
      // Workaround: str.replaceAll() isn't available in ES2020
      newText = newText.replace(new RegExp(key, 'g'), listString);
    }
  }
  return newText;
};
