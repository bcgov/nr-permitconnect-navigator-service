import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

import NotesModal from '@/components/permit/NotesModal.vue';
import { permitNoteService } from '@/services';
// import { permitNoteService, submissionService } from '@/services';
import { StorageKey } from '@/utils/enums/application';

import type { AxiosResponse } from 'axios';
import type { Permit, PermitNote, PermitType } from '@/types';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn((key: string) => key) // returns the key for simpler testing
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/services', async () => {
  const actual = await vi.importActual<object>('@/services');
  return {
    ...actual,
    submissionService: {
      emailConfirmation: vi.fn()
    },
    permitNoteService: {
      createPermitNote: vi.fn()
    }
  };
});

const currentDate = new Date().toISOString();

const testPermitType: PermitType = {
  permitTypeId: 1,
  agency: 'Mock Agency',
  division: 'Mock Division',
  branch: 'Mock Branch',
  businessDomain: 'Mock Domain',
  type: 'Mock Type',
  family: undefined,
  name: 'Mock Permit Name',
  nameSubtype: undefined,
  acronym: 'MPN',
  trackedInATS: false,
  sourceSystem: 'Mock Source System',
  sourceSystemAcronym: 'MSS'
};

const testPermitNote: PermitNote = {
  permitNoteId: 'noteUUID',
  permitId: 'permitUUID',
  note: 'Mock note',
  isDeleted: false
};

const testPermit: Permit = {
  permitId: 'permitUUID',
  permitTypeId: 1,
  activityId: 'activityUUID',
  needed: 'yes',
  status: 'SUBMITTED',
  issuedPermitId: 'issued Permit ID',
  trackingId: 'test tracking ID',
  authStatus: 'test auth status',
  submittedDate: currentDate,
  adjudicationDate: currentDate,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedBy',
  updatedAt: currentDate,
  permitType: testPermitType,
  permitNote: [testPermitNote]
};

const createPermitNoteSpy = vi.spyOn(permitNoteService, 'createPermitNote');
// const confirmationEmailSpy = vi.spyOn(submissionService, 'emailConfirmation');

const wrapperSettings = (permitProp = testPermit) => ({
  props: {
    permit: permitProp,
    visible: true
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            config: {
              getConfig: {
                ches: {
                  submission: {
                    cc: 'mock-ches-cc@example.com'
                  }
                }
              }
            },
            submission: {
              getSubmission: {
                activityId: 'activityUUID',
                submissionId: 999,
                contacts: [
                  {
                    email: 'testUser@example.com',
                    firstName: 'TestUserFirstName'
                  }
                ]
              },
              getPermits: [testPermit],
              updatePermit: vi.fn()
            }
          }
        }),
      PrimeVue,
      ToastService
    ],
    stubs: {
      'font-awesome-icon': true,
      Dialog: {
        template: `
          <div class="dialog-stub">
            <div class="header-stub">
              <slot name="header"></slot>
            </div>
            <div class="content-stub">
              <slot></slot>
            </div>
          </div>
        `
      },
      Form: {
        name: 'Form',
        template: `
          <form @submit.prevent="$emit('submit', $attrs.formData || {}, { resetForm: () => {} })"><slot /></form>
        `,
        emits: ['submit']
      },
      TextArea: {
        props: ['name'],
        template: `
          <div><textarea :name="name"></textarea></div>
        `
      }
    }
  }
});

describe('NotesModal', () => {
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
    const wrapper = mount(NotesModal, wrapperSettings());
    expect(wrapper.exists()).toBe(true);

    const header = wrapper.find('.p-dialog-title');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('permitNotesModal.title');
  });

  it('displays existing notes if present', async () => {
    const wrapper = mount(
      NotesModal,
      wrapperSettings({
        ...testPermit
      })
    );

    const updatesSection = wrapper.find('.updates-section');
    expect(updatesSection.text()).toContain('Mock note');
  });

  it('calls permitNoteService.createPermitNote when submitting a new note', async () => {
    createPermitNoteSpy.mockResolvedValue({
      data: {
        permitNoteId: 'noteUUID',
        permitId: testPermit.permitId,
        createdAt: currentDate,
        note: 'New Test Note'
      }
    } as AxiosResponse);

    const wrapper = mount(NotesModal, wrapperSettings());

    const formComponent = wrapper.findComponent({ name: 'Form' });
    await formComponent.vm.$emit('submit', { note: 'New Test Note' }, { resetForm: () => {} });

    expect(permitNoteService.createPermitNote).toHaveBeenCalledWith({
      permitId: 'permitUUID',
      note: 'New Test Note'
    });

    expect(wrapper.find('textarea').element.value).toBe('');
  });

  it('handles service error gracefully when creating new note', async () => {
    createPermitNoteSpy.mockRejectedValue(new Error('Fail'));

    const wrapper = mount(NotesModal, wrapperSettings());

    const formComponent = wrapper.findComponent({ name: 'Form' });
    await formComponent.vm.$emit('submit', { note: 'Will fail' }, { resetForm: () => {} });

    expect(permitNoteService.createPermitNote).toHaveBeenCalled();
  });
});
