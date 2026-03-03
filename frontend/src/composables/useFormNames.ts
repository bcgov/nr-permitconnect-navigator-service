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

    // Obtain a unique list of form names
    const names = Array.from(formElements).map((el) => (el as HTMLElement).getAttribute('name'));

    return names.filter((x) => !!x && x.length) as string[];
  };

  return {
    getFormNames
  };
}
