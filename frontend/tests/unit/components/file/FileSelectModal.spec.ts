import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import FileSelectModal from '@/components/file/FileSelectModal.vue';
import { userService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import type { AxiosResponse } from 'axios';
import type { Document } from '@/types';

const useUserService = vi.spyOn(userService, 'searchUsers');

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const currentDate = new Date().toISOString();

const testDocument: Array<Document> = [
  {
    createdBy: 'testCreatedBy',
    createdAt: currentDate,
    updatedBy: 'testUpdatedAt',
    updatedAt: currentDate,
    documentId: 'documentUUID', // Primary Key
    activityId: 'activityUUID',
    filename: 'test file name',
    mimeType: 'test mime type',
    filesize: 123,
    createdByFullName: 'test user'
  }
];

const wrapperSettings = (testDocumentProp = testDocument) => ({
  props: {
    documents: testDocumentProp
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: {
              user: {}
            }
          }
        }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: ['font-awesome-icon']
  }
});

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

  useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('DocumentCard', () => {
  it('renders component', async () => {
    const wrapper = mount(FileSelectModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
