import config from 'config';

const PCNS_URL: string = config.get('server.pcns.appUrl');
const BC_EMAIL_BANNER_IMG = 'https://coms.api.gov.bc.ca/api/v1/object/446ee8ee-e302-4cb8-b44d-24a1f583edba';
const BC_EMAIL_FOOTER_IMG = 'https://coms.api.gov.bc.ca/api/v1/object/853de44a-e62f-41f5-81fd-6eff6cb66d52';

export type EmailTemplate = (replaceConfig: Record<string, string | string[] | undefined>) => string;

export const replacePlaceholders = (
  baseText: string,
  replacementConfig: Record<string, string | string[] | undefined>
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

export const permitStatusUpdateTemplate: EmailTemplate = (replaceConfig) => {
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

        {{ adminName }} (project admin) has added you to {{ projectName }} project in the Navigator Service.
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

        You have been granted the Admin role for {{ projectName }} in the Navigator Service.
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
