import PrimeVue from 'primevue/config';

import { shallowMount } from '@vue/test-utils';
import ContactCard from '@/components/form/common/ContactCard.vue';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/housing';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const wrapperSettings = () => ({
  props: {
    initialFormValues: {
      contacts: {
        contactFirstName: 'Test',
        contactLastName: 'Test',
        contactPhoneNumber: 'Test',
        contactEmail: 'Test',
        contactApplicantRelationship: ProjectRelationship.OWNER,
        contactPreference: ContactPreference.EITHER
      }
    }
  },
  global: {
    plugins: [PrimeVue],
    stubs: ['font-awesome-icon']
  }
});

describe('ContactCard.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(ContactCard, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
