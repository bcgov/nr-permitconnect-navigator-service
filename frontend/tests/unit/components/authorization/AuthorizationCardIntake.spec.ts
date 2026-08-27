import { mountWithFormContext } from '../../../mountWithFormContext';

import { InputText, Select } from '@/components/form';
import AuthorizationCardIntake from '@/components/authorization/AuthorizationCardIntake.vue';
import { sourceSystemKindService } from '@/services';
import { SYSTEM_ID } from '@/utils/constants/application';
import { StorageKey } from '@/utils/enums/application';

import type { SourceSystemKind } from '@/types';

const listSourceSystemKindsSpy = vi.spyOn(sourceSystemKindService, 'listSourceSystemKinds');

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

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  }),
  createI18n: vi.fn(() => ({
    global: {
      t: (key: string) => key
    },
    install: vi.fn()
  }))
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const wrapperSettings = (options: { editable?: boolean } = {}) => ({
  componentProps: {
    sourceSystemKinds: [sampleSourceSystemKind],
    editable: options.editable ?? true
  },
  piniaState: { auth: { user: {} } },
  stubs: ['font-awesome-icon']
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

  listSourceSystemKindsSpy.mockResolvedValue([sampleSourceSystemKind] as SourceSystemKind[]);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('AuthorizationCardIntake', () => {
  it('renders component', () => {
    const { wrapper } = mountWithFormContext(AuthorizationCardIntake, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('renders a non-empty translated header', () => {
    const { wrapper } = mountWithFormContext(AuthorizationCardIntake, wrapperSettings());

    expect(wrapper.find('h3').text().trim().length).toBeGreaterThan(0);
  });
});

describe('renders all mandatory fields', () => {
  it('renders Select for authorizationType with correct name', () => {
    const { wrapper } = mountWithFormContext(AuthorizationCardIntake, wrapperSettings());

    const selects = wrapper.findAllComponents(Select);
    const authTypeSelect = selects.find(
      (select: { props: (arg0: string) => string }) => select.props('name') === 'authorizationType'
    );

    expect(authTypeSelect).toBeTruthy();
  });

  it('renders InputText for issuedPermitId with correct name', () => {
    const { wrapper } = mountWithFormContext(AuthorizationCardIntake, wrapperSettings());

    const inputTexts = wrapper.findAllComponents(InputText);
    const issuedPermitIdInput = inputTexts.find(
      (input: { props: (arg0: string) => string }) => input.props('name') === 'issuedPermitId'
    );

    expect(issuedPermitIdInput).toBeTruthy();
  });
});

describe('required fields with asterisks', () => {
  it('displays asterisk for authorizationType field', () => {
    const { wrapper } = mountWithFormContext(AuthorizationCardIntake, wrapperSettings());

    const labels = wrapper.findAll('label');
    const authTypeLabel = labels.find((label) => label.attributes('for') === 'authorizationType');
    const asterisk = authTypeLabel?.findAll('span')?.find((span) => span.text() === '*');

    expect(asterisk).toBeTruthy();
  });
});
