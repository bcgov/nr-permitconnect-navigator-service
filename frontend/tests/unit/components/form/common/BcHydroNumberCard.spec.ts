import { nextTick } from 'vue';

import { InputText } from '@/components/form';
import BcHydroNumberCard from '@/components/form/common/BcHydroNumberCard.vue';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountBcHydroNumberCard(options: { formType?: FormType; formState?: FormState; tab?: number } = {}) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab } = options;

  const { wrapper, pinia, form } = mountWithFormContext(BcHydroNumberCard, {
    piniaState: { form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

// Tests

describe('BcHydroNumberCard', () => {
  it('renders an InputText bound to project.bcHydroNumber', () => {
    const { wrapper } = mountBcHydroNumberCard();

    const input = wrapper.findComponent(InputText);
    expect(input.exists()).toBe(true);
    expect(input.props('name')).toBe('project.bcHydroNumber');
  });

  it.each([
    { editable: true, expectedDisabled: false, formType: FormType.NEW, formState: FormState.UNLOCKED },
    { editable: false, expectedDisabled: true, formType: FormType.SUBMISSION, formState: FormState.LOCKED }
  ])(
    'passes disabled=$expectedDisabled to the InputText when getEditable is $editable',
    ({ formType, formState, expectedDisabled }) => {
      const { wrapper } = mountBcHydroNumberCard({ formType, formState });

      expect(wrapper.findComponent(InputText).props('disabled')).toBe(expectedDisabled);
    }
  );

  it('renders a non-empty translated header', () => {
    const { wrapper } = mountBcHydroNumberCard();

    expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountBcHydroNumberCard({ tab: 2 });

      form.setErrors({ 'project.bcHydroNumber': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('BcHydroNumberCard', 2, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountBcHydroNumberCard();

      form.setErrors({ 'project.bcHydroNumber': 'Required' });
      await nextTick();

      form.setErrors({ 'project.bcHydroNumber': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('BcHydroNumberCard', 0, false);
    });

    it('does not report an error for a field this card does not own', async () => {
      const { formStore, form } = mountBcHydroNumberCard();

      form.setErrors({ 'basic.projectName': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('BcHydroNumberCard', 0, false);
    });
  });
});
