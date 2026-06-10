import { createInitiativeRouteBuilder, createRouteBuilder } from '@/services/routeBuilder';
import { useAppStore } from '@/store';

import type { Mock } from 'vitest';

// Mock store
vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

describe('createRouteBuilder', () => {
  it('joins segments correctly', () => {
    const route = createRouteBuilder('base');

    const result = route('a', 'b', 'c');

    expect(result).toBe('base/a/b/c');
  });

  it('encodes segments', () => {
    const route = createRouteBuilder('base');

    const result = route('a b', 'c/d');

    expect(result).toBe('base/a%20b/c%2Fd');
  });

  it('filters empty string segments', () => {
    const route = createRouteBuilder('base');

    const result = route('a', '', 'b');

    expect(result).toBe('base/a/b');
  });

  it('filters undefined resource and segments safely', () => {
    const route = createRouteBuilder(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = route('a', undefined as any, 'b');

    expect(result).toBe('a/b');
  });

  it('preserves numeric segments', () => {
    const route = createRouteBuilder('base');

    const result = route(0, 123);

    expect(result).toBe('base/0/123');
  });
});

describe('createInitiativeRouteBuilder', () => {
  const mockUseAppStore = useAppStore as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAppStore.mockReturnValue({
      getInitiative: 'HOUSING'
    });
  });

  it('prefixes initiative + resource', () => {
    const route = createInitiativeRouteBuilder('permit');

    const result = route('123');

    expect(result).toBe('housing/permit/123');
  });

  it('encodes segments', () => {
    const route = createInitiativeRouteBuilder('permit');

    const result = route('a b', 'c/d');

    expect(result).toBe('housing/permit/a%20b/c%2Fd');
  });

  it('handles multiple segments correctly', () => {
    const route = createInitiativeRouteBuilder('activity');

    const result = route('123', 'contact', '456');

    expect(result).toBe('housing/activity/123/contact/456');
  });

  it('always lowercases initiative', () => {
    mockUseAppStore.mockReturnValue({
      getInitiative: 'ELECTRIFICATION'
    });

    const route = createInitiativeRouteBuilder('test');

    const result = route();

    expect(result.startsWith('electrification/test')).toBe(true);
  });
});
