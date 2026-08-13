import { nextTick } from 'vue';

import { Checkbox } from '@/components/form';
import ProjectAreasUpdatedSection from '@/components/form/section/ProjectAreasUpdatedSection.vue';
import { useFormStore } from '@/store';
import { Initiative } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountProjectAreasUpdatedSection(
  options: { tab?: number; initiative?: Initiative; formType?: FormType; formState?: FormState } = {}
) {
  const { tab, initiative = Initiative.HOUSING, formType = FormType.NEW, formState = FormState.UNLOCKED } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ProjectAreasUpdatedSection, {
    piniaState: {
      app: { initiative },
      form: { formType, formState }
    },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

function checkboxNames(wrapper: ReturnType<typeof mountProjectAreasUpdatedSection>['wrapper']) {
  return wrapper.findAllComponents(Checkbox).map((c) => c.props('name'));
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('ProjectAreasUpdatedSection', () => {
  describe('rendering', () => {
    it('always renders the aaiUpdated checkbox', () => {
      const { wrapper } = mountProjectAreasUpdatedSection({ initiative: Initiative.GENERAL });

      expect(checkboxNames(wrapper)).toContain('projectAreasUpdated.aaiUpdated');
    });

    it('renders addedToAts for HOUSING and ELECTRIFICATION, but not GENERAL', () => {
      const { wrapper: housing } = mountProjectAreasUpdatedSection({ initiative: Initiative.HOUSING });
      expect(checkboxNames(housing)).toContain('projectAreasUpdated.addedToAts');

      const { wrapper: electrification } = mountProjectAreasUpdatedSection({
        initiative: Initiative.ELECTRIFICATION
      });
      expect(checkboxNames(electrification)).toContain('projectAreasUpdated.addedToAts');

      const { wrapper: general } = mountProjectAreasUpdatedSection({ initiative: Initiative.GENERAL });
      expect(checkboxNames(general)).not.toContain('projectAreasUpdated.addedToAts');
    });

    it('renders ltsaCompleted and bcOnlineCompleted only for HOUSING', () => {
      const { wrapper: housing } = mountProjectAreasUpdatedSection({ initiative: Initiative.HOUSING });
      expect(checkboxNames(housing)).toContain('projectAreasUpdated.ltsaCompleted');
      expect(checkboxNames(housing)).toContain('projectAreasUpdated.bcOnlineCompleted');

      const { wrapper: electrification } = mountProjectAreasUpdatedSection({
        initiative: Initiative.ELECTRIFICATION
      });
      expect(checkboxNames(electrification)).not.toContain('projectAreasUpdated.ltsaCompleted');
      expect(checkboxNames(electrification)).not.toContain('projectAreasUpdated.bcOnlineCompleted');
    });

    it('disables checkboxes that support it when the form is not editable', () => {
      const { wrapper } = mountProjectAreasUpdatedSection({ formState: FormState.LOCKED });

      const addedToAts = wrapper
        .findAllComponents(Checkbox)
        .find((c) => c.props('name') === 'projectAreasUpdated.addedToAts')!;
      expect(addedToAts.props('disabled')).toBe(true);
    });

    it('renders a non-empty translated header', () => {
      const { wrapper } = mountProjectAreasUpdatedSection();

      expect(wrapper.find('h4').text().trim().length).toBeGreaterThan(0);
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountProjectAreasUpdatedSection({ tab: 1 });

      form.setErrors({ 'projectAreasUpdated.aaiUpdated': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('ProjectAreasUpdatedSection', 1, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountProjectAreasUpdatedSection();

      form.setErrors({ 'projectAreasUpdated.aaiUpdated': 'Required' });
      await nextTick();

      form.setErrors({ 'projectAreasUpdated.aaiUpdated': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('ProjectAreasUpdatedSection', 0, false);
    });
  });
});
