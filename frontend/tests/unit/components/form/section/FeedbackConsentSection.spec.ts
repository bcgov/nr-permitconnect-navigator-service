import { nextTick } from 'vue';

import { Select } from '@/components/form';
import FeedbackConsentSection from '@/components/form/section/FeedbackConsentSection.vue';
import { useFormStore } from '@/store';
import { YES_NO_LIST } from '@/utils/constants/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountFeedbackConsentSection(options: { tab?: number; formType?: FormType; formState?: FormState } = {}) {
  const { tab, formType = FormType.NEW, formState = FormState.UNLOCKED } = options;

  const { wrapper, pinia, form } = mountWithFormContext(FeedbackConsentSection, {
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

describe('FeedbackConsentSection', () => {
  describe('rendering', () => {
    it('renders a Select bound to consent.consentToFeedback with the yes/no options', () => {
      const { wrapper } = mountFeedbackConsentSection();

      const select = wrapper.findComponent(Select);
      expect(select.props('name')).toBe('consent.consentToFeedback');
      expect(select.props('options')).toEqual(YES_NO_LIST);
    });

    it.each([
      { editable: true, expectedDisabled: false, formType: FormType.NEW, formState: FormState.UNLOCKED },
      { editable: false, expectedDisabled: true, formType: FormType.SUBMISSION, formState: FormState.LOCKED }
    ])(
      'passes disabled=$expectedDisabled to the Select when getEditable is $editable',
      ({ formType, formState, expectedDisabled }) => {
        const { wrapper } = mountFeedbackConsentSection({ formType, formState });

        expect(wrapper.findComponent(Select).props('disabled')).toBe(expectedDisabled);
      }
    );

    it('renders a non-empty translated header', () => {
      const { wrapper } = mountFeedbackConsentSection();

      expect(wrapper.find('h4').text().trim().length).toBeGreaterThan(0);
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountFeedbackConsentSection({ tab: 2 });

      form.setErrors({ 'consent.consentToFeedback': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('FeedbackConsentSection', 2, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountFeedbackConsentSection();

      form.setErrors({ 'consent.consentToFeedback': 'Required' });
      await nextTick();

      form.setErrors({ 'consent.consentToFeedback': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('FeedbackConsentSection', 0, false);
    });

    it('does not report an error for a field this section does not own', async () => {
      const { formStore, form } = mountFeedbackConsentSection();

      form.setErrors({ 'basic.projectName': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('FeedbackConsentSection', 0, false);
    });
  });
});
