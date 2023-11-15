import { setActivePinia, createPinia } from 'pinia';

import { helloService } from '@/services';
import { useAppStore, useHelloStore } from '@/store';

import type { StoreGeneric } from 'pinia';
import type { SpyInstance } from 'vitest';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe('Hello Store', () => {
  let appStore: StoreGeneric;
  let helloStore: StoreGeneric;

  let beginIndeterminateLoadingSpy: SpyInstance;
  let endIndeterminateLoadingSpy: SpyInstance;

  let helloWorldSpy: SpyInstance;

  beforeEach(() => {
    appStore = useAppStore();
    helloStore = useHelloStore();

    beginIndeterminateLoadingSpy = vi.spyOn(appStore, 'beginIndeterminateLoading');
    endIndeterminateLoadingSpy = vi.spyOn(appStore, 'endIndeterminateLoading');
    helloWorldSpy = vi.spyOn(helloService, 'helloWorld');
  });

  it('calls the service', async () => {
    helloWorldSpy.mockReturnValue({ data: 'Hello world!' } as any);

    await helloStore.helloWorld();

    expect(beginIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
    expect(helloWorldSpy).toHaveBeenCalledTimes(1);
    expect(helloStore.getHello).toBe('Hello world!');
    expect(endIndeterminateLoadingSpy).toHaveBeenCalledTimes(1);
  });
});
