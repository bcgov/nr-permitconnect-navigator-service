import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import DocumentCard from '@/components/file/DocumentCard.vue';
import { userService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

import type { AxiosResponse } from 'axios';
import type { Document } from '@/types';

const useUserService = vi.spyOn(userService, 'searchUsers');

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const currentDate = new Date().toISOString();

const testDocument: Document = {
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
};

const wrapperSettings = (testDocumentProp = testDocument) => ({
  props: {
    document: testDocumentProp
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
    stubs: ['font-awesome-icon'],
    directives: {
      Tooltip: Tooltip
    }
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
    const wrapper = mount(DocumentCard, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
