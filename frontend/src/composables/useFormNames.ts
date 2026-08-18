import { unref } from 'vue';

import type { ComponentPublicInstance, MaybeRef } from 'vue';

/**
 * @param target A ref to a component, or to a plain DOM element
 * @returns A string array containing the `name` of any child where it is given
 */
export function useFormNames(target: MaybeRef<ComponentPublicInstance | Element | null>) {
  const getFormNames = (): string[] => {
    const instance = unref(target);

    if (!instance) return [];

    // A ref on a component yields its public instance (with `.$el`); a ref
    // on a plain DOM element (e.g. a `<div ref="formRef">`) yields the
    // element itself.
    const root = ('$el' in instance ? (instance.$el as HTMLElement) : instance) as HTMLElement;

    if (!root) return [];

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
