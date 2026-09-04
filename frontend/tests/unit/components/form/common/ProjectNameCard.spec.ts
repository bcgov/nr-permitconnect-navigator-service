import { InputText } from '@/components/form';
import ProjectNameCard from '@/components/form/common/ProjectNameCard.vue';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountProjectNameCard(options: { formType?: FormType; formState?: FormState; tab?: number } = {}) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ProjectNameCard, {
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

describe('ProjectNameCard', () => {
  describe('renders', () => {
    it('header', () => {
      const { wrapper } = mountProjectNameCard();

      expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
    });

    describe('mandatory fields', () => {
      describe('projectName', () => {
        it('renders', () => {
          const { wrapper } = mountProjectNameCard();

          const inputTexts = wrapper.findAllComponents(InputText);
          const projectNameInput = inputTexts.find((input) => input.props('name') === 'basic.projectName');

          expect(projectNameInput).toBeTruthy();
        });
      });

      it('displays asterisk', () => {
        const { wrapper } = mountProjectNameCard();

        const labels = wrapper.findAll('label');
        const projectNameLabel = labels.find((label) => label.attributes('for') === 'basic.projectName');
        const spans = projectNameLabel?.findAll('span');
        const asterisk = spans?.find((span) => span.text() === '*');

        expect(asterisk).toBeTruthy();
      });
    });
  });
});
