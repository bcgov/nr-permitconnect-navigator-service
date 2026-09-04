import { nextTick } from 'vue';

import { RadioList, Select } from '@/components/form';
import RentalUnitsCard from '@/components/form/common/RentalUnitsCard.vue';
import { useFormStore } from '@/store';
import { BasicResponse } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountRentalUnitsCard(
  options: {
    formType?: FormType;
    formState?: FormState;
    tab?: number;
    initialValues?: Record<string, unknown>;
  } = {}
) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab, initialValues } = options;

  const { wrapper, pinia, form } = mountWithFormContext(RentalUnitsCard, {
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

describe('RentalUnitsCard', () => {
  describe('rendering', () => {
    describe('header', () => {
      it('renders', () => {
        const { wrapper } = mountRentalUnitsCard();

        expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
      });
      it('displays asterisk', () => {
        const { wrapper } = mountRentalUnitsCard();

        const header = wrapper.find('h6');
        const spans = header.findAll('span');
        const asterisk = spans.find((span) => span.text() === '*');

        expect(asterisk).toBeTruthy();
      });
    });

    describe('mandatory fields', () => {
      describe('hasRentalUnits', () => {
        it('renders', () => {
          const { wrapper } = mountRentalUnitsCard();

          const radioLists = wrapper.findAllComponents(RadioList);
          const hasRentalUnitsRadio = radioLists.find((radio) => radio.props('name') === 'housing.hasRentalUnits');

          expect(hasRentalUnitsRadio).toBeTruthy();
        });

        it('renders Select for rentalUnits when hasRentalUnits is YES', async () => {
          const { wrapper } = mountRentalUnitsCard({
            initialValues: { housing: { hasRentalUnits: BasicResponse.YES } }
          });

          await nextTick();

          const selects = wrapper.findAllComponents(Select);
          const rentalUnitsSelect = selects.find((select) => select.props('name') === 'housing.rentalUnits');

          expect(rentalUnitsSelect).toBeTruthy();
        });
        it('displays asterisk', async () => {
          const { wrapper } = mountRentalUnitsCard({
            initialValues: { housing: { hasRentalUnits: BasicResponse.YES } }
          });

          await nextTick();

          const selects = wrapper.findAllComponents(Select);
          const rentalUnitsSelect = selects.find((select) => select.props('name') === 'housing.rentalUnits');

          expect(rentalUnitsSelect?.props('placeholder')).toContain('*');
        });
      });
    });
  });
});
