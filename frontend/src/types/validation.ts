import type { OrgBookOption } from '@/types/api/vendors/orgBook';
import type { Initiative } from '@/utils/enums/application';
import type { CodeTableName } from './common';

export interface CreateSchemaOptions {
  initiative?: Initiative;
  t: (key: string) => string; // i18n instance
  codeList?: Record<CodeTableName, string[]>;
  orgBookOptions?: OrgBookOption[];
}
