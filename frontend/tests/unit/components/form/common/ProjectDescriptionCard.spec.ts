import { TextArea } from '@/components/form';
import ProjectDescriptionCard from '@/components/form/common/ProjectDescriptionCard.vue';
import { useFormStore } from '@/store';
import { Initiative } from '@/utils/enums/application';
import { ElectrificationProjectType } from '@/utils/enums/codeEnums';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountProjectDescriptionCard(
  options: {
    formType?: FormType;
    formState?: FormState;
    tab?: number;
    initiative?: Initiative;
    initialProjectType?: ElectrificationProjectType;
  } = {}
) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab, initiative, initialProjectType } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ProjectDescriptionCard, {
    formProps: { initialValues: { project: { projectType: initialProjectType } } },
    piniaState: { app: { initiative }, form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('ProjectDescriptionCard', () => {
  describe('rendering', () => {
    it('header', () => {
      const { wrapper } = mountProjectDescriptionCard();

      expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
    });

    describe('mandatory fields', () => {
      describe('projectDescription', () => {
        it('renders', () => {
          const { wrapper } = mountProjectDescriptionCard();

          const textAreas = wrapper.findAllComponents(TextArea);
          const projectDescriptionTextArea = textAreas.find(
            (textArea) => textArea.props('name') === 'basic.projectDescription'
          );

          expect(projectDescriptionTextArea).toBeTruthy();
        });
      });

      it('displays asterisk', () => {
        const { wrapper } = mountProjectDescriptionCard();

        const labels = wrapper.findAll('label');
        const projectDescriptionLabel = labels.find((label) => label.attributes('for') === 'basic.projectDescription');
        const asterisk = projectDescriptionLabel?.findAll('span')?.find((span) => span.text() === '*');

        expect(asterisk).toBeTruthy();
      });
      it('displays an asterisk for ELECTRIFICATION projects with type OTHER', () => {
        const { wrapper } = mountProjectDescriptionCard({
          initiative: Initiative.ELECTRIFICATION,
          initialProjectType: ElectrificationProjectType.OTHER
        });

        expect(wrapper.findComponent(TextArea).props('required')).toBe(true);
        expect(wrapper.find('label[for="basic.projectDescription"]').text()).toContain('*');
      });
    });
  });
});
