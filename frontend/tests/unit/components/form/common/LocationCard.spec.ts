import { nextTick } from 'vue';

import { InputNumber, RadioList } from '@/components/form';
import LocationCard from '@/components/form/common/LocationCard.vue';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { ProjectLocation } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

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
          clearMarker: vi.fn()
        }
      }
    }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('LocationCard', () => {
  describe('rendering', () => {
    describe('projectLocation', () => {
      it('renders', () => {
        const { wrapper } = mountLocationCard();

        const radioLists = wrapper.findAllComponents(RadioList);
        const projectLocationRadio = radioLists.find((radio) => radio.props('name') === 'location.projectLocation');

        expect(projectLocationRadio).toBeTruthy();
      });
    });
    describe('mandatory fields', () => {
      describe('header', () => {
        it('renders', () => {
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
        it('renders', async () => {
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
        it('renders', async () => {
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
});
