import { useFormErrors } from 'vee-validate';

function normalize(name: string): string {
  return name.split('.')[0]?.split('[')[0] ?? '';
}

/**
 * Returns a unique array of form categories which contain validation errors
 */
export function useFormCategoryErrors() {
  const errors = useFormErrors();

  const getFormCategoryErrors = (): string[] => {
    const errorFields = Array.from(new Set(Object.keys(errors.value).map(normalize)));
    return errorFields;
  };

  return {
    getFormCategoryErrors
  };
}
