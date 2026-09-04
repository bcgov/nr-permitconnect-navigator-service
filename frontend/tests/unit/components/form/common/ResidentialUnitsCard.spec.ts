import { nextTick } from 'vue';

import { Checkbox, InputText, Select } from '@/components/form';
import ResidentialUnitsCard from '@/components/form/common/ResidentialUnitsCard.vue';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountResidentialUnitsCard(
  options: {
    formType?: FormType;
    formState?: FormState;
    tab?: number;
    initialValues?: Record<string, unknown>;
  } = {}
) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab, initialValues } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ResidentialUnitsCard, {
    piniaState: { form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab },
    formProps: { initialValues }
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
        it('renders', () => {
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
      it('singleFamilySelected', () => {
        const { wrapper } = mountResidentialUnitsCard();

        const checkboxes = wrapper.findAllComponents(Checkbox);
        const singleFamilyCheckbox = checkboxes.find(
          (checkbox) => checkbox.props('name') === 'housing.singleFamilySelected'
        );

        expect(singleFamilyCheckbox).toBeTruthy();
      });

      it('multiFamilySelected', () => {
        const { wrapper } = mountResidentialUnitsCard();

        const checkboxes = wrapper.findAllComponents(Checkbox);
        const multiFamilyCheckbox = checkboxes.find(
          (checkbox) => checkbox.props('name') === 'housing.multiFamilySelected'
        );

        expect(multiFamilyCheckbox).toBeTruthy();
      });

      it('otherSelected', () => {
        const { wrapper } = mountResidentialUnitsCard();

        const checkboxes = wrapper.findAllComponents(Checkbox);
        const otherCheckbox = checkboxes.find((checkbox) => checkbox.props('name') === 'housing.otherSelected');

        expect(otherCheckbox).toBeTruthy();
      });
      describe('singleFamilyUnits', () => {
        it('renders', async () => {
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
        it('renders', async () => {
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
        it('renders', async () => {
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
        it('renders', async () => {
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
});
