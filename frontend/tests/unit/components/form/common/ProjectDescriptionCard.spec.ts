import { TextArea } from '@/components/form';
import ProjectDescriptionCard from '@/components/form/common/ProjectDescriptionCard.vue';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

function mountProjectDescriptionCard(
  options: {
    formType?: FormType;
    formState?: FormState;
    tab?: number;
  } = {}
) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab } = options;

  const { wrapper, pinia, form } = mountWithFormContext(ProjectDescriptionCard, {
    piniaState: { form: { formType, formState } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProjectDescriptionCard', () => {
  it('renders', () => {
    const { wrapper } = mountProjectDescriptionCard();
    expect(wrapper).toBeTruthy();
  });

  it('renders a non-empty translated header', () => {
    const { wrapper } = mountProjectDescriptionCard();

    expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
  });
});

describe('renders all mandatory fields', () => {
  it('renders TextArea for projectDescription with correct name', () => {
    const { wrapper } = mountProjectDescriptionCard();

    const textAreas = wrapper.findAllComponents(TextArea);
    const projectDescriptionTextArea = textAreas.find(
      (textArea) => textArea.props('name') === 'basic.projectDescription'
    );

    expect(projectDescriptionTextArea).toBeTruthy();
  });
});

describe('required fields with asterisks', () => {
  it('displays asterisk in label for projectDescription', () => {
    const { wrapper } = mountProjectDescriptionCard();

    const labels = wrapper.findAll('label');
    const projectDescriptionLabel = labels.find((label) => label.attributes('for') === 'basic.projectDescription');
    const asterisk = projectDescriptionLabel?.findAll('span')?.find((span) => span.text() === '*');

    expect(asterisk).toBeTruthy();
  });
});
