import { RadioList } from '@/components/form';
import RegisteredBusinessCard from '@/components/form/common/RegisteredBusinessCard.vue';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

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

describe('RegisteredBusinessCard', () => {
  it('renders', () => {
    const { wrapper } = mountRegisteredBusinessCard();
    expect(wrapper).toBeTruthy();
  });
});

describe('renders all mandatory fields', () => {
  it('renders RadioList for projectApplicantType with correct name', () => {
    const { wrapper } = mountRegisteredBusinessCard();

    const radioLists = wrapper.findAllComponents(RadioList);
    const applicantTypeRadio = radioLists.find((radio) => radio.props('name') === 'basic.projectApplicantType');

    expect(applicantTypeRadio).toBeTruthy();
  });
});

describe('required fields with asterisks', () => {
  it('displays asterisk in header for the required card', () => {
    const { wrapper } = mountRegisteredBusinessCard();

    const header = wrapper.find('h6');
    const spans = header.findAll('span');
    const asterisk = spans.find((span) => span.text() === '*');

    expect(asterisk).toBeTruthy();
  });
});
