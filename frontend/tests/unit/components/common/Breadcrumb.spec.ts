import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';

import Breadcrumb from '@/components/common/Breadcrumb.vue';
import { useEnquiryStore } from '@/store/enquiryStore';
import { useProjectStore } from '@/store/projectStore';
import { usePermitStore } from '@/store/permitStore';
import { ApplicationStatus, EnquirySubmittedMethod } from '@/utils/enums/projectCommon';

import type { Enquiry, HousingProject, Permit, PermitType } from '@/types';
import { RouteName } from '@/utils/enums/application';

let mockRoute: any = {};
const currentDate = new Date().toISOString();

const exampleContact = {
  contactId: 'contact123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890'
};

const testEnquiry: Enquiry = {
  enquiryId: '789',
  activityId: '789',
  submissionType: 'General Inquiry',
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  intakeStatus: 'Pending',
  enquiryStatus: ApplicationStatus.NEW,
  submittedMethod: EnquirySubmittedMethod.PCNS,
  contacts: [exampleContact],
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  addedToAts: false,
  atsClientId: 123456,
  atsEnquiryId: '654321'
};

const testProject: HousingProject = {
  activityId: 'activity456',
  housingProjectId: '456',
  projectId: '456',
  queuePriority: 1,
  submissionType: 'Type A',
  submittedAt: '2023-01-01T12:00:00Z',
  relatedEnquiries: 'enquiry123',
  hasRelatedEnquiry: true,
  companyNameRegistered: 'Example Company',
  consentToFeedback: true,
  isDevelopedInBc: 'Yes',
  projectName: 'Super Long Project Name',
  projectDescription: 'This is a test project description.',
  projectLocationDescription: 'Test location description.',
  singleFamilyUnits: '10',
  multiFamilyUnits: '20',
  multiPermitsNeeded: 'Yes',
  otherUnitsDescription: 'Other units description.',
  otherUnits: '5',
  hasRentalUnits: 'Yes',
  rentalUnits: '15',
  financiallySupportedBc: 'Yes',
  financiallySupportedIndigenous: 'Yes',
  indigenousDescription: 'Indigenous support description.',
  financiallySupportedNonProfit: 'Yes',
  nonProfitDescription: 'Non-profit support description.',
  financiallySupportedHousingCoop: 'Yes',
  housingCoopDescription: 'Housing coop support description.',
  streetAddress: '123 Main St',
  locality: 'Anytown',
  province: 'BC',
  locationPids: '123456789',
  latitude: 49.2827,
  longitude: -123.1207,
  geomarkUrl: 'http://example.com/geomark',
  naturalDisaster: false,
  addedToAts: true,
  atsClientId: 654321,
  atsEnquiryId: '654321',
  ltsaCompleted: true,
  bcOnlineCompleted: true,
  aaiUpdated: true,
  astNotes: 'AST notes.',
  intakeStatus: 'Pending',
  applicationStatus: ApplicationStatus.COMPLETED,
  contacts: [exampleContact],
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const testPermitType: PermitType = {
  permitTypeId: 1,
  agency: 'Water, Land and Resource Stewardship',
  division: 'Forest Resiliency and Archaeology',
  branch: 'Archaeology',
  businessDomain: 'Archaeology',
  type: 'Alteration',
  family: undefined,
  name: 'Archaeology Alteration Permit',
  nameSubtype: undefined,
  acronym: 'SAP',
  trackedInATS: false,
  sourceSystem: 'Archaeology Permit Tracking System',
  sourceSystemAcronym: 'APTS'
};

const testPermit: Permit = {
  permitId: '123',
  activityId: 'activityUUID',
  needed: 'yes',
  status: 'status',
  issuedPermitId: 'issued Permit ID',
  authStatus: 'test auth status',
  submittedDate: currentDate,
  adjudicationDate: currentDate,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  permitType: testPermitType,
  permitTypeId: testPermitType.permitTypeId,
  permitNote: [],
  permitTracking: []
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('Breadcrumb.vue', () => {
  const mountComponent = () => {
    return mount(Breadcrumb, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {}
          }),
          PrimeVue
        ],
        stubs: {
          'router-link': {
            template: '<a class="breadcrumb-link" :to="to"><slot /></a>',
            props: ['to']
          }
        },
        directives: {
          tooltip: {
            mounted(el, binding) {
              el.setAttribute('title', binding.value);
            }
          }
        }
      }
    });
  };

  beforeEach(() => {
    mockRoute = {};
  });

  test('does not render breadcrumb if less than 2 matched records', () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [{ meta: { breadcrumb: 'one' }, name: 'one', path: '/one' }]
    };

    const wrapper = mountComponent();

    expect(
      wrapper
        .html()
        .replace(/<!--.*?-->/g, '')
        .trim()
    ).toBe('');
  });

  test('renders static breadcrumbs correctly', () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        { meta: { breadcrumb: 'Static One' }, name: 'one', path: '/one' },
        { meta: { breadcrumb: 'Static Two' }, name: 'two', path: '/two' }
      ]
    };

    const wrapper = mountComponent();
    const links = wrapper.findAll('a.breadcrumb-link');
    const currentSpans = wrapper.findAll('span.breadcrumb-current');

    expect(links.length).toBe(1);
    expect(currentSpans.length).toBe(1);
    expect(links[0]!.text()).toBe('Static One');
    expect(currentSpans[0]!.text()).toBe('Static Two');
  });

  test('renders dynamic "project" breadcrumb as link with truncation (not last item)', async () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        { meta: { dynamicBreadcrumb: 'project' }, name: 'project', path: '/housing/project/456' },
        { meta: { breadcrumb: 'Details' }, name: 'details', path: '/housing/project/456/details' }
      ]
    };

    const wrapper = mountComponent();
    const projectStore = useProjectStore();
    projectStore.setProject(testProject);
    await nextTick();

    const links = wrapper.findAll('a.breadcrumb-link');
    const currentSpans = wrapper.findAll('span.breadcrumb-current');

    expect(links.length).toBe(1);
    expect(currentSpans.length).toBe(1);
    expect(links[0]!.text()).toBe(testProject.projectName.substring(0, 10) + '...');
    const tooltipEl = links[0]!.find('[title]');
    expect(tooltipEl.exists()).toBe(true);
    expect(tooltipEl.attributes('title')).toBe(testProject.projectName);
  });

  test('renders dynamic "project" breadcrumb (last item)', async () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        { meta: { breadcrumb: 'Submissions' }, name: 'submissions', path: '/housing' },
        { meta: { dynamicBreadcrumb: 'project' }, name: 'project', path: '/housing/project/456' }
      ]
    };

    const wrapper = mountComponent();
    const projectStore = useProjectStore();
    projectStore.setProject(testProject);
    await nextTick();

    const links = wrapper.findAll('a.breadcrumb-link');
    const currentSpans = wrapper.findAll('span.breadcrumb-current');

    expect(links.length).toBe(1);
    expect(currentSpans.length).toBe(1);
    expect(currentSpans[0]!.text()).toBe(testProject.projectName);
  });

  test('renders "...Loading" when store is not set', () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        { meta: { dynamicBreadcrumb: 'project' }, name: 'project', path: '/housing/project/456' },
        { meta: { breadcrumb: 'Last' }, name: 'last', path: '/last' }
      ]
    };

    const wrapper = mountComponent();
    const links = wrapper.findAll('a.breadcrumb-link');
    const currentSpans = wrapper.findAll('span.breadcrumb-current');

    expect(links.length).toBe(1);
    expect(currentSpans.length).toBe(1);
    expect(links[0]!.text()).toBe('...Loading');
  });

  test('renders dynamic "enquiry" breadcrumb (last item)', async () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        { meta: { dynamicBreadcrumb: 'project' }, name: 'project', path: '/housing/project/456' },
        { meta: { dynamicBreadcrumb: 'enquiry' }, name: 'enquiry', path: '/housing/project/456/enquiry/789' }
      ]
    };

    const wrapper = mountComponent();
    const enquiryStore = useEnquiryStore();
    enquiryStore.setEnquiry(testEnquiry);
    await nextTick();

    const links = wrapper.findAll('a.breadcrumb-link');
    const currentSpans = wrapper.findAll('span.breadcrumb-current');

    expect(links.length).toBe(1);
    expect(currentSpans.length).toBe(1);
    expect(currentSpans[0]!.text()).toBe(`Enquiry ${testEnquiry.activityId}`);
  });

  test('renders dynamic "enquiry" breadcrumb as link with truncation (not last item)', async () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        { meta: { dynamicBreadcrumb: 'enquiry' }, name: 'enquiry', path: '/housing/enquiry/789' },
        { meta: { breadcrumb: 'Last' }, name: 'last', path: '/last' }
      ]
    };

    const wrapper = mountComponent();
    const enquiryStore = useEnquiryStore();
    enquiryStore.setEnquiry(testEnquiry);
    await nextTick();

    const links = wrapper.findAll('a.breadcrumb-link');
    const currentSpans = wrapper.findAll('span.breadcrumb-current');

    expect(links.length).toBe(1);
    expect(currentSpans.length).toBe(1);
    expect(links[0]!.text()).toBe(`Enquiry ${testEnquiry.activityId}`.substring(0, 10) + '...');
  });

  test('renders dynamic "authorization" breadcrumb (last item)', async () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        { meta: { dynamicBreadcrumb: 'project' }, name: 'project', path: '/housing/project/456' },
        { meta: { dynamicBreadcrumb: 'authorization' }, name: 'permit', path: '/housing/project/456/permit/123' }
      ]
    };

    const wrapper = mountComponent();
    const permitStore = usePermitStore();
    permitStore.setPermit(testPermit);
    await nextTick();

    const links = wrapper.findAll('a.breadcrumb-link');
    const currentSpans = wrapper.findAll('span.breadcrumb-current');
    expect(links.length).toBe(1);
    expect(currentSpans.length).toBe(1);
    expect(currentSpans[0]!.text()).toBe(testPermit.permitType.name);
  });

  test('renders dynamic "authorization" breadcrumb as link with truncation (not last item)', async () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        { meta: { dynamicBreadcrumb: 'authorization' }, name: 'authorization', path: '/housing/authorization/123' },
        { meta: { breadcrumb: 'Last' }, name: 'last', path: '/last' }
      ]
    };

    const wrapper = mountComponent();
    const permitStore = usePermitStore();
    permitStore.setPermit(testPermit);
    await nextTick();

    const links = wrapper.findAll('a.breadcrumb-link');
    const currentSpans = wrapper.findAll('span.breadcrumb-current');
    expect(links.length).toBe(1);
    expect(currentSpans.length).toBe(1);
    expect(links[0]!.text()).toBe(testPermit.permitType.name.substring(0, 10) + '...');
  });

  test('renders default dynamic breadcrumb with non defined dynamicBreadcrumb type', () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        { meta: { dynamicBreadcrumb: 'unknown' }, name: 'unknown', path: '/unknown' },
        { meta: { breadcrumb: 'Last' }, name: 'last', path: '/last' }
      ]
    };

    const wrapper = mountComponent();
    const links = wrapper.findAll('a.breadcrumb-link');
    expect(links[0]!.text()).toBe('Missing Label');
  });

  test('getRouteNameFromFirstChild returns child name through recursion', () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        {
          meta: { breadcrumb: 'Test' },
          name: undefined,
          children: [
            {
              name: undefined,
              children: [{ name: 'childRouteName' }]
            }
          ],
          path: '/test'
        },
        { meta: { breadcrumb: 'Last' }, name: 'last', path: '/last' }
      ]
    };

    const wrapper = mountComponent();
    const toObj = (wrapper.vm as any).breadcrumbItems[0].to;
    expect(toObj.name).toBe('childRouteName');
  });

  test('getRouteNameFromFirstChild returns RouteName.HOME when no child name found', () => {
    mockRoute = {
      meta: { hideBreadcrumb: false },
      matched: [
        {
          meta: { breadcrumb: 'Test' },
          name: undefined,
          children: [{}],
          path: '/test'
        },
        { meta: { breadcrumb: 'Last' }, name: 'last', path: '/last' }
      ]
    };

    const wrapper = mountComponent();
    const toObj = (wrapper.vm as any).breadcrumbItems[0].to;
    expect(toObj.name).toBe(RouteName.HOME);
  });

  test('returns empty breadcrumb array when route.meta.hideBreadcrumb is true', () => {
    mockRoute = {
      meta: { hideBreadcrumb: true },
      matched: [{ meta: { breadcrumb: 'Should not appear' }, name: 'test', path: '/test' }]
    };

    const wrapper = mountComponent();
    expect((wrapper.vm as any).breadcrumbItems).toEqual([]);
  });
});
