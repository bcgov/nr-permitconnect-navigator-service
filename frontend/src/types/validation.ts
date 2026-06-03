import type { CodeName } from '@/store/codeStore';
import type { OrgBookOption } from '@/types/api/external/orgBook';
import type { Initiative } from '@/utils/enums/application';

export interface CreateSchemaOptions {
  initiative?: Initiative;
  t: (key: string) => string; // i18n instance
  codeList?: Record<CodeName, string[]>;
  orgBookOptions?: OrgBookOption[];
}

declare module 'yup' {
  interface StringSchema<TType, TContext, TDefault, TFlags> {
    emptyToNull(): StringSchema<TType | null, TContext, TDefault, TFlags>;
  }
}
