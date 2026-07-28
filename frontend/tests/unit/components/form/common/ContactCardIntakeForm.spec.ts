import ContactCardIntakeForm from '@/components/form/common/ContactCardIntakeForm.vue';
import { useFormStore } from '@/store';

import { mountWithFormContext } from '../../../../mountWithFormContext';
import { FormType, FormState } from '@/utils/enums/projectCommon';

function mountContactCardIntakeForm(options: { formType?: FormType; formState?: FormState; tab?: number } = {}) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ContactCardIntakeForm, {
    piniaState: { form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ContactCardIntakeForm', () => {
  it('renders', () => {
    const { wrapper } = mountContactCardIntakeForm();
    expect(wrapper).toBeTruthy();
  });

  it('renders a non-empty translated header', () => {
    const { wrapper } = mountContactCardIntakeForm();

    expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
  });
});
