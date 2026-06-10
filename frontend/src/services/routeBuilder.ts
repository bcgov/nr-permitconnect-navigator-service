import { useAppStore } from '@/store';

/**
 * Creates a route builder for constructing URL paths for a given resource.
 *
 * This utility helps standardize route generation by:
 * - Prefixing all routes with a base resource path (if provided)
 * - Safely encoding all dynamic path segments
 *
 * Example:
 * const userRoute = createRouteBuilder('user');
 * userRoute('123', 'profile'); // "user/123/profile"
 *
 * @param resource - The base route segment (e.g. "user", "projects")
 * @returns A function that builds URL paths from additional segments
 */
export function createRouteBuilder(resource?: string) {
  return (...segments: (string | number | null | undefined)[]) =>
    [resource]
      .filter((v): v is string => v !== undefined && v !== null && v !== '')
      .concat(
        segments
          .filter((v): v is string | number => v !== undefined && v !== null && v !== '')
          .map((s) => encodeURIComponent(String(s)))
      )
      .join('/');
}

/**
 * Creates a route builder scoped to the current application initiative.
 *
 * This is similar to `createRouteBuilder`, but automatically prefixes all
 * routes with the active initiative from application state.
 *
 * The initiative is resolved at call time using `useAppStore().getInitiative`
 * and is included as the first segment of every generated route.
 *
 * Example:
 * const projectRoute = createInitiativeRouteBuilder('project');
 * projectRoute('123');
 * // "housing/project/123" (depending on active initiative)
 *
 * @param resource - The base resource segment after the initiative
 * @returns A function that builds initiative-scoped URL paths
 */
export function createInitiativeRouteBuilder(resource: string) {
  return (...segments: (string | number | null | undefined)[]) => {
    const initiative = useAppStore().getInitiative.toLowerCase();

    return [
      initiative,
      resource,
      ...segments
        .filter((v): v is string | number => v !== undefined && v !== null && v !== '')
        .map((segment) => encodeURIComponent(String(segment)))
    ].join('/');
  };
}
