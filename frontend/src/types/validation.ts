import type { CodeName } from '@/store/codeStore';
import type { OrgBookOption } from '@/types/api/external/orgBook';
import type { Initiative } from '@/utils/enums/application';

export interface CreateSchemaOptions {
  initiative?: Initiative;
  t: (key: string) => string; // i18n instance
  codeList?: Record<CodeName, string[]>;
  orgBookOptions?: OrgBookOption[];
}
