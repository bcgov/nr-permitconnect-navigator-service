import { RadioList } from '@/components/form';
import RegisteredBusinessCard from '@/components/form/common/RegisteredBusinessCard.vue';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountRegisteredBusinessCard(options: { formType?: FormType; formState?: FormState; tab?: number } = {}) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab } = options;

  const { wrapper, pinia, form } = mountWithFormContext(RegisteredBusinessCard, {
    piniaState: { form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('RegisteredBusinessCard', () => {
  describe('rendering', () => {
    it('projectApplicantType', () => {
      const { wrapper } = mountRegisteredBusinessCard();

      const radioLists = wrapper.findAllComponents(RadioList);
      const applicantTypeRadio = radioLists.find((radio) => radio.props('name') === 'basic.projectApplicantType');

      expect(applicantTypeRadio).toBeTruthy();
    });
  });
  describe('mandatory fields', () => {
    describe('header', () => {
      it('displays asterisk', () => {
        const { wrapper } = mountRegisteredBusinessCard();

        const header = wrapper.find('h6');
        const spans = header.findAll('span');
        const asterisk = spans.find((span) => span.text() === '*');

        expect(asterisk).toBeTruthy();
      });
    });
  });
});
