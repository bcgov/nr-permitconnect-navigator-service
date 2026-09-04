import { TextArea } from '@/components/form';
import ProjectDescriptionPanel from '@/components/form/panel/ProjectDescriptionPanel.vue';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountProjectDescriptionPanel(
  options: {
    tab?: number;
    formType?: FormType;
    formState?: FormState;
  } = {}
) {
  const { tab, formType = FormType.NEW, formState = FormState.UNLOCKED } = options;

  const { wrapper } = mountWithFormContext(ProjectDescriptionPanel, {
    piniaState: { form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab }
  });

  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('ProjectDescriptionPanel', () => {
  describe('rendering', () => {
    describe('projectDescription', () => {
      it('renders', () => {
        const { wrapper } = mountProjectDescriptionPanel();

        const textArea = wrapper.findComponent(TextArea);
        expect(textArea.exists()).toBe(true);
        expect(textArea.props('name')).toBe('projectDescription.description');
      });

      it('displays asterisk', () => {
        const { wrapper } = mountProjectDescriptionPanel();

        const header = wrapper.find('h3');
        const asterisk = header.findAll('span').find((span) => span.text() === '*');

        expect(asterisk).toBeTruthy();
      });
    });
  });
});
