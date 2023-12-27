import { shallowMount } from '@vue/test-utils';

import PrimeVue from 'primevue/config';
import InputText from '@/components/form/InputText.vue';

describe('InputText.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(InputText, {
      props: {
        name: 'test'
      },
      global: {
        plugins: [PrimeVue]
      }
    });

    expect(wrapper).toBeTruthy();
  });

  it('displays the label', () => {
    const wrapper = shallowMount(InputText, {
      props: {
        label: 'testlabel',
        name: 'test'
      },
      global: {
        plugins: [PrimeVue]
      }
    });

    const label = wrapper.find('label');
    expect(label.text()).toBe('testlabel');
  });

  it('displays the help text', () => {
    const wrapper = shallowMount(InputText, {
      props: {
        helpText: 'some help text',
        name: 'test'
      },
      global: {
        plugins: [PrimeVue]
      }
    });

    const help = wrapper.find('small');
    expect(help.text()).toBe('some help text');
  });

  it('sets the placeholder text', () => {
    const wrapper = shallowMount(InputText, {
      props: {
        name: 'test',
        placeholder: 'some placeholder text'
      },
      global: {
        plugins: [PrimeVue]
      }
    });

    const input = wrapper.getComponent({ name: 'InputText' });
    expect(input.attributes('placeholder')).toBe('some placeholder text');
  });

  it('sets the disabled attribute', () => {
    const wrapper = shallowMount(InputText, {
      props: {
        disabled: true,
        name: 'test'
      },
      global: {
        plugins: [PrimeVue]
      }
    });

    const input = wrapper.getComponent({ name: 'InputText' });
    expect(input.attributes('disabled')).toBeDefined();
  });
});
