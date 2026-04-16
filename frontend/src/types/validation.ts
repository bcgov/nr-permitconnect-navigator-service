import type { CodeName } from '@/store/codeStore';
import type { Initiative } from '@/utils/enums/application';
import type { OrgBookOption } from './OrgBookOption';

export interface CreateSchemaOptions {
  initiative?: Initiative;
  t: (key: string) => string; // i18n instance
  enums?: Record<CodeName, Record<string, string>>;
  codeList?: Record<CodeName, string[]>;
  orgBookOptions?: OrgBookOption[];
}
