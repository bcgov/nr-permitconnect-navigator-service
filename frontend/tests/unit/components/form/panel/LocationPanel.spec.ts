import { nextTick } from 'vue';

import { EditableSelect, InputNumber, InputText, Select } from '@/components/form';
import LocationPanel from '@/components/form/panel/LocationPanel.vue';
import { externalApiService } from '@/services';
import { useFormStore } from '@/store';
import { YES_NO_LIST } from '@/utils/constants/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

import type { GeocoderFeature, SearchGeocoderAddressResponse } from '@/types';

// Mocks

const searchGeocoderAddressSpy = vi.spyOn(externalApiService, 'searchGeocoderAddress');

// Fixtures

function geocoderFeature(overrides: Partial<GeocoderFeature['properties']> = {}): GeocoderFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', crs: { type: 'name', properties: { code: 4326 } }, coordinates: [0, 0] },
    properties: {
      fullAddress: '123 Main St, Victoria',
      siteName: '',
      unitDesignator: '',
      unitNumber: '',
      unitNumberSuffix: '',
      civicNumber: 123,
      civicNumberSuffix: '',
      streetName: 'Main',
      streetType: 'St',
      isStreetTypePrefix: 'false',
      streetDirection: '',
      isStreetDirectionPrefix: 'false',
      streetQualifier: '',
      localityName: 'Victoria',
      streetAddress: '123 Main St',
      provinceCode: 'BC',
      ...overrides
    } as GeocoderFeature['properties']
  } as GeocoderFeature;
}

// Mount

function mountLocationPanel(
  options: { tab?: number; formType?: FormType; formState?: FormState; location?: Record<string, unknown> } = {}
) {
  const { tab, formType = FormType.NEW, formState = FormState.UNLOCKED, location } = options;

  const { wrapper, pinia, form } = mountWithFormContext(LocationPanel, {
    piniaState: { form: { formType, formState } },
    formProps: { initialValues: { location } },
    componentProps: tab === undefined ? {} : { tab }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('LocationPanel', () => {
  describe('rendering', () => {
    it('renders an EditableSelect address search field', () => {
      const { wrapper } = mountLocationPanel();

      expect(wrapper.findComponent(EditableSelect).props('name')).toBe('addressSearch');
    });

    it('renders the readonly address fields, always disabled', () => {
      const { wrapper } = mountLocationPanel();

      const inputs = wrapper.findAllComponents(InputText);
      const byName = (name: string) => inputs.find((i) => i.props('name') === name)!;
      expect(byName('location.streetAddress').props('disabled')).toBe(true);
      expect(byName('location.locality').props('disabled')).toBe(true);
      expect(byName('location.province').props('disabled')).toBe(true);
    });

    it('renders a naturalDisaster select with the yes/no options', () => {
      const { wrapper } = mountLocationPanel();

      expect(wrapper.findComponent(Select).props('options')).toEqual(YES_NO_LIST);
    });

    it.each([
      { editable: true, expectedDisabled: false, formType: FormType.NEW, formState: FormState.UNLOCKED },
      { editable: false, expectedDisabled: true, formType: FormType.SUBMISSION, formState: FormState.LOCKED }
    ])('disables the editable fields when getEditable is $editable', ({ formType, formState, expectedDisabled }) => {
      const { wrapper } = mountLocationPanel({ formType, formState });

      expect(wrapper.findComponent(EditableSelect).props('disabled')).toBe(expectedDisabled);
      expect(wrapper.findAllComponents(InputNumber)[0]!.props('disabled')).toBe(expectedDisabled);
    });

    it('renders a non-empty translated header', () => {
      const { wrapper } = mountLocationPanel();

      expect(wrapper.find('h3').text().trim().length).toBeGreaterThan(0);
    });
  });

  describe('address search', () => {
    it('clears the address fields when the search input is cleared', async () => {
      const { wrapper, form } = mountLocationPanel({
        location: { streetAddress: '123 Main St', locality: 'Victoria', province: 'BC' }
      });

      await wrapper.findComponent(EditableSelect).vm.$emit('onInput', { target: { value: '' } });

      expect(form.values.location?.streetAddress).toBeNull();
      expect(form.values.location?.locality).toBeNull();
      expect(form.values.location?.province).toBeNull();
    });

    it('searches the geocoder and populates suggestions when given input', async () => {
      searchGeocoderAddressSpy.mockResolvedValue({ features: [geocoderFeature()] } as SearchGeocoderAddressResponse);

      const { wrapper } = mountLocationPanel();
      await wrapper.findComponent(EditableSelect).vm.$emit('onInput', { target: { value: '123 Main' } });
      await nextTick();

      expect(searchGeocoderAddressSpy).toHaveBeenCalledWith({ addressSearch: '123 Main' });
      expect(wrapper.findComponent(EditableSelect).props('options')).toEqual([geocoderFeature()]);
    });
  });

  describe('address selection', () => {
    it('populates streetAddress, locality, and province when a suggestion is selected', async () => {
      const { wrapper, form } = mountLocationPanel();
      const feature = geocoderFeature();

      await wrapper.findComponent(EditableSelect).vm.$emit('onChange', { value: feature, originalEvent: {} });

      expect(form.values.location?.streetAddress).toBe('123 Main St');
      expect(form.values.location?.locality).toBe('Victoria');
      expect(form.values.location?.province).toBe('BC');
    });

    it('ignores the change event when it originated from a plain input event', async () => {
      const { wrapper, form } = mountLocationPanel();
      const feature = geocoderFeature();

      await wrapper
        .findComponent(EditableSelect)
        .vm.$emit('onChange', { value: feature, originalEvent: new InputEvent('input') });

      expect(form.values.location?.streetAddress).toBeUndefined();
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountLocationPanel({ tab: 2 });

      form.setErrors({ 'location.locationPids': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('LocationPanel', 2, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountLocationPanel();

      form.setErrors({ 'location.locationPids': 'Required' });
      await nextTick();

      form.setErrors({ 'location.locationPids': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('LocationPanel', 0, false);
    });
  });
});
