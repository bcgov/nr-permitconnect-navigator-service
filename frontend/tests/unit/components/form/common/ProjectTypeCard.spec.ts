import { nextTick } from 'vue';

import { RadioList } from '@/components/form';
import ProjectTypeCard from '@/components/form/common/ProjectTypeCard.vue';
import { useFormStore } from '@/store';
import { Initiative } from '@/utils/enums/application';
import { ElectrificationProjectType } from '@/utils/enums/codeEnums';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountProjectTypeCard(
  options: {
    formType?: FormType;
    formState?: FormState;
    tab?: number;
    initiative?: Initiative;
    initialProjectType?: ElectrificationProjectType;
  } = {}
) {
  const {
    formType = FormType.NEW,
    formState = FormState.UNLOCKED,
    tab,
    initiative = Initiative.ELECTRIFICATION,
    initialProjectType
  } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ProjectTypeCard, {
    componentProps: tab === undefined ? {} : { tab },
    formProps: { initialValues: { project: { projectType: initialProjectType } } },
    piniaState: {
      app: { initiative },
      form: { formType, formState },
      code: {
        codes: {
          ElectrificationProjectType: [
            { code: ElectrificationProjectType.IPP_SOLAR, display: 'IPP Solar' },
            { code: ElectrificationProjectType.OTHER, display: 'Other' }
          ]
        }
      }
    }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

// Tests

describe('ProjectTypeCard', () => {
  describe('rendering', () => {
    it('renders a RadioList bound to project.projectType', () => {
      const { wrapper } = mountProjectTypeCard();

      const radioList = wrapper.findComponent(RadioList);
      expect(radioList.exists()).toBe(true);
      expect(radioList.props('name')).toBe('project.projectType');
    });

    it('passes the electrification project type options when the initiative is ELECTRIFICATION', () => {
      const { wrapper } = mountProjectTypeCard();

      expect(wrapper.findComponent(RadioList).props('options')).toEqual([
        { value: ElectrificationProjectType.IPP_SOLAR, label: 'IPP Solar' },
        { value: ElectrificationProjectType.OTHER, label: 'Other' }
      ]);
    });

    it('passes no options for other initiatives', () => {
      const { wrapper } = mountProjectTypeCard({ initiative: Initiative.HOUSING });

      expect(wrapper.findComponent(RadioList).props('options')).toEqual([]);
    });

    it.each([
      { editable: true, expectedDisabled: false, formType: FormType.NEW, formState: FormState.UNLOCKED },
      { editable: false, expectedDisabled: true, formType: FormType.SUBMISSION, formState: FormState.LOCKED }
    ])(
      'passes disabled=$expectedDisabled to the RadioList when getEditable is $editable',
      ({ formType, formState, expectedDisabled }) => {
        const { wrapper } = mountProjectTypeCard({ formType, formState });

        expect(wrapper.findComponent(RadioList).props('disabled')).toBe(expectedDisabled);
      }
    );
    describe('mandatory fields', () => {
      describe('header', () => {
        it('renders', () => {
          const { wrapper } = mountProjectTypeCard();

          expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
        });

        it('displays asterisk', () => {
          const { wrapper } = mountProjectTypeCard();

          const header = wrapper.find('h6');
          const spans = header.findAll('span');
          const asterisk = spans.find((span) => span.text() === '*');

          expect(asterisk).toBeTruthy();
        });
      });
    });
  });

  describe('project type change', () => {
    it('clears project.bcHydroNumber when the type is changed to OTHER', async () => {
      const { form } = mountProjectTypeCard({ initialProjectType: ElectrificationProjectType.IPP_SOLAR });

      form.setFieldValue('project.projectType', ElectrificationProjectType.OTHER);
      await nextTick();

      expect(form.values.project?.bcHydroNumber).toBeNull();
    });

    it('does not touch project.bcHydroNumber when changed to a non-OTHER type', async () => {
      const { form } = mountProjectTypeCard({ initialProjectType: ElectrificationProjectType.OTHER });
      form.setFieldValue('project.bcHydroNumber', '12345');

      form.setFieldValue('project.projectType', ElectrificationProjectType.IPP_SOLAR);
      await nextTick();

      expect(form.values.project?.bcHydroNumber).toBe('12345');
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountProjectTypeCard({ tab: 2 });

      form.setErrors({ 'project.projectType': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('ProjectTypeCard', 2, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountProjectTypeCard();

      form.setErrors({ 'project.projectType': 'Required' });
      await nextTick();

      form.setErrors({ 'project.projectType': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('ProjectTypeCard', 0, false);
    });

    it('does not report an error for a field this card does not own', async () => {
      const { formStore, form } = mountProjectTypeCard();

      form.setErrors({ 'basic.projectName': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('ProjectTypeCard', 0, false);
    });
  });
});
