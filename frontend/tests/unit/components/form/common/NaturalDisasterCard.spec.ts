import { nextTick } from 'vue';

import { RadioList } from '@/components/form';
import NaturalDisasterCard from '@/components/form/common/NaturalDisasterCard.vue';
import { useFormStore } from '@/store';

import { mountWithFormContext } from '../../../../mountWithFormContext';
import { FormType, FormState } from '@/utils/enums/projectCommon';

function mountNaturalDisasterCard(options: { formType?: FormType; formState?: FormState; tab?: number } = {}) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab } = options;

  const { wrapper, pinia, form } = mountWithFormContext(NaturalDisasterCard, {
    piniaState: { form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NaturalDisasterCard', () => {
  it('renders a RadioList bound to location.naturalDisaster', () => {
    const { wrapper } = mountNaturalDisasterCard();

    const radioList = wrapper.findComponent(RadioList);
    expect(radioList.exists()).toBe(true);
    expect(radioList.props('name')).toBe('location.naturalDisaster');
  });

  it.each([
    { editable: true, expectedDisabled: false, formType: FormType.NEW, formState: FormState.UNLOCKED },
    { editable: false, expectedDisabled: true, formType: FormType.SUBMISSION, formState: FormState.LOCKED }
  ])(
    'passes disabled=$expectedDisabled to the RadioList when getEditable is $editable',
    ({ formType, formState, expectedDisabled }) => {
      const { wrapper } = mountNaturalDisasterCard({ formType, formState });

      expect(wrapper.findComponent(RadioList).props('disabled')).toBe(expectedDisabled);
    }
  );

  it('renders a non-empty translated header', () => {
    const { wrapper } = mountNaturalDisasterCard();

    expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountNaturalDisasterCard({ tab: 2 });

      form.setErrors({ 'location.naturalDisaster': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('NaturalDisasterCard', 2, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountNaturalDisasterCard();

      form.setErrors({ 'location.naturalDisaster': 'Required' });
      await nextTick();

      form.setErrors({ 'location.naturalDisaster': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('NaturalDisasterCard', 0, false);
    });

    it('does not report an error for a field this card does not own', async () => {
      const { formStore, form } = mountNaturalDisasterCard();

      form.setErrors({ 'basic.projectName': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('NaturalDisasterCard', 0, false);
    });
  });

  describe('required fields with asterisks', () => {
    it('displays asterisk in header for the required card', () => {
      const { wrapper } = mountNaturalDisasterCard();

      const header = wrapper.find('h6');
      const spans = header.findAll('span');
      const asterisk = spans.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });
  });
});
