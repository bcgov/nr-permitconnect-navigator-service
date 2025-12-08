import config from 'config';

const PCNS_URL = config.get('server.pcns.appUrl');
const BC_EMAIL_BANNER_IMG = 'https://coms.api.gov.bc.ca/api/v1/object/446ee8ee-e302-4cb8-b44d-24a1f583edba';
const BC_EMAIL_FOOTER_IMG = 'https://coms.api.gov.bc.ca/api/v1/object/853de44a-e62f-41f5-81fd-6eff6cb66d52';

export type PermitEmailTemplate = (replaceConfig: { [key: string]: string | string[] | undefined }) => string;

export const replacePlaceholders = (
  baseText: string,
  replacementConfig: { [key: string]: string | string[] | undefined }
) => {
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

export const permitStatusUpdateTemplate: PermitEmailTemplate = (replaceConfig) => {
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

export const permitNoteUpdateTemplate: PermitEmailTemplate = (replaceConfig) => {
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
