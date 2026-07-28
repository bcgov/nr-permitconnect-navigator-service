/**
 * Shared router mock, decoupled from any particular mounting utility --
 * import `mockRouter.push` / `mockRouter.replace` in a spec to assert on
 * navigation, e.g.:
 *
 *   expect(mockRouter.replace).toHaveBeenCalledWith({ name: RouteName.EXT_GENERAL });
 *
 * NOTE: this must still be wired up via `vi.mock('vue-router', ...)` in each
 * spec file individually (vi.mock calls are hoisted and can't live in a
 * shared helper), but the spec should import `mockRouter` from here so the
 * same spies are used both by the mock factory and by the assertions.
 */
import { vi } from 'vitest';

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
};

export function resetMockRouter() {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
}
