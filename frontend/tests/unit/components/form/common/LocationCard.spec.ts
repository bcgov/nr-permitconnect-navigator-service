import { nextTick } from 'vue';

import { InputNumber, RadioList } from '@/components/form';
import LocationCard from '@/components/form/common/LocationCard.vue';
import { useFormStore } from '@/store';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { ProjectLocation } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

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
    fields: ['location.latitude', 'location.longitude'],
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

describe('LocationCard', () => {
  it('renders', () => {
    const { wrapper } = mountLocationCard();
    expect(wrapper).toBeTruthy();
  });

  it('renders a non-empty translated header', () => {
    const { wrapper } = mountLocationCard();

    expect(wrapper.find('h6').text().trim().length).toBeGreaterThan(0);
  });
});

describe('renders all mandatory fields', () => {
  it('renders RadioList for projectLocation with correct name', () => {
    const { wrapper } = mountLocationCard();

    const radioLists = wrapper.findAllComponents(RadioList);
    const projectLocationRadio = radioLists.find((radio) => radio.props('name') === 'location.projectLocation');

    expect(projectLocationRadio).toBeTruthy();
  });

  it('renders InputNumber for latitude when projectLocation is LOCATION_COORDINATES', async () => {
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

  it('renders InputNumber for longitude when projectLocation is LOCATION_COORDINATES', async () => {
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
});

describe('required fields with asterisks', () => {
  it('displays asterisk in header for the required card', () => {
    const { wrapper } = mountLocationCard();

    const header = wrapper.find('h6');
    const spans = header.findAll('span');
    const asterisk = spans.find((span) => span.text() === '*');

    expect(asterisk).toBeTruthy();
  });

  it('latitude field is required when projectLocation is LOCATION_COORDINATES', async () => {
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

  it('longitude field is required when projectLocation is LOCATION_COORDINATES', async () => {
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
