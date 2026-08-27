import { nextTick } from 'vue';

import { InputText, Select } from '@/components/form';
import FinanciallySupportedPanel from '@/components/form/panel/FinanciallySupportedPanel.vue';
import { useFormStore } from '@/store';
import { BasicResponse } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountFinanciallySupportedPanel(
  options: {
    tab?: number;
    formType?: FormType;
    formState?: FormState;
    initialValues?: {
      financiallySupportedIndigenous?: BasicResponse;
      financiallySupportedNonProfit?: BasicResponse;
      financiallySupportedHousingCoop?: BasicResponse;
    };
  } = {}
) {
  const { tab, formType = FormType.NEW, formState = FormState.UNLOCKED, initialValues = {} } = options;

  const { wrapper, pinia, form } = mountWithFormContext(FinanciallySupportedPanel, {
    piniaState: { form: { formType, formState } },
    formProps: { initialValues: { finance: initialValues } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  function selectByName(name: string) {
    return wrapper.findAllComponents(Select).find((s) => s.props('name') === name)!;
  }

  function inputTextByName(name: string) {
    return wrapper.findAllComponents(InputText).find((i) => i.props('name') === name)!;
  }

  return { wrapper, formStore, form, selectByName, inputTextByName };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('FinanciallySupportedPanel', () => {
  describe('rendering', () => {
    it('renders selects bound to the expected field names with the expected options', () => {
      const { selectByName } = mountFinanciallySupportedPanel();

      expect(selectByName('finance.financiallySupportedBc').props('options')).toEqual(YES_NO_UNSURE_LIST);
      expect(selectByName('finance.financiallySupportedIndigenous').props('options')).toEqual(YES_NO_UNSURE_LIST);
      expect(selectByName('finance.financiallySupportedNonProfit').props('options')).toEqual(YES_NO_UNSURE_LIST);
      expect(selectByName('finance.financiallySupportedHousingCoop').props('options')).toEqual(YES_NO_UNSURE_LIST);
    });

    it('renders InputTexts for the description fields', () => {
      const { inputTextByName } = mountFinanciallySupportedPanel();

      expect(inputTextByName('finance.indigenousDescription').exists()).toBe(true);
      expect(inputTextByName('finance.nonProfitDescription').exists()).toBe(true);
      expect(inputTextByName('finance.housingCoopDescription').exists()).toBe(true);
    });
  });

  describe('mandatory fields', () => {
    it('sets required prop on financiallySupportedBc', () => {
      const { selectByName } = mountFinanciallySupportedPanel();

      expect(selectByName('finance.financiallySupportedBc').props('required')).toBe(true);
    });

    it('disables indigenousDescription when financiallySupportedIndigenous is not Yes', async () => {
      const { inputTextByName } = mountFinanciallySupportedPanel({
        initialValues: { financiallySupportedIndigenous: BasicResponse.NO }
      });

      await nextTick();

      expect(inputTextByName('finance.indigenousDescription').props('disabled')).toBe(true);
    });

    it('enables indigenousDescription when financiallySupportedIndigenous is Yes', async () => {
      const { inputTextByName } = mountFinanciallySupportedPanel({
        initialValues: { financiallySupportedIndigenous: BasicResponse.YES }
      });

      await nextTick();

      expect(inputTextByName('finance.indigenousDescription').props('disabled')).toBe(false);
    });

    it('disables nonProfitDescription when financiallySupportedNonProfit is not Yes', async () => {
      const { inputTextByName } = mountFinanciallySupportedPanel({
        initialValues: { financiallySupportedNonProfit: BasicResponse.NO }
      });

      await nextTick();

      expect(inputTextByName('finance.nonProfitDescription').props('disabled')).toBe(true);
    });

    it('enables nonProfitDescription when financiallySupportedNonProfit is Yes', async () => {
      const { inputTextByName } = mountFinanciallySupportedPanel({
        initialValues: { financiallySupportedNonProfit: BasicResponse.YES }
      });

      await nextTick();

      expect(inputTextByName('finance.nonProfitDescription').props('disabled')).toBe(false);
    });

    it('disables housingCoopDescription when financiallySupportedHousingCoop is not Yes', async () => {
      const { inputTextByName } = mountFinanciallySupportedPanel({
        initialValues: { financiallySupportedHousingCoop: BasicResponse.NO }
      });

      await nextTick();

      expect(inputTextByName('finance.housingCoopDescription').props('disabled')).toBe(true);
    });

    it('enables housingCoopDescription when financiallySupportedHousingCoop is Yes', async () => {
      const { inputTextByName } = mountFinanciallySupportedPanel({
        initialValues: { financiallySupportedHousingCoop: BasicResponse.YES }
      });

      await nextTick();

      expect(inputTextByName('finance.housingCoopDescription').props('disabled')).toBe(false);
    });
  });

  describe('required fields with asterisks', () => {
    it('displays asterisk in label for financiallySupportedBc', () => {
      const { wrapper } = mountFinanciallySupportedPanel();

      const labels = wrapper.findAll('label');
      const bcHousingLabel = labels.find((label) => label.attributes('for') === 'finance.financiallySupportedBc');
      const asterisk = bcHousingLabel?.findAll('span')?.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });

    it('displays asterisk in heading for financiallySupportedIndigenous', () => {
      const { wrapper } = mountFinanciallySupportedPanel();

      const headings = wrapper.findAll('h6');
      const indigenousHeading = headings.find(
        (h) => h.text().includes('Indigenous Housing Provider') || h.text().includes('indigenousHousingProvider')
      );
      const asterisk = indigenousHeading?.findAll('span')?.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });

    it('displays asterisk in heading for financiallySupportedNonProfit', () => {
      const { wrapper } = mountFinanciallySupportedPanel();

      const headings = wrapper.findAll('h6');
      const nonProfitHeading = headings.find(
        (h) => h.text().includes('Non-profit housing society') || h.text().includes('nonProfitHousingSociety')
      );
      const asterisk = nonProfitHeading?.findAll('span')?.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });

    it('displays asterisk in heading for financiallySupportedHousingCoop', () => {
      const { wrapper } = mountFinanciallySupportedPanel();

      const headings = wrapper.findAll('h6');
      const housingCoopHeading = headings.find(
        (h) => h.text().includes('Housing co-operative') || h.text().includes('housingCoop')
      );
      const asterisk = housingCoopHeading?.findAll('span')?.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });
  });
});
