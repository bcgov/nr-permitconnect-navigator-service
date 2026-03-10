import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';

import { default as i18n } from '@/i18n';
import { shallowMount } from '@vue/test-utils';
import TextAreaCard from '@/components/form/common/TextAreaCard.vue';
import { PRIMEVUE_STUBS } from '../../../../helpers';
import { TextArea } from '@/components/form';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { nextTick } from 'vue';

// Default component mounting wrapper settings
interface Props {
  header: string;
  fieldName: string;
  placeholder?: string;
}
const wrapperSettings = (props: Props) => ({
  props: {
    ...props
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          form: {
            formType: FormType.NEW,
            formState: FormState.UNLOCKED
          }
        },
        stubActions: false
      }),
      i18n,
      PrimeVue
    ],
    stubs: { 'font-awesome-icon': true, ...PRIMEVUE_STUBS }
  }
});

// Tests
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('TextAreaCard.vue', () => {
  it('renders correct header', () => {
    const wrapper = shallowMount(TextAreaCard, wrapperSettings({ header: 'Header', fieldName: 'text' }));
    const childComponent = wrapper.find('h6');
    expect(childComponent.text()).toStrictEqual(wrapper.props('header'));
  });

  it('sets TextArea name to given prop', () => {
    const wrapper = shallowMount(TextAreaCard, wrapperSettings({ header: 'Header', fieldName: 'text' }));
    const childComponent = wrapper.findComponent(TextArea);
    expect(childComponent.props('name')).toStrictEqual(wrapper.props('fieldName'));
  });

  it('sets TextArea placeholder to given prop', () => {
    const wrapper = shallowMount(
      TextAreaCard,
      wrapperSettings({ header: 'Header', fieldName: 'text', placeholder: 'placeholder text' })
    );
    const childComponent = wrapper.findComponent(TextArea);
    expect(childComponent.props('placeholder')).toStrictEqual(wrapper.props('placeholder'));
  });

  it('disables TextArea when form is not editable', async () => {
    const wrapper = shallowMount(TextAreaCard, wrapperSettings({ header: 'Header', fieldName: 'text' }));
    const store = useFormStore();
    store.setFormType(FormType.SUBMISSION);
    store.setFormState(FormState.LOCKED);
    await nextTick();

    const childComponent = wrapper.findComponent(TextArea);
    expect(childComponent.props('disabled')).toBe(true);
  });
});
