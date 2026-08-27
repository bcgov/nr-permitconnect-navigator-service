import { nextTick } from 'vue';

import { InputText, RadioList } from '@/components/form';
import FinanciallySupportedCard from '@/components/form/common/FinanciallySupportedCard.vue';
import { useFormStore } from '@/store';
import { BasicResponse } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

function mountFinanciallySupportedCard(
  options: {
    formType?: FormType;
    formState?: FormState;
    tab?: number;
    initialValues?: Record<string, unknown>;
  } = {}
) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab, initialValues } = options;

  const { wrapper, pinia, form } = mountWithFormContext(FinanciallySupportedCard, {
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

describe('FinanciallySupportedCard', () => {
  it('renders', () => {
    const { wrapper } = mountFinanciallySupportedCard();
    expect(wrapper).toBeTruthy();
  });

  it('renders a non-empty translated header', () => {
    const { wrapper } = mountFinanciallySupportedCard();

    expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
  });
});

describe('renders all mandatory fields', () => {
  it('renders RadioList for financiallySupportedBc with correct name', () => {
    const { wrapper } = mountFinanciallySupportedCard();

    const radioLists = wrapper.findAllComponents(RadioList);
    const bcHousingRadio = radioLists.find((radio) => radio.props('name') === 'housing.financiallySupportedBc');

    expect(bcHousingRadio).toBeTruthy();
  });

  it('renders RadioList for financiallySupportedIndigenous with correct name', () => {
    const { wrapper } = mountFinanciallySupportedCard();

    const radioLists = wrapper.findAllComponents(RadioList);
    const indigenousRadio = radioLists.find(
      (radio) => radio.props('name') === 'housing.financiallySupportedIndigenous'
    );

    expect(indigenousRadio).toBeTruthy();
  });

  it('renders RadioList for financiallySupportedNonProfit with correct name', () => {
    const { wrapper } = mountFinanciallySupportedCard();

    const radioLists = wrapper.findAllComponents(RadioList);
    const nonProfitRadio = radioLists.find((radio) => radio.props('name') === 'housing.financiallySupportedNonProfit');

    expect(nonProfitRadio).toBeTruthy();
  });

  it('renders RadioList for financiallySupportedHousingCoop with correct name', () => {
    const { wrapper } = mountFinanciallySupportedCard();

    const radioLists = wrapper.findAllComponents(RadioList);
    const housingCoopRadio = radioLists.find(
      (radio) => radio.props('name') === 'housing.financiallySupportedHousingCoop'
    );

    expect(housingCoopRadio).toBeTruthy();
  });

  it('renders InputText for indigenousDescription when financiallySupportedIndigenous is YES', async () => {
    const { wrapper } = mountFinanciallySupportedCard({
      initialValues: { housing: { financiallySupportedIndigenous: BasicResponse.YES } }
    });

    await nextTick();

    const inputTexts = wrapper.findAllComponents(InputText);
    const indigenousInput = inputTexts.find((input) => input.props('name') === 'housing.indigenousDescription');

    expect(indigenousInput).toBeTruthy();
  });

  it('renders InputText for nonProfitDescription when financiallySupportedNonProfit is YES', async () => {
    const { wrapper } = mountFinanciallySupportedCard({
      initialValues: { housing: { financiallySupportedNonProfit: BasicResponse.YES } }
    });

    await nextTick();

    const inputTexts = wrapper.findAllComponents(InputText);
    const nonProfitInput = inputTexts.find((input) => input.props('name') === 'housing.nonProfitDescription');

    expect(nonProfitInput).toBeTruthy();
  });

  it('renders InputText for housingCoopDescription when financiallySupportedHousingCoop is YES', async () => {
    const { wrapper } = mountFinanciallySupportedCard({
      initialValues: { housing: { financiallySupportedHousingCoop: BasicResponse.YES } }
    });

    await nextTick();

    const inputTexts = wrapper.findAllComponents(InputText);
    const housingCoopInput = inputTexts.find((input) => input.props('name') === 'housing.housingCoopDescription');

    expect(housingCoopInput).toBeTruthy();
  });
});

describe('required fields with asterisks', () => {
  it('displays asterisk in legend for financiallySupportedBc', () => {
    const { wrapper } = mountFinanciallySupportedCard();

    const legends = wrapper.findAll('legend');
    const bcHousingLegend = legends.find((legend) => legend.text().includes('BC Housing'));
    const spans = bcHousingLegend?.findAll('span');
    const asterisk = spans?.find((span) => span.text() === '*');

    expect(asterisk).toBeTruthy();
  });

  it('displays asterisk in legend for financiallySupportedIndigenous', () => {
    const { wrapper } = mountFinanciallySupportedCard();

    const legends = wrapper.findAll('legend');
    const indigenousLegend = legends.find((legend) => legend.text().includes('Indigenous Housing Provider'));
    const spans = indigenousLegend?.findAll('span');
    const asterisk = spans?.find((span) => span.text() === '*');

    expect(asterisk).toBeTruthy();
  });

  it('displays asterisk in legend for financiallySupportedNonProfit', () => {
    const { wrapper } = mountFinanciallySupportedCard();

    const legends = wrapper.findAll('legend');
    const nonProfitLegend = legends.find((legend) => legend.text().includes('Non-profit housing society'));
    const spans = nonProfitLegend?.findAll('span');
    const asterisk = spans?.find((span) => span.text() === '*');

    expect(asterisk).toBeTruthy();
  });

  it('displays asterisk in legend for financiallySupportedHousingCoop', () => {
    const { wrapper } = mountFinanciallySupportedCard();

    const legends = wrapper.findAll('legend');
    const housingCoopLegend = legends.find((legend) => legend.text().includes('Housing co-operative'));
    const spans = housingCoopLegend?.findAll('span');
    const asterisk = spans?.find((span) => span.text() === '*');

    expect(asterisk).toBeTruthy();
  });

  // eslint-disable-next-line max-len
  it('displays asterisk in placeholder for indigenousDescription when financiallySupportedIndigenous is YES', async () => {
    const { wrapper } = mountFinanciallySupportedCard({
      initialValues: { housing: { financiallySupportedIndigenous: BasicResponse.YES } }
    });

    await nextTick();

    const inputTexts = wrapper.findAllComponents(InputText);
    const indigenousInput = inputTexts.find((input) => input.props('name') === 'housing.indigenousDescription');

    expect(indigenousInput?.props('placeholder')).toContain('*');
  });

  // eslint-disable-next-line max-len
  it('displays asterisk in placeholder for nonProfitDescription when financiallySupportedNonProfit is YES', async () => {
    const { wrapper } = mountFinanciallySupportedCard({
      initialValues: { housing: { financiallySupportedNonProfit: BasicResponse.YES } }
    });

    await nextTick();

    const inputTexts = wrapper.findAllComponents(InputText);
    const nonProfitInput = inputTexts.find((input) => input.props('name') === 'housing.nonProfitDescription');

    expect(nonProfitInput?.props('placeholder')).toContain('*');
  });

  // eslint-disable-next-line max-len
  it('displays asterisk in placeholder for housingCoopDescription when financiallySupportedHousingCoop is YES', async () => {
    const { wrapper } = mountFinanciallySupportedCard({
      initialValues: { housing: { financiallySupportedHousingCoop: BasicResponse.YES } }
    });

    await nextTick();

    const inputTexts = wrapper.findAllComponents(InputText);
    const housingCoopInput = inputTexts.find((input) => input.props('name') === 'housing.housingCoopDescription');

    expect(housingCoopInput?.props('placeholder')).toContain('*');
  });
});
