import { nextTick } from 'vue';

import { TextArea } from '@/components/form';
import LocationPidsPanel from '@/components/form/panel/LocationPidsPanel.vue';
import { useFormStore } from '@/store';

import { mountWithFormContext } from '../../../../mountWithFormContext';

// Mount

function mountLocationPidsPanel(options: { tab?: number; project?: Record<string, unknown> } = {}) {
  const { tab, project } = options;

  const { wrapper, pinia, form } = mountWithFormContext(LocationPidsPanel, {
    piniaState: { project: { project } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('LocationPidsPanel', () => {
  describe('rendering', () => {
    it('renders a disabled TextArea bound to locationPids.auto', () => {
      const { wrapper } = mountLocationPidsPanel();

      const textArea = wrapper.findComponent(TextArea);
      expect(textArea.props('name')).toBe('locationPids.auto');
      expect(textArea.props('disabled')).toBe(true);
    });

    it('renders a non-empty translated header', () => {
      const { wrapper } = mountLocationPidsPanel();

      expect(wrapper.find('h3').text().trim().length).toBeGreaterThan(0);
    });

    it('does not render the download button when the project has no geoJson', () => {
      const { wrapper } = mountLocationPidsPanel({ project: { activityId: 'activity-1' } });

      expect(wrapper.find('#download-geojson').exists()).toBe(false);
    });

    it('renders the download button when the project has geoJson', () => {
      const { wrapper } = mountLocationPidsPanel({
        project: { activityId: 'activity-1', geoJson: { type: 'FeatureCollection', features: [] } }
      });

      expect(wrapper.find('#download-geojson').exists()).toBe(true);
    });

    it('does not render the download button when the project type has no geoJson field at all', () => {
      const { wrapper } = mountLocationPidsPanel({ project: { activityId: 'activity-1', projectName: 'Foo' } });

      expect(wrapper.find('#download-geojson').exists()).toBe(false);
    });
  });

  describe('user interaction', () => {
    it('downloads the project geoJson as a file when the download button is clicked', async () => {
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      const { wrapper } = mountLocationPidsPanel({
        project: {
          activityId: 'activity-1',
          projectName: 'My Project',
          geoJson: { type: 'FeatureCollection', features: [] }
        }
      });

      await wrapper.find('#download-geojson').trigger('click');

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      const [blob] = createObjectURLSpy.mock.calls[0]!;
      expect((blob as Blob).type).toBe('application/geo+json');
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountLocationPidsPanel({ tab: 2 });

      form.setErrors({ 'locationPids.auto': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('LocationPidsPanel', 2, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountLocationPidsPanel();

      form.setErrors({ 'locationPids.auto': 'Required' });
      await nextTick();

      form.setErrors({ 'locationPids.auto': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('LocationPidsPanel', 0, false);
    });
  });
});
