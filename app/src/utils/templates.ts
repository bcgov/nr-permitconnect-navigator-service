import config from 'config';

const PCNS_URL: string = config.get('server.pcns.appUrl');
const BC_EMAIL_BANNER_IMG = 'https://coms.api.gov.bc.ca/api/v1/object/446ee8ee-e302-4cb8-b44d-24a1f583edba';
const BC_EMAIL_FOOTER_IMG = 'https://coms.api.gov.bc.ca/api/v1/object/853de44a-e62f-41f5-81fd-6eff6cb66d52';

export type EmailTemplate = (
  replaceConfig: Record<string, string | (string | undefined)[] | undefined | null>
) => string;

export const replacePlaceholders = (
  baseText: string,
  replacementConfig: Record<string, string | (string | undefined)[] | undefined | null>
) => {
  if (!baseText || Object.keys(replacementConfig).length === 0) return baseText;

  let newText = baseText;

  for (const [key, value] of Object.entries(replacementConfig)) {
    const pattern = `{{ ${key} }}`;
    if (typeof value === 'string') {
      newText = newText.replaceAll(pattern, value);
    } else if (Array.isArray(value)) {
      const listString = value.join('\n');
      newText = newText.replaceAll(pattern, listString);
    }
  }
  return newText;
};

export const navPermitStatusUpdateTemplate: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
      <img
        src="${BC_EMAIL_BANNER_IMG}"
        height="120rem" width="880px"
        alt="B.C. Government Logo"
      /><br><br>

      <div style="margin-left: 3rem; margin-right: 3rem;">
        Dear {{ dearName }},<br><br>

        The status or stage of the following authorization from your project has changed.<br><br>

        <b>Project ID: {{ activityId }}</b><br><br>
        <a href="${PCNS_URL}/i/{{ initiative }}/project/{{ projectId }}?initialTab=2#{{ permitId }}">
          {{ permitName }}
        <a>
        (submitted on {{ submittedDate }}): A new note has been added to this application.<br><br>

        Regards,<br><br>

        <a href="${PCNS_URL}">
          Navigator Service
        <a><br><br><br>
      </div>

      <img
        src="${BC_EMAIL_FOOTER_IMG}"
        width="100%"
        alt="B.C. Government Footer"
      /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const permitNoteUpdateTemplate: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
      <img
        src="${BC_EMAIL_BANNER_IMG}"
        height="120rem"
        width="880px"
        alt="B.C. Government Logo"
      /><br><br>

      <div style="margin-left: 3rem; margin-right: 3rem;">
        Dear {{ dearName }},<br><br>

        Your navigator has an update for you.<br><br>

        <b>Project ID: {{ activityId }}</b><br><br>

        <a href="${PCNS_URL}/e/{{ initiative }}/project/{{ projectId }}#{{ permitId }}">
          {{ permitName }}
        <a>
        (submitted on {{ submittedDate }}): A new note has been added to this application.<br><br>

        Regards,<br><br>

        <a href="${PCNS_URL}">
          Navigator Service
        <a><br><br><br>
      </div>

      <img
        src="${BC_EMAIL_FOOTER_IMG}"
        width="100%"
        alt="B.C. Government Footer"
      /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const teamMemberAddedTemplate: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
      <img
        src="${BC_EMAIL_BANNER_IMG}"
        height="120rem" width="880px"
        alt="B.C. Government Logo"
      /><br><br>

      <div style="margin-left: 3rem; margin-right: 3rem;">
        Dear {{ dearName }},<br><br>

        {{ adminName }} (project admin) has added you to
        <a href="${PCNS_URL}/e/{{ initiative }}/project/{{ projectId }}">{{ projectName }}</a>
        project in the Navigator Service.
        You can now access the following project in the Navigator Service and make enquiries on behalf of
        the project as a project member.<br><br>

        Regards,<br><br>

        <a href="${PCNS_URL}">
          Navigator Service
        <a><br><br><br>
      </div>

      <img
        src="${BC_EMAIL_FOOTER_IMG}"
        width="100%"
        alt="B.C. Government Footer"
      /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const teamAdminAddedTemplate: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
      <img
        src="${BC_EMAIL_BANNER_IMG}"
        height="120rem" width="880px"
        alt="B.C. Government Logo"
      /><br><br>

      <div style="margin-left: 3rem; margin-right: 3rem;">
        Dear {{ dearName }},<br><br>

        You have been granted the Admin role for <a href="${PCNS_URL}/e/{{ initiative }}/project/{{ projectId }}">
        {{ projectName }}</a> in the Navigator Service.
        You can now add new members, manage member roles, and revoke members as needed.<br><br>

        Regards,<br><br>

        <a href="${PCNS_URL}">
          Navigator Service
        <a><br><br><br>
      </div>

      <img
        src="${BC_EMAIL_FOOTER_IMG}"
        width="100%"
        alt="B.C. Government Footer"
      /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const teamMemberRevokedTemplate: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
      <img
        src="${BC_EMAIL_BANNER_IMG}"
        height="120rem" width="880px"
        alt="B.C. Government Logo"
      /><br><br>

      <div style="margin-left: 3rem; margin-right: 3rem;">
        Dear {{ dearName }},<br><br>

        You have been revoked access from {{ projectName }} project in the Navigator Service. If you think this was
        a mistake, please reach out to {{ adminName }} (project admin). Please note that the Navigators cannot
        access project teams on behalf of a proponent.<br><br>

        Regards,<br><br>

        <a href="${PCNS_URL}">
          Navigator Service
        <a><br><br><br>
      </div>

      <img
        src="${BC_EMAIL_FOOTER_IMG}"
        width="100%"
        alt="B.C. Government Footer"
      /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const roadmapTemplate: EmailTemplate = (replaceConfig) => {
  const baseTemplate =
    'Dear {{ contactName }},\n\n' +
    'Here is your Permit Roadmap for {{ projectName }}: {{ activityId }}.\n\n' +
    // You need to apply for the following permit(s):
    (replaceConfig['permitStateNew']?.length ? templateConfig.permitStateNew : '') +
    // Based on the information provided, you may need the following permit(s):
    (replaceConfig['permitPossiblyNeeded']?.length ? templateConfig.permitPossiblyNeeded : '') +
    // Based on the information provided, you have already applied for the following permit(s):
    (replaceConfig['permitStateApplied']?.length ? templateConfig.permitStateApplied : '') +
    // Based on the information provided, you have completed the process for the following permit(s):
    (replaceConfig['permitStateCompleted']?.length ? templateConfig.permitStateCompleted : '') +
    'Regards,\n\n' +
    '{{ navigatorName }}';

  return replacePlaceholders(baseTemplate, replaceConfig);
};

// Optional template sections - don't show if corresponding replaceConfig key is blank
// prettier-ignore
export const templateConfig = {
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

export const confirmationTemplateElectrificationSubmission: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
    <img
    src="${BC_EMAIL_BANNER_IMG}"
    height="120rem"
    width="880px"
    alt="B.C. Government Logo"
    /><br><br>

    <div style="margin-left: 3rem; margin-right: 3rem;">
    Dear {{ contactName }},<br><br>

    <b>Project ID: {{ activityId }}</b><br><br>
    Thank you for registering your {{ initiative }} project with the Navigator Service.
    We have successfully received your project submission.
    A Navigator will review your submission and contact you.
    Please keep your project ID for future reference.<br><br>

    View your project submission
    <a href="${PCNS_URL}/e/electrification/project/{{ projectId }}/intake">here<a>.<br><br>

    Regards,<br><br>

    <a href="${PCNS_URL}">Navigator Service<a><br><br><br>
    </div>

    <img src="${BC_EMAIL_FOOTER_IMG}"
    width="100%"
    alt="B.C. Government Footer"
    /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const confirmationTemplateHousingSubmission: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
    <img
    src="${BC_EMAIL_BANNER_IMG}"
    height="120rem" width="880px"
    alt="B.C. Government Logo"
    /><br><br>

    <div style="margin-left: 3rem; margin-right: 3rem;">
    Dear {{ contactName }},<br><br>

    <b>Project ID: {{ activityId }}</b><br><br>

    Thank you for registering your {{ initiative }} project with the Navigator Service.
    We have successfully received your project submission.
    A Navigator will review your submission and contact you.
    Please keep your project ID for future reference.<br><br>

    View your project submission
    <a href="${PCNS_URL}/e/housing/project/{{ projectId }}/intake">here<a>.<br><br>

    Regards,<br><br>

    <a href="${PCNS_URL}">Navigator Service<a><br><br><br>
    </div>
    <img
    src="${BC_EMAIL_FOOTER_IMG}"
    width="100%"
    alt="B.C. Government Footer"
    /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const confirmationTemplateEnquiry: EmailTemplate = (replaceConfig) => {
  const ENQUIRY_URL = replaceConfig['projectId']
    ? '/e/{{ initiative }}/project/{{ projectId }}/enquiry/{{ enquiryId }}'
    : '/e/{{ initiative }}/enquiry/{{ enquiryId }}';
  const baseTemplate = `
    <div style="width: 880px">
    <img
    src="${BC_EMAIL_BANNER_IMG}"
    height="120rem" width="880px"
    alt="B.C. Government Logo"
    /><br><br>

    <div style="margin-left: 3rem; margin-right: 3rem;">
    Dear {{ contactName }},<br><br>

    <b>Enquiry ID: {{ activityId }}</b><br><br>

    Thank you for submitting an enquiry to the Navigator Service.
    We have successfully received your enquiry.
    A Navigator will review your enquiry and contact you.
    Please keep your enquiry ID for future reference.<br><br>
    <b>Enquiry detail:</b><br><br>
    {{ enquiryDescription }}<br><br>

    View your enquiry <a href="${PCNS_URL}${ENQUIRY_URL}">here<a>.<br><br>

    Regards,<br><br>

    <a href="${PCNS_URL}">Navigator Service<a><br><br><br>
    </div>

    <img
    src="${BC_EMAIL_FOOTER_IMG}"
    width="100%"
    alt="B.C. Government Footer"
    /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const initialPeachPermitUpdateTemplate: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
    <img
    src="${BC_EMAIL_BANNER_IMG}"
    height="120rem" width="880px"
    alt="B.C. Government Logo"
    /><br><br>

    <div style="margin-left: 3rem; margin-right: 3rem;">
    Dear {{ dearName }},<br><br>

    Your navigator has an update for you.<br><br>
    <b>Project ID: {{ activityId }}</b><br><br>

    <a href="${PCNS_URL}/e/{{ initiative }}/project/{{ projectId }}#{{ permitId }}">{{ permitName }}<a>
    (submitted on {{ submittedDate }}):
    You can now track your application progress here.<br><br>
    You will receive an email if the status or stage changes, or when your Navigator posts an update.<br><br>
    Regards,<br><br>

    <a href="${PCNS_URL}">Navigator Service<a><br><br><br>
    </div>

    <img
    src="${BC_EMAIL_FOOTER_IMG}"
    width="100%"
    alt="B.C. Government Footer"
    /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const bringForwardProjectNotificationTemplate: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
    <img
    src="${BC_EMAIL_BANNER_IMG}"
    height="120rem" width="880px"
    alt="B.C. Government Logo"
    /><br><br>

    <div style="margin-left: 3rem; margin-right: 3rem;">
    A navigator has escalated <b>{{ projectName }}: {{ activityId }}</b> to your attention.<br> Please login to the
    <a href="${PCNS_URL}">Navigator Service<a>
    and review the matter under your Bring Forward notifications.<br><br>

    Regards,<br><br>

    <a href="${PCNS_URL}">Navigator Service<a><br><br><br>
    </div>

    <img
    src="${BC_EMAIL_FOOTER_IMG}"
    width="100%"
    alt="B.C. Government Footer"
    /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};

export const bringForwardEnquiryNotificationTemplate: EmailTemplate = (replaceConfig) => {
  const baseTemplate = `
    <div style="width: 880px">
    <img
    src="${BC_EMAIL_BANNER_IMG}"
    height="120rem" width="880px"
    alt="B.C. Government Logo"
    /><br><br>

    <div style="margin-left: 3rem; margin-right: 3rem;">
    A navigator has escalated <b>Enquiry ID: {{ activityId }}</b> to you.<br> Please login to the
    <a href="${PCNS_URL}">Navigator Service<a>
    and review the matter under your Bring Forward notifications.<br><br>

    Regards,<br><br>

    <a href="${PCNS_URL}">Navigator Service<a><br><br><br>
    </div>

    <img
    src="${BC_EMAIL_FOOTER_IMG}"
    width="100%"
    alt="B.C. Government Footer"
    /><br><br>
    </div>`;
  return replacePlaceholders(baseTemplate, replaceConfig);
};
