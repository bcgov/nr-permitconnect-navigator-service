import { nextTick } from 'vue';

import FormAutoSave from '@/components/form/FormAutosave.vue';

import { mountWithFormContext, setFieldValue } from '../../../mountWithFormContext';

// Fixtures

const DELAY = 500;

// Mount

function mountFormAutoSave(callback = vi.fn().mockResolvedValue(undefined), delay: number = DELAY) {
  const { wrapper } = mountWithFormContext(FormAutoSave, {
    fields: ['testField'],
    componentProps: { callback, delay }
  });

  return { wrapper, callback };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// Tests

describe('FormAutoSave', () => {
  it('renders', () => {
    const { wrapper } = mountFormAutoSave();

    expect(wrapper.exists()).toBe(true);
  });

  it('does not call the callback if the form is never touched', async () => {
    const { callback } = mountFormAutoSave();

    await vi.advanceTimersByTimeAsync(DELAY * 2);

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls the callback `delay` ms after the form becomes dirty', async () => {
    const { wrapper, callback } = mountFormAutoSave();

    await setFieldValue(wrapper, 'testField', 'hello');

    // Not yet -- the debounce window hasn't elapsed.
    await vi.advanceTimersByTimeAsync(DELAY - 100);
    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    expect(callback).toHaveBeenCalledOnce();
  });

  it('debounces rapid successive changes into a single call', async () => {
    const { wrapper, callback } = mountFormAutoSave();

    await setFieldValue(wrapper, 'testField', 'h');
    await vi.advanceTimersByTimeAsync(DELAY / 2);
    await setFieldValue(wrapper, 'testField', 'he');
    await vi.advanceTimersByTimeAsync(DELAY / 2);
    await setFieldValue(wrapper, 'testField', 'hel');

    // Each edit resets the timer, so nothing should have fired yet.
    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(DELAY);

    expect(callback).toHaveBeenCalledOnce();
  });

  it('cancels a pending autosave when unmounted before the delay elapses', async () => {
    const { wrapper, callback } = mountFormAutoSave();

    await setFieldValue(wrapper, 'testField', 'hello');
    wrapper.unmount();

    await vi.advanceTimersByTimeAsync(DELAY * 2);

    expect(callback).not.toHaveBeenCalled();
  });

  it('exposes stopAutoSave() to cancel a pending autosave manually', async () => {
    const { wrapper, callback } = mountFormAutoSave();

    await setFieldValue(wrapper, 'testField', 'hello');
    await nextTick();

    wrapper.findComponent(FormAutoSave).vm.stopAutoSave();

    await vi.advanceTimersByTimeAsync(DELAY * 2);

    expect(callback).not.toHaveBeenCalled();
  });
});
