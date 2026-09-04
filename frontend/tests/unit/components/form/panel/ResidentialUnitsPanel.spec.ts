import { nextTick } from 'vue';

import { InputText, Select } from '@/components/form';
import ResidentialUnitsPanel from '@/components/form/panel/ResidentialUnitsPanel.vue';
import { useFormStore } from '@/store';
import { BasicResponse } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountResidentialUnitsPanel(
  options: {
    tab?: number;
    formType?: FormType;
    formState?: FormState;
    hasRentalUnits?: BasicResponse;
    otherUnitsDescription?: string;
  } = {}
) {
  const {
    tab,
    formType = FormType.NEW,
    formState = FormState.UNLOCKED,
    hasRentalUnits,
    otherUnitsDescription
  } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ResidentialUnitsPanel, {
    piniaState: { form: { formType, formState } },
    formProps: { initialValues: { units: { hasRentalUnits, otherUnitsDescription } } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  function selectByName(name: string) {
    return wrapper.findAllComponents(Select).find((s) => s.props('name') === name)!;
  }

  return { wrapper, formStore, form, selectByName };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('ResidentialUnitsPanel', () => {
  describe('rendering', () => {
    it('renders selects bound to the expected field names with the expected options', () => {
      const { selectByName } = mountResidentialUnitsPanel();

      expect(selectByName('units.singleFamilyUnits').props('options')).toEqual(NUM_RESIDENTIAL_UNITS_LIST);
      expect(selectByName('units.multiFamilyUnits').props('options')).toEqual(NUM_RESIDENTIAL_UNITS_LIST);
      expect(selectByName('units.hasRentalUnits').props('options')).toEqual(YES_NO_UNSURE_LIST);
      expect(selectByName('units.rentalUnits').props('options')).toEqual(NUM_RESIDENTIAL_UNITS_LIST);
      expect(selectByName('units.otherUnits').props('options')).toEqual(NUM_RESIDENTIAL_UNITS_LIST);
    });
    it('displays asterisk in label for hasRentalUnits', () => {
      const { wrapper } = mountResidentialUnitsPanel();

      const labels = wrapper.findAll('label');
      const hasRentalUnitsLabel = labels.find((label) => label.attributes('for') === 'units.hasRentalUnits');
      const asterisk = hasRentalUnitsLabel?.findAll('span')?.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });

    it('renders an InputText bound to units.otherUnitsDescription', () => {
      const { wrapper } = mountResidentialUnitsPanel();

      expect(wrapper.findComponent(InputText).props('name')).toBe('units.otherUnitsDescription');
    });

    it.each([
      { editable: true, expectedDisabled: false, formType: FormType.NEW, formState: FormState.UNLOCKED },
      { editable: false, expectedDisabled: true, formType: FormType.SUBMISSION, formState: FormState.LOCKED }
    ])('disables the base selects when getEditable is $editable', ({ formType, formState, expectedDisabled }) => {
      const { selectByName } = mountResidentialUnitsPanel({ formType, formState });

      expect(selectByName('units.singleFamilyUnits').props('disabled')).toBe(expectedDisabled);
    });

    it('disables rentalUnits when hasRentalUnits is not Yes, even while editable', () => {
      const { selectByName } = mountResidentialUnitsPanel({ hasRentalUnits: BasicResponse.NO });

      expect(selectByName('units.rentalUnits').props('disabled')).toBe(true);
    });

    it('enables rentalUnits when hasRentalUnits is Yes and the form is editable', () => {
      const { selectByName } = mountResidentialUnitsPanel({ hasRentalUnits: BasicResponse.YES });

      expect(selectByName('units.rentalUnits').props('disabled')).toBe(false);
    });

    it('disables otherUnits when otherUnitsDescription is empty', () => {
      const { selectByName } = mountResidentialUnitsPanel({ otherUnitsDescription: '' });

      expect(selectByName('units.otherUnits').props('disabled')).toBe(true);
    });

    it('enables otherUnits when otherUnitsDescription is set and the form is editable', () => {
      const { selectByName } = mountResidentialUnitsPanel({ otherUnitsDescription: 'Townhouse' });

      expect(selectByName('units.otherUnits').props('disabled')).toBe(false);
    });

    it('renders a non-empty translated header', () => {
      const { wrapper } = mountResidentialUnitsPanel();

      expect(wrapper.find('h3').text().trim().length).toBeGreaterThan(0);
    });
  });

  describe('user interaction', () => {
    it('clears rentalUnits when hasRentalUnits changes away from Yes', async () => {
      const { selectByName, form } = mountResidentialUnitsPanel({ hasRentalUnits: BasicResponse.YES });
      form.setFieldValue('units.rentalUnits', NUM_RESIDENTIAL_UNITS_LIST[0]);

      await selectByName('units.hasRentalUnits').vm.$emit('onChange', { value: BasicResponse.NO });

      expect(form.values.units?.rentalUnits).toBeNull();
    });

    it('does not clear rentalUnits when hasRentalUnits changes to Yes', async () => {
      const { selectByName, form } = mountResidentialUnitsPanel();
      form.setFieldValue('units.rentalUnits', NUM_RESIDENTIAL_UNITS_LIST[0]);

      await selectByName('units.hasRentalUnits').vm.$emit('onChange', { value: BasicResponse.YES });

      expect(form.values.units?.rentalUnits).toBe(NUM_RESIDENTIAL_UNITS_LIST[0]);
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountResidentialUnitsPanel({ tab: 1 });

      form.setErrors({ 'units.hasRentalUnits': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('ResidentialUnitsPanel', 1, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountResidentialUnitsPanel();

      form.setErrors({ 'units.hasRentalUnits': 'Required' });
      await nextTick();

      form.setErrors({ 'units.hasRentalUnits': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('ResidentialUnitsPanel', 0, false);
    });
  });
});
