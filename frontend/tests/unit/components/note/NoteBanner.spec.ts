import { mount } from '@vue/test-utils';

import NoteBanner from '@/components/note/NoteBanner.vue';
import { StorageKey } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';

import type { Note } from '@/types';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

const currentDate = new Date().toISOString();

const testNote: Note = {
  noteId: '123e4567-e89b-12d3-a456-426614174000',
  note: 'This is a test note.',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedBy',
  updatedAt: currentDate
};

const wrapperSettings = (testNoteProp = testNote) => ({
  props: {
    note: testNoteProp
  },
  global: {
    plugins: [PrimeVue],
    stubs: ['font-awesome-icon'],
    directives: {
      Tooltip: Tooltip
    }
  }
});

describe('NoteBanner', () => {
  beforeEach(() => {
    sessionStorage.setItem(
      StorageKey.CONFIG,
      JSON.stringify({
        oidc: {
          authority: 'abc',
          clientId: '123'
        }
      })
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders component', async () => {
    const wrapper = mount(NoteBanner, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('displays note text', () => {
    const wrapper = mount(NoteBanner, wrapperSettings());
    expect(wrapper.text()).toContain(testNote.note);
  });
});
