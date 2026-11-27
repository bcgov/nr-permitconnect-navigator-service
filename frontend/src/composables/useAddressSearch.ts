import { onScopeDispose, ref } from 'vue';

import { externalApiService } from '@/services';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';
import type { GeocoderFeature } from '@/types';

const SEARCH_DEBOUNCE_MS = 500;

/**
 * Returns a debounced, cancellable BC Geocoder address search.
 *
 * Every search attempt is numbered; a search's response or error is only applied if no newer
 * attempt (another search, or a cancellation) has started since. This keeps a slow response for
 * an earlier, shorter input from ever overwriting the suggestions for what the user typed next.
 */
export function useAddressSearch() {
  const suggestions: Ref<GeocoderFeature[]> = ref([]);

  let searchId = 0;
  let timeoutId: ReturnType<typeof setTimeout>;

  const cancel = () => {
    clearTimeout(timeoutId);
    // Invalidate any search still awaiting its response
    searchId++;
  };

  const runSearch = async (input: string, id: number) => {
    try {
      const res = await externalApiService.searchGeocoderAddress({ addressSearch: input });
      if (id !== searchId) return;
      suggestions.value = res?.features ?? [];
    } catch (e) {
      if (id !== searchId) return;
      suggestions.value = [];
      generalErrorHandler(e);
    }
  };

  // Cancels any pending search and clears suggestions when the trimmed input is too short to
  // search with. Returns whether the input was too short, so callers can bail out early.
  const rejectShortInput = (trimmed: string) => {
    if (trimmed.length >= MIN_SEARCH_INPUT_LENGTH) return false;

    cancel();
    suggestions.value = [];
    return true;
  };

  const search = (input: string) => {
    const trimmed = input.trim();
    clearTimeout(timeoutId);
    if (rejectShortInput(trimmed)) return;

    const id = ++searchId;
    timeoutId = setTimeout(() => runSearch(trimmed, id), SEARCH_DEBOUNCE_MS);
  };

  const searchImmediate = async (input: string) => {
    const trimmed = input.trim();
    clearTimeout(timeoutId);
    if (rejectShortInput(trimmed)) return;

    const id = ++searchId;
    await runSearch(trimmed, id);
  };

  onScopeDispose(cancel);

  return {
    cancel,
    search,
    searchImmediate,
    suggestions
  };
}
