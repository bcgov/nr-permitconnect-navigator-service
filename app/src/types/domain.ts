// Internal function-parameter bags for src/domains/* logic - not request or resource shapes.

import type { Permit } from './api/resources.ts';
import type { EmailTemplate } from '#src/utils/templates';
import type { Initiative } from '#src/utils/enums/application';

export interface PermitUpdateEmailParams {
  permit: Permit;
  initiative: Initiative;
  dearName: string;
  projectId: string;
  toEmails: string[];
  emailTemplate: EmailTemplate;
}

export interface UpdatedPermitWithNote {
  permit: Permit;
  note: string | undefined;
}
