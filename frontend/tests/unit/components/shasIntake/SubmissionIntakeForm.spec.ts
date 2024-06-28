import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { mount, RouterLinkStub } from '@vue/test-utils';

import SubmissionIntakeForm from '@/components/housing/submission/SubmissionIntakeForm.vue';
import { submissionIntakeSchema } from '@/components/housing/submission/SubmissionIntakeSchema';
import { permitService } from '@/services';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { BasicResponse, StorageKey } from '@/utils/enums/application';

import type { AxiosResponse } from 'axios';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/housing';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const usePermitService = vi.spyOn(permitService, 'getPermitTypes');

const testPermitData = [
  {
    permitTypeId: 1,
    agency: 'Water, Land and Resource Stewardship',
    division: 'Forest Resiliency and Archaeology',
    branch: 'Archaeology',
    businessDomain: 'Archaeology',
    type: 'Alteration',
    family: null,
    name: 'Site Alteration Permit',
    nameSubtype: null,
    acronym: 'SAP',
    trackedInATS: false,
    sourceSystem: 'Archaeology Permit Tracking System',
    sourceSystemAcronym: 'APTS'
  },
  {
    permitTypeId: 2,
    agency: 'Water, Land and Resource Stewardship',
    division: 'Forest Resiliency and Archaeology',
    branch: 'Archaeology',
    businessDomain: 'Archaeology',
    type: 'Inspection',
    family: null,
    name: 'Heritage Inspection Permit',
    nameSubtype: null,
    acronym: 'HIP',
    trackedInATS: false,
    sourceSystem: 'Archaeology Permit Tracking System',
    sourceSystemAcronym: 'APTS'
  },
  {
    permitTypeId: 3,
    agency: 'Water, Land and Resource Stewardship',
    division: 'Forest Resiliency and Archaeology',
    branch: 'Archaeology',
    businessDomain: 'Archaeology',
    type: 'Investigation',
    family: null,
    name: 'Investigation Permit',
    nameSubtype: null,
    acronym: null,
    trackedInATS: false,
    sourceSystem: 'Archaeology Permit Tracking System',
    sourceSystemAcronym: 'APTS'
  }
];

const wrapperSettings = () => ({
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
    stubs: {
      RouterLink: RouterLinkStub,
      'font-awesome-icon': true,
      Map: true,
      SubmissionAssistance: true
    },
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

  usePermitService.mockResolvedValue({ data: testPermitData } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('SubmissionIntakeForm', () => {
  it('renders component', async () => {
    const wrapper = mount(SubmissionIntakeForm, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('checks submit btn disabled conditions', async () => {
    const wrapper = mount(SubmissionIntakeForm, wrapperSettings());

    const submitButton = wrapper.find('[type="submit"]');
    expect(submitButton.attributes('disabled')).toBeDefined();
  });

  it('checks categories for valid data', async () => {
    const applicantTest = submissionIntakeSchema.validateAt('applicant', {
      applicant: {
        contactFirstName: 'testcontactFirstName',
        contactLastName: 'testcontactLastName',
        contactPhoneNumber: '2501234567',
        contactEmail: 'test@test.com',
        contactApplicantRelationship: ProjectRelationship.AGENT,
        contactPreference: ContactPreference.PHONE_CALL
      }
    });

    const basicTest = submissionIntakeSchema.validateAt('basic', {
      basic: {
        isDevelopedByCompanyOrOrg: BasicResponse.NO,
        isDevelopedInBC: BasicResponse.NO,
        registeredName: 'testString3'
      }
    });

    const housingTest = submissionIntakeSchema.validateAt('housing', {
      housing: {
        projectName: 'testString1',
        projectDescription: 'testString2',
        hasRentalUnits: 'Yes',
        financiallySupportedBC: 'No',
        financiallySupportedIndigenous: 'No',
        financiallySupportedNonProfit: 'No',
        financiallySupportedHousingCoop: 'No',
        rentalUnits: NUM_RESIDENTIAL_UNITS_LIST[0],
        indigenousDescription: 'No',
        nonProfitDescription: 'No',
        housingCoopDescription: 'No',
        singleFamilySelected: true,
        singleFamilyUnits: NUM_RESIDENTIAL_UNITS_LIST[0],
        multiFamilyUnits: 'No',
        otherUnitsDescription: 'No',
        otherUnits: 'No'
      }
    });

    const locationTest = submissionIntakeSchema.validateAt('location', {
      location: {
        naturalDisaster: 'Yes',
        projectLocation: 'testString1',
        streetAddress: 'testString2',
        locality: 'testString3',
        province: 'testString4',
        latitude: '51',
        longitude: '-139',
        ltsaPIDLookup: '',
        geomarkUrl: ''
      }
    });

    const permitsTest = submissionIntakeSchema.validateAt('permits', {
      permits: {
        hasAppliedProvincialPermits: BasicResponse.NO,
        checkProvincialPermits: 'testString2'
      }
    });

    const appliedPermitsTest = submissionIntakeSchema.validateAt('appliedPermits', {
      appliedPermits: [
        {
          permitTypeId: 1,
          statusLastVerified: new Date(),
          trackingId: 'testString'
        }
      ]
    });

    await expect(applicantTest).resolves.toBeTruthy();
    await expect(basicTest).resolves.toBeTruthy();
    await expect(housingTest).resolves.toBeTruthy();
    await expect(locationTest).resolves.toBeTruthy();
    await expect(permitsTest).resolves.toBeTruthy();
    await expect(appliedPermitsTest).resolves.toBeTruthy();
  });

  it('checks categories for successful fail', async () => {
    const applicantTestFail = submissionIntakeSchema.validateAt('applicant', {
      applicant: {
        contactFirstName: '',
        contactLastName: 'testcontactLastName',
        contactPhoneNumber: '2501234567',
        contactEmail: 'test@test.com',
        contactApplicantRelationship: ProjectRelationship.AGENT,
        contactPreference: ContactPreference.PHONE_CALL
      }
    });

    const basicTestFail = submissionIntakeSchema.validateAt('basic', {
      basic: {
        isDevelopedByCompanyOrOrg: 'testString1',
        isDevelopedInBC: 'testString2',
        registeredName: 'testString3'
      }
    });

    const housingTestFail = submissionIntakeSchema.validateAt('housing', {
      housing: {
        projectName: 'testString1',
        projectDescription: 'testString2',
        hasRentalUnits: 'wrongRentalUnit',
        financiallySupportedBC: 'No',
        financiallySupportedIndigenous: 'No',
        financiallySupportedNonProfit: 'No',
        financiallySupportedHousingCoop: 'No',
        rentalUnits: 'No',
        indigenousDescription: 'No',
        nonProfitDescription: 'No',
        housingCoopDescription: 'No',
        singleFamilyUnits: 'No',
        multiFamilyUnits: 'No',
        otherUnitsDescription: 'No',
        otherUnits: 'No'
      }
    });

    const locationTestFail = submissionIntakeSchema.validateAt('location', {
      location: {
        projectLocation: '',
        streetAddress: 'testString2',
        locality: 'testString3',
        province: 'testString4',
        latitude: '12',
        longitude: '-139',
        ltsaPIDLookup: '',
        geomarkUrl: ''
      }
    });

    const permitsTestFail = submissionIntakeSchema.validateAt('permits', {
      permits: {
        hasAppliedProvincialPermits: BasicResponse.YES,
        checkProvincialPermits: 'testString2'
      }
    });

    const appliedPermitsTestFail = submissionIntakeSchema.validateAt('appliedPermits', {
      appliedPermits: [
        {
          permitTypeId: '',
          statusLastVerified: new Date(),
          trackingId: 'testString'
        }
      ]
    });

    await expect(applicantTestFail).rejects.toThrowError();
    await expect(basicTestFail).rejects.toThrowError();
    await expect(housingTestFail).rejects.toThrowError();
    await expect(locationTestFail).rejects.toThrowError();
    await expect(permitsTestFail).rejects.toThrowError();
    await expect(appliedPermitsTestFail).rejects.toThrowError();
  });
});
