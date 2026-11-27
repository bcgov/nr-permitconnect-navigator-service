import { nextTick } from 'vue';

import { EditableSelect, InputNumber, RadioList } from '@/components/form';
import LocationCard from '@/components/form/common/LocationCard.vue';
import { externalApiService } from '@/services';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { ProjectLocation } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

import type { GeocoderFeature, SearchGeocoderAddressResponse } from '@/types';

// Mocks

const searchGeocoderAddressSpy = vi.spyOn(externalApiService, 'searchGeocoderAddress');
const pinToMapSpy = vi.fn();

// Fixtures

function geocoderFeature(overrides: Partial<GeocoderFeature['properties']> = {}): GeocoderFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', crs: { type: 'name', properties: { code: 4326 } }, coordinates: [-123, 48] },
    properties: {
      fullAddress: '123 Main St, Victoria',
      civicNumber: 123,
      streetName: 'Main',
      streetType: 'St',
      localityName: 'Victoria',
      provinceCode: 'BC',
      ...overrides
    } as GeocoderFeature['properties']
  } as GeocoderFeature;
}

// Mount

function mountLocationCard(
  options: {
    formType?: FormType;
    formState?: FormState;
    tab?: number;
    activeStep?: number;
    initialValues?: Record<string, unknown>;
  } = {}
) {
  const { formType = FormType.NEW, formState = FormState.UNLOCKED, tab, activeStep = 0, initialValues } = options;

  const { wrapper, pinia, form } = mountWithFormContext(LocationCard, {
    piniaState: { form: { formType, formState } },
    componentProps: { activeStep, ...(tab === undefined ? {} : { tab }) },
    formProps: { initialValues },
    stubs: {
      Map: {
        template: '<div></div>',
        methods: {
          resizeMap: vi.fn(),
          addMarkerByLatLong: vi.fn(),
          clearMarker: vi.fn(),
          pinToMap: pinToMapSpy
        }
      }
    }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// Tests

describe('LocationCard', () => {
  describe('rendering', () => {
    describe('projectLocation', () => {
      it('renders a RadioList bound to location.projectLocation', () => {
        const { wrapper } = mountLocationCard();

        const radioLists = wrapper.findAllComponents(RadioList);
        const projectLocationRadio = radioLists.find((radio) => radio.props('name') === 'location.projectLocation');

        expect(projectLocationRadio).toBeTruthy();
      });
    });

    describe('mandatory fields', () => {
      describe('header', () => {
        it('renders a non-empty translated header', () => {
          const { wrapper } = mountLocationCard();

          expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
        });

        it('displays asterisk', () => {
          const { wrapper } = mountLocationCard();

          const header = wrapper.find('h6');
          const spans = header.findAll('span');
          const asterisk = spans.find((span) => span.text() === '*');

          expect(asterisk).toBeTruthy();
        });
      });

      describe('latitude', () => {
        it('renders an enabled InputNumber bound to location.latitude', async () => {
          const { wrapper } = mountLocationCard({
            initialValues: { location: { projectLocation: ProjectLocation.LOCATION_COORDINATES } }
          });

          await nextTick();

          const inputNumbers = wrapper.findAllComponents(InputNumber);
          const latitudeInput = inputNumbers.find(
            (input) => input.props('name') === 'location.latitude' && !input.props('disabled')
          );

          expect(latitudeInput).toBeTruthy();
        });

        it('is required when projectLocation is LOCATION_COORDINATES', async () => {
          const { wrapper } = mountLocationCard({
            initialValues: { location: { projectLocation: ProjectLocation.LOCATION_COORDINATES } }
          });

          await nextTick();

          const inputNumbers = wrapper.findAllComponents(InputNumber);
          const latitudeInput = inputNumbers.find(
            (input) => input.props('name') === 'location.latitude' && !input.props('disabled')
          );

          expect(latitudeInput?.props('required')).toBe(true);
        });
      });

      describe('longitude', () => {
        it('renders an enabled InputNumber bound to location.longitude', async () => {
          const { wrapper } = mountLocationCard({
            initialValues: { location: { projectLocation: ProjectLocation.LOCATION_COORDINATES } }
          });

          await nextTick();

          const inputNumbers = wrapper.findAllComponents(InputNumber);
          const longitudeInput = inputNumbers.find(
            (input) => input.props('name') === 'location.longitude' && !input.props('disabled')
          );

          expect(longitudeInput).toBeTruthy();
        });

        it('is required when projectLocation is LOCATION_COORDINATES', async () => {
          const { wrapper } = mountLocationCard({
            initialValues: { location: { projectLocation: ProjectLocation.LOCATION_COORDINATES } }
          });

          await nextTick();

          const inputNumbers = wrapper.findAllComponents(InputNumber);
          const longitudeInput = inputNumbers.find(
            (input) => input.props('name') === 'location.longitude' && !input.props('disabled')
          );

          expect(longitudeInput?.props('required')).toBe(true);
        });
      });
    });
  });

  describe('address search', () => {
    it('does not search when the field is emptied', async () => {
      const { wrapper } = mountLocationCard({
        initialValues: { location: { projectLocation: ProjectLocation.STREET_ADDRESS } }
      });

      await wrapper.findComponent(EditableSelect).vm.$emit('onInput', { target: { value: '' } });
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).not.toHaveBeenCalled();
    });

    it('searches the geocoder and populates suggestions when given input', async () => {
      searchGeocoderAddressSpy.mockResolvedValue({ features: [geocoderFeature()] } as SearchGeocoderAddressResponse);

      const { wrapper } = mountLocationCard({
        initialValues: { location: { projectLocation: ProjectLocation.STREET_ADDRESS } }
      });
      await wrapper.findComponent(EditableSelect).vm.$emit('onInput', { target: { value: '123 Main' } });
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).toHaveBeenCalledWith({ addressSearch: '123 Main' });
      expect(wrapper.findComponent(EditableSelect).props('options')).toEqual([geocoderFeature()]);
    });

    it('loads a draft address immediately, without waiting for the debounce', async () => {
      searchGeocoderAddressSpy.mockResolvedValue({ features: [geocoderFeature()] } as SearchGeocoderAddressResponse);

      const { wrapper, form } = mountLocationCard({
        initialValues: {
          location: { projectLocation: ProjectLocation.STREET_ADDRESS, addressSearch: geocoderFeature() }
        }
      });
      await vi.advanceTimersByTimeAsync(0);

      expect(searchGeocoderAddressSpy).toHaveBeenCalledWith({ addressSearch: '123 Main St, Victoria' });
      expect(wrapper.findComponent(EditableSelect).props('options')).toEqual([geocoderFeature()]);
      expect(form.values.location?.addressSearch).toBe('123 Main St, Victoria');
    });

    it('cancels any pending search once a suggestion is selected', async () => {
      searchGeocoderAddressSpy.mockResolvedValue({ features: [geocoderFeature()] } as SearchGeocoderAddressResponse);

      const { wrapper } = mountLocationCard({
        initialValues: { location: { projectLocation: ProjectLocation.STREET_ADDRESS } }
      });
      const addressSearch = wrapper.findComponent(EditableSelect);
      await addressSearch.vm.$emit('onInput', { target: { value: '123 Main' } });
      await addressSearch.vm.$emit('onChange', { value: geocoderFeature(), originalEvent: {} });
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).not.toHaveBeenCalled();
    });
  });

  describe('address selection', () => {
    it('fills in the address fields, coordinates and map pin when a suggestion is selected', async () => {
      const { wrapper, form } = mountLocationCard({
        initialValues: { location: { projectLocation: ProjectLocation.STREET_ADDRESS } }
      });
      const feature = geocoderFeature();

      await wrapper.findComponent(EditableSelect).vm.$emit('onChange', { value: feature, originalEvent: {} });

      expect(form.values.location?.streetAddress).toBe('123 Main St');
      expect(form.values.location?.locality).toBe('Victoria');
      expect(form.values.location?.province).toBe('BC');
      expect(form.values.location?.latitude).toBe(48);
      expect(form.values.location?.longitude).toBe(-123);
      expect(pinToMapSpy).toHaveBeenCalledWith(48, -123);
    });

    it('ignores the change event when it originated from a plain input event', async () => {
      const { wrapper, form } = mountLocationCard({
        initialValues: { location: { projectLocation: ProjectLocation.STREET_ADDRESS } }
      });
      const feature = geocoderFeature();

      await wrapper
        .findComponent(EditableSelect)
        .vm.$emit('onChange', { value: feature, originalEvent: new InputEvent('input') });

      expect(form.values.location?.streetAddress).toBeUndefined();
    });
  });
});
