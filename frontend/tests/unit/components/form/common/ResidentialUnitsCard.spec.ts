import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

import { Checkbox, InputText, Select } from '@/components/form';
import ResidentialUnitsCard from '@/components/form/common/ResidentialUnitsCard.vue';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { toTypedSchema } from '@/utils/zodSchema';
import { createProjectIntakeSchema } from '@/validators/housing/projectIntakeFormSchema';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountResidentialUnitsCard(
  options: {
    formType?: FormType;
    formState?: FormState;
    tab?: number;
    initialValues?: Record<string, unknown>;
    withSchema?: boolean;
  } = {}
) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab, initialValues, withSchema } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ResidentialUnitsCard, {
    piniaState: { form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab },
    formProps: { initialValues, ...(withSchema && { validationSchema: toTypedSchema(createProjectIntakeSchema([])) }) }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('ResidentialUnitsCard', () => {
  describe('rendering', () => {
    describe('mandatory fields', () => {
      describe('header', () => {
        it('renders a non-empty translated header', () => {
          const { wrapper } = mountResidentialUnitsCard();

          expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
        });

        it('displays asterisk', () => {
          const { wrapper } = mountResidentialUnitsCard();

          const header = wrapper.find('h6');
          const spans = header.findAll('span');
          const asterisk = spans.find((span) => span.text() === '*');

          expect(asterisk).toBeTruthy();
        });
      });

      describe('singleFamilySelected', () => {
        it('binds a Checkbox to housing.singleFamilySelected', () => {
          const { wrapper } = mountResidentialUnitsCard();

          const checkboxes = wrapper.findAllComponents(Checkbox);
          const singleFamilyCheckbox = checkboxes.find(
            (checkbox) => checkbox.props('name') === 'housing.singleFamilySelected'
          );

          expect(singleFamilyCheckbox).toBeTruthy();
        });
      });

      describe('multiFamilySelected', () => {
        it('binds a Checkbox to housing.multiFamilySelected', () => {
          const { wrapper } = mountResidentialUnitsCard();

          const checkboxes = wrapper.findAllComponents(Checkbox);
          const multiFamilyCheckbox = checkboxes.find(
            (checkbox) => checkbox.props('name') === 'housing.multiFamilySelected'
          );

          expect(multiFamilyCheckbox).toBeTruthy();
        });
      });

      describe('otherSelected', () => {
        it('binds a Checkbox to housing.otherSelected', () => {
          const { wrapper } = mountResidentialUnitsCard();

          const checkboxes = wrapper.findAllComponents(Checkbox);
          const otherCheckbox = checkboxes.find((checkbox) => checkbox.props('name') === 'housing.otherSelected');

          expect(otherCheckbox).toBeTruthy();
        });
      });

      describe('singleFamilyUnits', () => {
        it('renders a Select bound to housing.singleFamilyUnits', async () => {
          const { wrapper } = mountResidentialUnitsCard({
            initialValues: { housing: { singleFamilySelected: true } }
          });

          await nextTick();

          const selects = wrapper.findAllComponents(Select);
          const singleFamilyUnitsSelect = selects.find(
            (select) => select.props('name') === 'housing.singleFamilyUnits'
          );

          expect(singleFamilyUnitsSelect).toBeTruthy();
        });

        it('displays asterisk', async () => {
          const { wrapper } = mountResidentialUnitsCard({
            initialValues: { housing: { singleFamilySelected: true } }
          });

          await nextTick();

          const selects = wrapper.findAllComponents(Select);
          const singleFamilyUnitsSelect = selects.find(
            (select) => select.props('name') === 'housing.singleFamilyUnits'
          );

          expect(singleFamilyUnitsSelect?.props('placeholder')).toContain('*');
        });
      });

      describe('multiFamilyUnits', () => {
        it('renders a Select bound to housing.multiFamilyUnits', async () => {
          const { wrapper } = mountResidentialUnitsCard({
            initialValues: { housing: { multiFamilySelected: true } }
          });

          await nextTick();

          const selects = wrapper.findAllComponents(Select);
          const multiFamilyUnitsSelect = selects.find((select) => select.props('name') === 'housing.multiFamilyUnits');

          expect(multiFamilyUnitsSelect).toBeTruthy();
        });

        it('displays asterisk', async () => {
          const { wrapper } = mountResidentialUnitsCard({
            initialValues: { housing: { multiFamilySelected: true } }
          });

          await nextTick();

          const selects = wrapper.findAllComponents(Select);
          const multiFamilyUnitsSelect = selects.find((select) => select.props('name') === 'housing.multiFamilyUnits');

          expect(multiFamilyUnitsSelect?.props('placeholder')).toContain('*');
        });
      });

      describe('otherUnitsDescription', () => {
        it('renders an InputText bound to housing.otherUnitsDescription', async () => {
          const { wrapper } = mountResidentialUnitsCard({
            initialValues: { housing: { otherSelected: true } }
          });

          await nextTick();

          const inputTexts = wrapper.findAllComponents(InputText);
          const otherUnitsDescInput = inputTexts.find(
            (input) => input.props('name') === 'housing.otherUnitsDescription'
          );

          expect(otherUnitsDescInput).toBeTruthy();
        });

        it('displays asterisk', async () => {
          const { wrapper } = mountResidentialUnitsCard({
            initialValues: { housing: { otherSelected: true } }
          });

          await nextTick();

          const inputTexts = wrapper.findAllComponents(InputText);
          const otherUnitsDescInput = inputTexts.find(
            (input) => input.props('name') === 'housing.otherUnitsDescription'
          );

          expect(otherUnitsDescInput?.props('placeholder')).toContain('*');
        });
      });

      describe('otherUnits', () => {
        it('renders a Select bound to housing.otherUnits', async () => {
          const { wrapper } = mountResidentialUnitsCard({
            initialValues: { housing: { otherSelected: true } }
          });

          await nextTick();

          const selects = wrapper.findAllComponents(Select);
          const otherUnitsSelect = selects.find((select) => select.props('name') === 'housing.otherUnits');

          expect(otherUnitsSelect).toBeTruthy();
        });

        it('displays asterisk', async () => {
          const { wrapper } = mountResidentialUnitsCard({
            initialValues: { housing: { otherSelected: true } }
          });

          await nextTick();

          const selects = wrapper.findAllComponents(Select);
          const otherUnitsSelect = selects.find((select) => select.props('name') === 'housing.otherUnits');

          expect(otherUnitsSelect?.props('placeholder')).toContain('*');
        });
      });
    });
  });

  describe('validation', () => {
    const UNIT_TYPE_ERROR = 'At least one residential unit type must be selected';

    // A new intake must not flag the card before the user submits
    it('does not show the unit type error before the form is validated', async () => {
      const { wrapper, form } = mountResidentialUnitsCard({ withSchema: true });
      // Checkboxes default to false on mount, which triggers a debounced validation
      await flushPromises();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await flushPromises();

      // An error at a path without a registered field would be visible here, and raise the intake's validation banner
      const cardPaths = [
        'housing',
        'housing.unitTypes',
        'housing.singleFamilySelected',
        'housing.multiFamilySelected',
        'housing.otherSelected'
      ];
      expect(Object.keys(form.errors.value).filter((path) => cardPaths.includes(path))).toEqual([]);
      expect(wrapper.text()).not.toContain(UNIT_TYPE_ERROR);
    });

    it('shows the unit type error once the form is validated', async () => {
      const { wrapper, form } = mountResidentialUnitsCard({ withSchema: true });
      await form.validate();
      await nextTick();

      expect(wrapper.text()).toContain(UNIT_TYPE_ERROR);
    });
  });
});
