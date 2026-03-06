import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { nextTick } from 'vue';
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import ProjectIntakeForm from '@/components/housing/project/ProjectIntakeForm.vue';
import { createProjectIntakeSchema } from '@/validators/housing/projectIntakeFormSchema';
import { contactService, permitService } from '@/services';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { BasicResponse, StorageKey } from '@/utils/enums/application';
import { ProjectApplicant } from '@/utils/enums/projectCommon';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

import type { AxiosResponse } from 'axios';
import type { Contact } from '@/types';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  }),
  useRoute: () => ({
    params: {},
    query: {}
  }),
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn()
}));

const getPermitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');
const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');

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

const sampleContact: Contact = {
  contactId: '82fba7a8-9cb6-47c4-95b0-81c165e5a317',
  userId: 'd3245118-f4d6-429a-be8e-f13f049ade3a',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: ContactPreference.EITHER,
  contactApplicantRelationship: ProjectRelationship.CONSULTANT,
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
};
searchContactsSpy.mockResolvedValue({ data: [sampleContact] } as AxiosResponse);
const wrapperSettings = () => ({
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          auth: {
            user: {}
          }
        }
      }),
      i18n,
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

  getPermitTypesSpy.mockResolvedValue({ data: testPermitData } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('ProjectIntakeForm', () => {
  it('renders component', async () => {
    const wrapper = mount(ProjectIntakeForm, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  describe('onBeforeMount', () => {
    it('checks submit btn disabled conditions', async () => {
      const wrapper = mount(ProjectIntakeForm, wrapperSettings());
      await nextTick();
      await flushPromises();
      const submitButton = wrapper.find('[type="submit"]');
      expect(submitButton.attributes('disabled')).toBeDefined();
    });

    it('checks categories for valid data', async () => {
      // Contacts are kinda whack right now
      // const applicantTest = submissionIntakeSchema.validate(
      //   {
      //     contactFirstName: '',
      //     contactLastName: 'testLastName',
      //     contactPhoneNumber: '2501234567',
      //     contactEmail: 'test@test.com',
      //     contactApplicantRelationship: ProjectRelationship.OTHER,
      //     contactPreference: ContactPreference.PHONE_CALL
      //   }
      // );

      const basicTest = createProjectIntakeSchema([
        { registeredName: 'testString3', registeredId: 'FM0281610' }
      ]).validateAt('basic', {
        basic: {
          consentToFeedback: false,
          projectApplicantType: ProjectApplicant.BUSINESS,
          isDevelopedInBc: BasicResponse.NO,
          registeredId: 'FM0281610',
          registeredName: 'testString3',
          projectName: 'Project',
          projectDescription: 'Desc'
        }
      });

      const housingTest = createProjectIntakeSchema([]).validateAt('housing', {
        housing: {
          projectName: 'testString1',
          projectDescription: 'testString2',
          hasRentalUnits: 'Yes',
          financiallySupportedBc: 'No',
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

      const locationTest = createProjectIntakeSchema([]).validateAt('location', {
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

      const permitsTest = createProjectIntakeSchema([]).validateAt('permits', {
        permits: {
          appliedPermits: [
            {
              permitTypeId: 1,
              submittedDate: new Date(),
              trackingId: 'testString'
            }
          ],
          hasAppliedProvincialPermits: BasicResponse.YES
        }
      });

      //await expect(applicantTest).resolves.toBeTruthy();
      await expect(basicTest).resolves.toBeTruthy();
      await expect(housingTest).resolves.toBeTruthy();
      await expect(locationTest).resolves.toBeTruthy();
      await expect(permitsTest).resolves.toBeTruthy();
    });

    it('checks categories for successful fail', async () => {
      // Contacts are kinda whack right now
      // const applicantTestFail = submissionIntakeSchema.validate({
      //   contactFirstName: '',
      //   contactLastName: 'testcontactLastName',
      //   contactPhoneNumber: '2501234567',
      //   contactEmail: 'test@test.com',
      //   contactApplicantRelationship: ProjectRelationship.OTHER,
      //   contactPreference: ContactPreference.PHONE_CALL
      // });

      const basicTestFail = createProjectIntakeSchema([]).validateAt('basic', {
        basic: {
          projectApplicantType: 'testString1',
          isDevelopedInBC: 'testString2',
          registeredName: 'testString3'
        }
      });

      const housingTestFail = createProjectIntakeSchema([]).validateAt('housing', {
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

      const locationTestFail = createProjectIntakeSchema([]).validateAt('location', {
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

      const permitsTest = createProjectIntakeSchema([]).validateAt('permits', {
        permits: {
          appliedPermits: [
            {
              permitTypeId: '',
              submittedDate: new Date(),
              trackingId: 'testString'
            }
          ],
          hasAppliedProvincialPermits: 123
        }
      });

      //await expect(applicantTestFail).rejects.toThrowError();
      await expect(basicTestFail).rejects.toThrowError();
      await expect(housingTestFail).rejects.toThrowError();
      await expect(locationTestFail).rejects.toThrowError();
      await expect(permitsTest).rejects.toThrowError();
    });
  });
});
