import { flushPromises } from '@vue/test-utils';

import CancelButton from '@/components/form/CancelButton.vue';

import { mountWithFormContext, setFieldValue } from '../../../mountWithFormContext';

// Mount

function mountCancelButton(props: { editable?: boolean } = {}) {
  const onClicked = vi.fn();

  const { wrapper } = mountWithFormContext(CancelButton, {
    fields: ['testField'],
    componentProps: { ...props, onClicked }
  });

  return { wrapper, onClicked };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('CancelButton', () => {
  it('renders', async () => {
    const { wrapper } = mountCancelButton();
    await flushPromises();

    expect(wrapper.findComponent(CancelButton).exists()).toBe(true);
  });

  it('is disabled when the form has not been touched', async () => {
    const { wrapper } = mountCancelButton();
    await flushPromises();

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('becomes enabled once a field changes, making the form dirty', async () => {
    const { wrapper } = mountCancelButton();
    await flushPromises();

    await setFieldValue(wrapper, 'testField', 'something');

    expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
  });

  it('stays disabled when the form is dirty but `editable` is false', async () => {
    const { wrapper } = mountCancelButton({ editable: false });
    await flushPromises();

    await setFieldValue(wrapper, 'testField', 'something');

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('emits "clicked" when clicked while enabled', async () => {
    const { wrapper, onClicked } = mountCancelButton();
    await flushPromises();

    await setFieldValue(wrapper, 'testField', 'something');
    await wrapper.find('button').trigger('click');

    expect(onClicked).toHaveBeenCalledOnce();
  });
});
