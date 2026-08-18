import { flushPromises } from '@vue/test-utils';

import { AutoComplete } from '@/components/form';
import RegisteredBusinessOrgbookSearch from '@/components/form/common/RegisteredBusinessOrgbookSearch.vue';
import { externalApiService } from '@/services';
import { Initiative } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

import type { SearchOrgBookResponse } from '@/types';

// Mocks

const searchOrgBookSpy = vi.spyOn(externalApiService, 'searchOrgBook');

// Fixtures

function orgBookResult(overrides: Partial<SearchOrgBookResponse['results'][number]> = {}) {
  return {
    type: 'name',
    sub_type: '',
    value: 'Test Co',
    topic_source_id: 'BC1234567',
    topic_type: '',
    credential_type: '',
    credential_id: '',
    score: 1,
    ...overrides
  };
}

// Mount

function mountRegisteredBusinessOrgbookSearch(
  options: {
    formType?: FormType;
    formState?: FormState;
    initiative?: Initiative;
    orgBookOptions?: unknown[];
  } = {}
) {
  const {
    formType = FormType.NEW,
    formState = FormState.UNLOCKED,
    initiative = Initiative.ELECTRIFICATION,
    orgBookOptions = []
  } = options;

  const { wrapper: harness, form } = mountWithFormContext(RegisteredBusinessOrgbookSearch, {
    componentProps: { orgBookOptions },
    piniaState: {
      app: { initiative },
      form: { formType, formState }
    }
  });

  // mountWithFormContext mounts the component inside a synthetic harness
  // (see mountComponent.ts), so events like `update:orgBookOptions` are
  // emitted by this inner component instance, not by the harness root --
  // assert against this wrapper, not `harness`.
  const wrapper = harness.findComponent(RegisteredBusinessOrgbookSearch);

  return { wrapper, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('RegisteredBusinessOrgbookSearch', () => {
  describe('rendering', () => {
    it('renders an AutoComplete bound to basic.registeredName with the given suggestions', () => {
      const { wrapper } = mountRegisteredBusinessOrgbookSearch({ orgBookOptions: [{ registeredName: 'Test Co' }] });

      const autoComplete = wrapper.findComponent(AutoComplete);
      expect(autoComplete.props('name')).toBe('basic.registeredName');
      expect(autoComplete.props('suggestions')).toEqual([{ registeredName: 'Test Co' }]);
    });

    it('disables the AutoComplete when the form is not editable', () => {
      const { wrapper } = mountRegisteredBusinessOrgbookSearch({ formState: FormState.LOCKED });

      expect(wrapper.findComponent(AutoComplete).props('disabled')).toBe(true);
    });
  });

  describe('search', () => {
    it('does not search when the query is shorter than 2 characters', async () => {
      const { wrapper } = mountRegisteredBusinessOrgbookSearch();

      await wrapper.findComponent(AutoComplete).vm.$emit('onComplete', { query: 'a' });

      expect(searchOrgBookSpy).not.toHaveBeenCalled();
      expect(wrapper.emitted('update:orgBookOptions')).toBeUndefined();
    });

    it('searches, keeps only "name"-typed results, and sorts them alphabetically', async () => {
      searchOrgBookSpy.mockResolvedValue({
        total: 2,
        first_index: 0,
        last_index: 1,
        results: [
          orgBookResult({ type: 'name', value: 'Zebra Co', topic_source_id: 'BC2' }),
          orgBookResult({ type: 'name', value: 'Apple Co', topic_source_id: 'BC1' }),
          orgBookResult({ type: 'other', value: 'Ignored Co', topic_source_id: 'BC3' })
        ]
      } as SearchOrgBookResponse);

      const { wrapper } = mountRegisteredBusinessOrgbookSearch();
      await wrapper.findComponent(AutoComplete).vm.$emit('onComplete', { query: 'co' });
      await flushPromises();

      expect(searchOrgBookSpy).toHaveBeenCalledWith({ query: 'co' });
      expect(wrapper.emitted('update:orgBookOptions')?.[0]?.[0]).toEqual([
        { registeredName: 'Apple Co', registeredId: 'BC1' },
        { registeredName: 'Zebra Co', registeredId: 'BC2' }
      ]);
    });

    it('adds the BC Hydro option when the initiative is ELECTRIFICATION and the query matches', async () => {
      searchOrgBookSpy.mockResolvedValue({
        total: 0,
        first_index: 0,
        last_index: 0,
        results: []
      } as unknown as SearchOrgBookResponse);

      const { wrapper } = mountRegisteredBusinessOrgbookSearch({ initiative: Initiative.ELECTRIFICATION });
      await wrapper.findComponent(AutoComplete).vm.$emit('onComplete', { query: 'hydro' });
      await flushPromises();

      expect(wrapper.emitted('update:orgBookOptions')?.[0]?.[0]).toEqual([
        { registeredName: 'BC HYDRO AND POWER AUTHORITY', registeredId: undefined }
      ]);
    });

    it('does not add the BC Hydro option for other initiatives', async () => {
      searchOrgBookSpy.mockResolvedValue({
        total: 0,
        first_index: 0,
        last_index: 0,
        results: []
      } as unknown as SearchOrgBookResponse);

      const { wrapper } = mountRegisteredBusinessOrgbookSearch({ initiative: Initiative.HOUSING });
      await wrapper.findComponent(AutoComplete).vm.$emit('onComplete', { query: 'hydro' });
      await flushPromises();

      expect(wrapper.emitted('update:orgBookOptions')?.[0]?.[0]).toEqual([]);
    });
  });

  describe('selection', () => {
    it('sets the registered name and id fields when an option is selected', async () => {
      const { wrapper, form } = mountRegisteredBusinessOrgbookSearch();

      await wrapper
        .findComponent(AutoComplete)
        .vm.$emit('onSelect', { registeredName: 'Test Co', registeredId: 'BC1234567' });

      expect(form.values.basic?.registeredName).toBe('Test Co');
      expect(form.values.basic?.registeredId).toBe('BC1234567');
    });
  });
});
