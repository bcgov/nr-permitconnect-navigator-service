import { unref } from 'vue';

import type { ComponentPublicInstance, MaybeRef } from 'vue';

/**
 * @param target A ref to a component
 * @returns A string array containing the `name` of any child where it is given
 */
export function useFormNames(target: MaybeRef<ComponentPublicInstance | null>) {
  const getFormNames = (): string[] => {
    const instance = unref(target);

    if (!instance?.$el) return [];

    // Get root DOM element of Card
    const root = instance.$el as HTMLElement;

    // Select all elements with a name attribute
    const formElements = root.querySelectorAll('[name]');

    // Obtain a unique list of names, removing any array indice referencefs
    const names = Array.from(formElements).map((el) => (el as HTMLElement).getAttribute('name'));
    const setNames = Array.from(new Set(Object.values(names).flatMap((x) => x?.split('.')[0]!.split('[')[0])));
    return setNames.filter((x) => !!x && x.length) as string[];
  };

  return {
    getFormNames
  };
}
