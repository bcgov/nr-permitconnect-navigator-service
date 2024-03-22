export const roadmapTemplate = (replaceConfig: { [key: string]: string | string[] }) => {
  // Using template literal, baseTemplate's whitespace matters
  {/* prettier-ignore */}
  const baseTemplate = `Dear {{ contactName }},
Here is your Permit Roadmap for {{ locationAddress }},
You need to apply for the following permit(s):
{{ permitStateNew }}
Based on the information provided, you have already applied for the following permit(s):
{{ permitStateApplied }}
Based on the information provided, you have completed the process for the following permit(s):
{{ permitStateCompleted }}
Regards,
{{ navigatorName }}`;

  return replacePlaceholders(baseTemplate, replaceConfig);
};

const replacePlaceholders = (baseText: string, replacementConfig: { [key: string]: string | string[] }) => {
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
