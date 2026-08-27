import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

import { AutoComplete, InputText, Select } from '@/components/form';
import CompanyProjectNamePanel from '@/components/form/panel/CompanyProjectNamePanel.vue';
import { externalApiService } from '@/services';
import { useFormStore } from '@/store';
import { BC_HYDRO_POWER_AUTHORITY } from '@/utils/constants/electrification';
import { Initiative } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { updateLiveNameKey } from '@/utils/keys';

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

function mountCompanyProjectNamePanel(
  options: {
    tab?: number;
    initiative?: Initiative;
    formType?: FormType;
    formState?: FormState;
    companyNameRegistered?: string;
    updateLiveName?: (name: string) => void;
  } = {}
) {
  const {
    tab,
    initiative = Initiative.HOUSING,
    formType = FormType.NEW,
    formState = FormState.UNLOCKED,
    companyNameRegistered,
    updateLiveName = vi.fn()
  } = options;

  const {
    wrapper: harness,
    pinia,
    form
  } = mountWithFormContext(CompanyProjectNamePanel, {
    componentProps: tab === undefined ? {} : { tab },
    piniaState: {
      app: { initiative },
      form: { formType, formState }
    },
    provide: {
      [updateLiveNameKey as symbol]: updateLiveName
    },
    formProps: { initialValues: { companyProjectName: { companyNameRegistered } } }
  });

  // mountWithFormContext mounts the component inside a synthetic harness
  // (see mountComponent.ts), so events/emits happen on this inner instance,
  // not the harness root -- assert against this wrapper, not `harness`.
  const wrapper = harness.findComponent(CompanyProjectNamePanel);
  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form, updateLiveName };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('CompanyProjectNamePanel', () => {
  describe('rendering', () => {
    it('renders an InputText bound to companyProjectName.projectName', () => {
      const { wrapper } = mountCompanyProjectNamePanel();

      expect(wrapper.findComponent(InputText).props('name')).toBe('companyProjectName.projectName');
    });

    it('renders an AutoComplete bound to companyProjectName.companyNameRegistered', () => {
      const { wrapper } = mountCompanyProjectNamePanel();

      expect(wrapper.findComponent(AutoComplete).props('name')).toBe('companyProjectName.companyNameRegistered');
    });

    it('requires the AutoComplete only for the ELECTRIFICATION initiative', () => {
      const { wrapper: electrification } = mountCompanyProjectNamePanel({ initiative: Initiative.ELECTRIFICATION });
      expect(electrification.findComponent(AutoComplete).props('required')).toBe(true);

      const { wrapper: housing } = mountCompanyProjectNamePanel({ initiative: Initiative.HOUSING });
      expect(housing.findComponent(AutoComplete).props('required')).toBe(false);
    });

    it('disables the fields when the form is not editable', () => {
      const { wrapper } = mountCompanyProjectNamePanel({ formState: FormState.LOCKED });

      expect(wrapper.findComponent(InputText).props('disabled')).toBe(true);
      expect(wrapper.findComponent(AutoComplete).props('disabled')).toBe(true);
    });

    it('renders the activityType and projectNumber fields only for the GENERAL initiative', () => {
      const { wrapper: housing } = mountCompanyProjectNamePanel({ initiative: Initiative.HOUSING });
      expect(housing.findComponent(Select).exists()).toBe(false);
      expect(housing.findAllComponents(InputText)).toHaveLength(2);

      const { wrapper: general } = mountCompanyProjectNamePanel({ initiative: Initiative.GENERAL });
      expect(general.findComponent(Select).props('name')).toBe('companyProjectName.activityType');
      expect(general.findAllComponents(InputText)).toHaveLength(3);
    });
  });

  describe('registered name search', () => {
    it('does not search on mount when there is no initial registered name', async () => {
      mountCompanyProjectNamePanel();
      await flushPromises();

      expect(searchOrgBookSpy).not.toHaveBeenCalled();
    });

    it('searches automatically on mount when a registered name is already set', async () => {
      searchOrgBookSpy.mockResolvedValue({ total: 0, first_index: 0, last_index: 0, results: [] } as never);

      mountCompanyProjectNamePanel({ companyNameRegistered: 'Test Co' });
      await flushPromises();

      expect(searchOrgBookSpy).toHaveBeenCalledWith({ query: 'Test Co' });
    });

    it('does not search when the query is shorter than 2 characters', async () => {
      const { wrapper } = mountCompanyProjectNamePanel();

      await wrapper.findComponent(AutoComplete).vm.$emit('onComplete', { query: 'a' });

      expect(searchOrgBookSpy).not.toHaveBeenCalled();
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

      const { wrapper } = mountCompanyProjectNamePanel();
      await wrapper.findComponent(AutoComplete).vm.$emit('onComplete', { query: 'co' });
      await flushPromises();

      expect(searchOrgBookSpy).toHaveBeenCalledWith({ query: 'co' });
      expect(wrapper.emitted('orgBookOptions')?.[0]?.[0]).toEqual([
        { registeredName: 'Apple Co', registeredId: 'BC1' },
        { registeredName: 'Zebra Co', registeredId: 'BC2' }
      ]);
    });

    it('adds the BC Hydro option when the query matches, regardless of case', async () => {
      searchOrgBookSpy.mockResolvedValue({ total: 0, first_index: 0, last_index: 0, results: [] } as never);

      const { wrapper } = mountCompanyProjectNamePanel();
      await wrapper
        .findComponent(AutoComplete)
        .vm.$emit('onComplete', { query: BC_HYDRO_POWER_AUTHORITY.toLowerCase() });
      await flushPromises();

      expect(wrapper.emitted('orgBookOptions')?.[0]?.[0]).toEqual([
        { registeredName: BC_HYDRO_POWER_AUTHORITY, registeredId: '' }
      ]);
    });
  });

  describe('user interaction', () => {
    it('calls updateLiveName when the project name input changes', async () => {
      const { wrapper, updateLiveName } = mountCompanyProjectNamePanel();

      await wrapper.findComponent(InputText).find('input').setValue('New Project');

      expect(updateLiveName).toHaveBeenCalledWith('New Project');
    });

    it('clears companyIdRegistered when the registered name is changed', async () => {
      const { wrapper, form } = mountCompanyProjectNamePanel();
      form.setFieldValue('companyProjectName.companyIdRegistered', 'BC999');

      await wrapper.findComponent(AutoComplete).vm.$emit('onChange');

      expect(form.values.companyProjectName?.companyIdRegistered).toBeNull();
    });

    it('sets the registered name and id fields when an option is selected', async () => {
      const { wrapper, form } = mountCompanyProjectNamePanel();

      await wrapper
        .findComponent(AutoComplete)
        .vm.$emit('onSelect', { registeredName: 'Test Co', registeredId: 'BC1234567' });

      expect(form.values.companyProjectName?.companyIdRegistered).toBe('BC1234567');
      expect(form.values.companyProjectName?.companyNameRegistered).toBe('Test Co');
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountCompanyProjectNamePanel({ tab: 1 });

      form.setErrors({ 'companyProjectName.projectName': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('CompanyProjectNamePanel', 1, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountCompanyProjectNamePanel();

      form.setErrors({ 'companyProjectName.projectName': 'Required' });
      await nextTick();

      form.setErrors({ 'companyProjectName.projectName': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('CompanyProjectNamePanel', 0, false);
    });
  });

  describe('required fields with asterisks', () => {
    it('displays asterisk in label for projectName', () => {
      const { wrapper } = mountCompanyProjectNamePanel();

      const labels = wrapper.findAll('label');
      const projectNameLabel = labels.find((label) => label.attributes('for') === 'companyProjectName.projectName');
      const asterisk = projectNameLabel?.findAll('span')?.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });

    it('displays asterisk in label for companyNameRegistered when initiative is ELECTRIFICATION', () => {
      const { wrapper } = mountCompanyProjectNamePanel({ initiative: Initiative.ELECTRIFICATION });

      const labels = wrapper.findAll('label');
      const companyNameLabel = labels.find(
        (label) => label.attributes('for') === 'companyProjectName.companyNameRegistered'
      );
      const asterisk = companyNameLabel?.findAll('span')?.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });
  });
});
