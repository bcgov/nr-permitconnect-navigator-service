import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import { roadmapService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

// Consants
const PATH = 'roadmap';

const TEST_ADDRESS_STRING = ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca'];
const UNFORMATTED_EMAIL_LIST = 'test.1.address@test.bc.ca, testAddress2@test.com,; test3Email@test.ca';
const BCC_FIELD = 'addressTest2@test.com';

const TEST_DATA = {
  activityId: '123-123',
  emailData: {
    from: 'fromAddress@test.com',
    to: TEST_ADDRESS_STRING,
    bcc: [BCC_FIELD],
    subject: 'Here is your housing project Permit Roadmap',
    bodyType: 'text',
    body: 'testText'
  }
};

// Mocks
const putSpy = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  put: putSpy
} as any);

// Tests
beforeEach(() => {
  setActivePinia(createPinia());

  vi.clearAllMocks();
});

describe('roadmapService', () => {
  let appStore: StoreGeneric;

  describe.each([{ initiative: Initiative.ELECTRIFICATION }, { initiative: Initiative.HOUSING }])(
    '$initiative',
    ({ initiative }) => {
      beforeEach(() => {
        appStore = useAppStore();
        appStore.setInitiative(initiative);
      });

      it('sends email when called with right params', async () => {
        await roadmapService.send(TEST_DATA.activityId, ['testSelectedFileIds'], TEST_DATA.emailData);

        expect(putSpy).toHaveBeenCalledTimes(1);
        expect(putSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, {
          activityId: TEST_DATA.activityId,
          selectedFileIds: ['testSelectedFileIds'],
          emailData: expect.objectContaining({
            to: ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca'],
            bcc: [BCC_FIELD]
          })
        });
        expect(putSpy).not.toHaveBeenCalledWith(expect.objectContaining({ cc: expect.anything() }));
      });

      it('formats improper to/cc/bcc fields', async () => {
        const modifiedEmail = {
          ...TEST_DATA.emailData,
          to: UNFORMATTED_EMAIL_LIST,
          cc: UNFORMATTED_EMAIL_LIST,
          bcc: UNFORMATTED_EMAIL_LIST
        };

        // @ts-expect-error: testing if email object it not proper type
        await roadmapService.send(TEST_DATA.activityId, ['testSelectedFileIds'], modifiedEmail);

        expect(putSpy).toHaveBeenCalledTimes(1);
        expect(putSpy).toHaveBeenCalledWith(
          `${initiative.toLowerCase()}/${PATH}`,
          expect.objectContaining({
            emailData: expect.objectContaining({
              to: ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca'],
              cc: ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca'],
              bcc: ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca']
            })
          })
        );
      });
    }
  );
});
