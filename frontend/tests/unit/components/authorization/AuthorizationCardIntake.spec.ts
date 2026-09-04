import { InputText, Select } from '@/components/form';
import AuthorizationCardIntake from '@/components/authorization/AuthorizationCardIntake.vue';
import { sourceSystemKindService } from '@/services';
import { SYSTEM_ID } from '@/utils/constants/application';
import { i18n } from '@/i18n';

import { mountWithFormContext } from '../../../mountWithFormContext';
import { mockRouter, resetMockRouter } from '../../../mockRouter';

import type { SourceSystemKind } from '@/types';

// Mocks

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}));

// Fixtures

const sampleSourceSystemKind: SourceSystemKind = {
  description: 'ATS Project Number',
  kind: undefined,
  sourceSystem: 'ITSM-5314',
  sourceSystemKindId: 2,
  integrated: false,
  createdAt: '2025-06-18T15:56:00.515Z',
  createdBy: SYSTEM_ID,
  permitTypeIds: [26]
};

// Mount

const listSourceSystemKindsSpy = vi.spyOn(sourceSystemKindService, 'listSourceSystemKinds');

function mountAuthorizationCardIntake(options: { editable?: boolean } = {}) {
  const { wrapper } = mountWithFormContext(AuthorizationCardIntake, {
    componentProps: { sourceSystemKinds: [sampleSourceSystemKind], editable: options.editable ?? true },
    piniaState: {}
  });

  return { wrapper };
}

beforeEach(() => {
  resetMockRouter();
  vi.clearAllMocks();

  listSourceSystemKindsSpy.mockResolvedValue([sampleSourceSystemKind] as SourceSystemKind[]);
});

// Tests

describe('AuthorizationCardIntake', () => {
  describe('rendering', () => {
    it('renders a non-empty translated header', () => {
      const tSpy = vi.spyOn(i18n, 't');
      const { wrapper } = mountAuthorizationCardIntake();

      expect(tSpy).toHaveBeenCalledWith('authorization.authorizationCardIntake.authorizationTypeID');
      expect(wrapper.find('h3').text().trim().length).toBeGreaterThan(0);
    });

    it('renders InputText for issuedPermitId with correct name', () => {
      const { wrapper } = mountAuthorizationCardIntake();

      const inputTexts = wrapper.findAllComponents(InputText);
      const issuedPermitIdInput = inputTexts.find(
        (input: { props: (arg0: string) => string }) => input.props('name') === 'issuedPermitId'
      );

      expect(issuedPermitIdInput).toBeTruthy();
    });

    describe('mandatory fields', () => {
      describe('authorizationType', () => {
        it('renders with correct name', () => {
          const { wrapper } = mountAuthorizationCardIntake();

          const selects = wrapper.findAllComponents(Select);
          const authTypeSelect = selects.find(
            (select: { props: (arg0: string) => string }) => select.props('name') === 'authorizationType'
          );

          expect(authTypeSelect).toBeTruthy();
        });

        it('displays asterisk', () => {
          const { wrapper } = mountAuthorizationCardIntake();

          const labels = wrapper.findAll('label');
          const authTypeLabel = labels.find((label) => label.attributes('for') === 'authorizationType');
          const asterisk = authTypeLabel?.findAll('span')?.find((span) => span.text() === '*');

          expect(asterisk).toBeTruthy();
        });
      });
    });
  });
});
