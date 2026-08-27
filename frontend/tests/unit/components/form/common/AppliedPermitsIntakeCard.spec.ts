import { nextTick } from 'vue';

import { RadioList } from '@/components/form';
import AppliedPermitsCard from '@/components/form/common/AppliedPermitsCard.vue';
import AppliedPermitsIntakeCard from '@/components/form/common/AppliedPermitsIntakeCard.vue';
import { useFormStore } from '@/store';
import { BasicResponse } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountAppliedPermitsIntakeCard(
  options: {
    formType?: FormType;
    formState?: FormState;
    tab?: number;
    initialAppliedPermits?: Record<string, unknown>[];
    initialHasApplied?: BasicResponse;
  } = {}
) {
  const {
    formType = FormType.NEW,
    formState = FormState.UNLOCKED,
    tab = 0,
    initialAppliedPermits,
    initialHasApplied
  } = options;

  const { wrapper, pinia, form } = mountWithFormContext(AppliedPermitsIntakeCard, {
    componentProps: { tab },
    formProps: {
      initialValues: {
        permits: {
          hasAppliedProvincialPermits: initialHasApplied,
          appliedPermits: initialAppliedPermits
        }
      }
    },
    piniaState: { form: { formType, formState } },
    stubs: { AppliedPermitsCard: true }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, form, formStore };
}

// Tests

describe('AppliedPermitsIntakeCard', () => {
  describe('rendering', () => {
    it('renders a RadioList bound to permits.hasAppliedProvincialPermits', () => {
      const { wrapper } = mountAppliedPermitsIntakeCard();

      const radioList = wrapper.findComponent(RadioList);
      expect(radioList.exists()).toBe(true);
      expect(radioList.props('name')).toBe('permits.hasAppliedProvincialPermits');
    });

    it('does not render the applied permits card when no answer has been given yet', () => {
      const { wrapper } = mountAppliedPermitsIntakeCard();

      expect(wrapper.findComponent(AppliedPermitsCard).exists()).toBe(false);
    });

    it('does not render the applied permits card when the answer is NO', () => {
      const { wrapper } = mountAppliedPermitsIntakeCard({ initialHasApplied: BasicResponse.NO });

      expect(wrapper.findComponent(AppliedPermitsCard).exists()).toBe(false);
    });

    it.each([BasicResponse.YES, BasicResponse.UNSURE])(
      'renders the applied permits card when the answer is %s',
      (initialHasApplied) => {
        const { wrapper } = mountAppliedPermitsIntakeCard({ initialHasApplied });

        expect(wrapper.findComponent(AppliedPermitsCard).exists()).toBe(true);
      }
    );
  });

  describe('answer change', () => {
    it('pushes an empty row when switching to YES with no existing rows', async () => {
      const { form } = mountAppliedPermitsIntakeCard();

      form.setFieldValue('permits.hasAppliedProvincialPermits', BasicResponse.YES);
      await nextTick();

      expect(form.values.permits?.appliedPermits).toEqual([
        { permitTypeId: undefined, trackingId: undefined, submittedDate: undefined }
      ]);
    });

    it('does not push an additional row when switching to UNSURE if a row already exists', async () => {
      const { form } = mountAppliedPermitsIntakeCard({
        initialHasApplied: BasicResponse.YES,
        initialAppliedPermits: [{ permitTypeId: 1 }]
      });

      form.setFieldValue('permits.hasAppliedProvincialPermits', BasicResponse.UNSURE);
      await nextTick();

      expect(form.values.permits?.appliedPermits).toHaveLength(1);
    });

    it('clears the applied permits when switching to NO', async () => {
      const { form } = mountAppliedPermitsIntakeCard({
        initialHasApplied: BasicResponse.YES,
        initialAppliedPermits: [{ permitTypeId: 1 }]
      });

      form.setFieldValue('permits.hasAppliedProvincialPermits', BasicResponse.NO);
      await nextTick();

      expect(form.values.permits?.appliedPermits).toBeUndefined();
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { form, formStore } = mountAppliedPermitsIntakeCard({ tab: 2 });

      form.setErrors({ 'permits.hasAppliedProvincialPermits': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('AppliedPermitsCard', 2, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { form, formStore } = mountAppliedPermitsIntakeCard();

      form.setErrors({ 'permits.hasAppliedProvincialPermits': 'Required' });
      await nextTick();

      form.setErrors({ 'permits.hasAppliedProvincialPermits': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('AppliedPermitsCard', 0, false);
    });

    it('does not report an error for a field this card does not own', async () => {
      const { form, formStore } = mountAppliedPermitsIntakeCard();

      form.setErrors({ 'basic.projectName': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('AppliedPermitsCard', 0, false);
    });
  });

  describe('required fields with asterisks', () => {
    it('displays asterisk in header for the required card', () => {
      const { wrapper } = mountAppliedPermitsIntakeCard();

      const header = wrapper.find('h6');
      const spans = header.findAll('span');
      const asterisk = spans.find((span) => span.text() === '*');

      expect(asterisk).toBeTruthy();
    });
  });
});
