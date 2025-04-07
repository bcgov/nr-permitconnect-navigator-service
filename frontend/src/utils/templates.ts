const PCNS_URL = window.location.origin;
const BC_EMAIL_BANNER_IMG = 'https://coms.api.gov.bc.ca/api/v1/object/446ee8ee-e302-4cb8-b44d-24a1f583edba';
const BC_EMAIL_FOOTER_IMG = 'https://coms.api.gov.bc.ca/api/v1/object/853de44a-e62f-41f5-81fd-6eff6cb66d52';

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

// TODO: Make all email templates dynmaic based on initiative
export const confirmationTemplateSubmission = (replaceConfig: { [key: string]: string | string[] | undefined }) => {
  const baseTemplate =
    '<div style="width: 880px">' +
    '<img src="' +
    BC_EMAIL_BANNER_IMG +
    '" height="120rem" width="880px"  alt="B.C. Government Logo" /><br><br>' +
    '<div style="margin-left: 3rem; margin-right: 3rem;">' +
    'Dear {{ contactName }},<br><br>' +
    '<b>Project ID: {{ activityId }}</b><br><br>' +
    // eslint-disable-next-line max-len
    'Thank you for registering your project with the Navigator Service. We have successfully received your project submission. A Navigator will review your submission and contact you. Please keep your project ID for future reference.<br><br>' +
    'View your project submission <a href="' +
    PCNS_URL +
    '/e/housing/project/{{ submissionId }}/intake">here<a>.<br><br>' +
    'Regards,<br><br>' +
    '<a href="' +
    PCNS_URL +
    '">Navigator Service<a><br><br><br>' +
    '</div>' +
    '<img src="' +
    BC_EMAIL_FOOTER_IMG +
    '" width="100%" alt="B.C. Government Footer" /><br><br>' +
    '</div>';
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const confirmationTemplateEnquiry = (replaceConfig: { [key: string]: string | string[] | undefined }) => {
  const ENQUIRY_URL = replaceConfig.projectId
    ? `/e/housing/project/${replaceConfig.projectId}/enquiry/${replaceConfig.enquiryId}`
    : `/e/housing/enquiry/${replaceConfig.enquiryId}`;
  const baseTemplate =
    '<div style="width: 880px">' +
    '<img src="' +
    BC_EMAIL_BANNER_IMG +
    '" height="120rem" width="880px"  alt="B.C. Government Logo" /><br><br>' +
    '<div style="margin-left: 3rem; margin-right: 3rem;">' +
    'Dear {{ contactName }},<br><br>' +
    '<b>Enquiry ID: {{ activityId }}</b><br><br>' +
    // eslint-disable-next-line max-len
    'Thank you for submitting an enquiry to the Navigator Service. We have successfully received your enquiry. A Navigator will review your enquiry and contact you. Please keep your enquiry ID for future reference.<br><br>' +
    '<b>Enquiry detail:</b><br><br>' +
    '{{ enquiryDescription }}<br><br>' +
    'View your enquiry <a href="' +
    PCNS_URL +
    ENQUIRY_URL +
    '">here<a>.<br><br>' +
    'Regards,<br><br>' +
    '<a href="' +
    PCNS_URL +
    '">Navigator Service<a><br><br><br>' +
    '</div>' +
    '<img src="' +
    BC_EMAIL_FOOTER_IMG +
    '" width="100%" alt="B.C. Government Footer" /><br><br>' +
    '</div>';
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const permitNoteNotificationTemplate = (replaceConfig: { [key: string]: string | string[] | undefined }) => {
  const baseTemplate =
    '<div style="width: 880px">' +
    '<img src="' +
    BC_EMAIL_BANNER_IMG +
    '" height="120rem" width="880px"  alt="B.C. Government Logo" /><br><br>' +
    '<div style="margin-left: 3rem; margin-right: 3rem;">' +
    'Dear {{ contactName }},<br><br>' +
    'Your navigator has an update for you.<br><br>' +
    '<b>Project ID: {{ activityId }}</b><br><br>' +
    '<a href="' +
    PCNS_URL +
    '/e/housing/project/{{ projectId }}/permit/{{ permitId }}' +
    '">{{ permitName }}<a> (submitted on {{ submittedDate }}): A new note has been added to this application.<br><br>' +
    'Regards,<br><br>' +
    '<a href="' +
    PCNS_URL +
    '">Navigator Service<a><br><br><br>' +
    '</div>' +
    '<img src="' +
    BC_EMAIL_FOOTER_IMG +
    '" width="100%" alt="B.C. Government Footer" /><br><br>' +
    '</div>';
  return replacePlaceholders(baseTemplate, replaceConfig);
};
