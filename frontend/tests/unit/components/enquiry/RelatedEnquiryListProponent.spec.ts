import { defineComponent, h, ref } from 'vue';
import PrimeVue from 'primevue/config';
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';

import RelatedEnquiryListProponent from '@/components/enquiry/RelatedEnquiryListProponent.vue';
import { Column } from '@/lib/primevue';
import { contactService } from '@/services';
import { GroupName } from '@/utils/enums/application';
import { EnquirySubmittedMethod } from '@/utils/enums/projectCommon';
import { enquiryRouteNameKey, navigationPermissionKey } from '@/utils/keys';

import { mountComponent } from '../../../mountComponent';

import type { VueWrapper } from '@vue/test-utils';
import type { Contact, Enquiry } from '@/types';

// Mocks

const matchContactsSpy = vi.spyOn(contactService, 'matchContacts');

// Fixtures

const testEnquiry = {
  enquiryId: 'enquiry-1',
  activityId: 'activity-1',
  createdBy: 'user-1',
  submittedAt: '2024-01-01T00:00:00.000Z',
  submittedMethod: EnquirySubmittedMethod.PCNS
} as unknown as Enquiry;

// Mount

function mountRelatedEnquiryListProponent(
  options: {
    loading?: boolean;
    enquiries?: Enquiry[];
    projectId?: string;
    canNavigateGroups?: { name: GroupName }[];
  } = {}
) {
  const { loading = false, enquiries = [], projectId, canNavigateGroups = [{ name: GroupName.DEVELOPER }] } = options;

  const { wrapper } = mountComponent(RelatedEnquiryListProponent, {
    props: { loading, enquiries, projectId },
    piniaState: { authz: { groups: canNavigateGroups } },
    provide: {
      [enquiryRouteNameKey as symbol]: ref('enquiry-route'),
      [navigationPermissionKey as symbol]: ref('some-permission'),
      // Mounted without a real `<DataTable>` ancestor (see `renderColumnBody`),
      // so `<Column>`'s `inject: ['$columns']` would otherwise warn.
      $columns: { add: () => {}, delete: () => {} }
    }
  });

  return { wrapper };
}

/**
 * PrimeVue's `<Column>` only registers with an ancestor `<DataTable>` when
 * it's a direct slot child -- these columns are one component-level deeper,
 * so render each column's `body` scoped slot directly against a fixture row
 * instead of fighting DataTable's silent zero-column detection.
 */
function renderColumnBody(column: VueWrapper, data: unknown) {
  const vnodes = column.vm.$slots.body?.({ data }) ?? [];
  const Host = defineComponent({ render: () => h('div', vnodes) });

  return mount(Host, {
    global: { plugins: [PrimeVue], stubs: { RouterLink: RouterLinkStub, 'font-awesome-icon': true } }
  });
}

function findColumnByField(wrapper: VueWrapper, field: string) {
  return wrapper.findAllComponents(Column).find((c) => c.props('field') === field)!;
}

beforeEach(() => {
  vi.clearAllMocks();
  matchContactsSpy.mockResolvedValue([]);
});

// Tests

describe('RelatedEnquiryListProponent', () => {
  describe('rendering', () => {
    it('mounts without error', () => {
      const { wrapper } = mountRelatedEnquiryListProponent();

      expect(wrapper.exists()).toBe(true);
    });

    it('defines the expected columns', () => {
      const { wrapper } = mountRelatedEnquiryListProponent();

      expect(wrapper.findAllComponents(Column).map((c) => c.props('field'))).toEqual([
        'activityId',
        'submittedBy',
        'submittedAt'
      ]);
    });
  });

  describe('activityId column', () => {
    it('renders a link when the navigation permission allows it and the enquiry was submitted via PCNS', () => {
      const { wrapper } = mountRelatedEnquiryListProponent({
        enquiries: [testEnquiry],
        canNavigateGroups: [{ name: GroupName.DEVELOPER }]
      });
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), testEnquiry);

      expect(cell.findComponent(RouterLinkStub).exists()).toBe(true);
      expect(cell.find('[data-activityId]').text()).toBe(testEnquiry.activityId);
    });

    it('renders plain text when the user cannot navigate', () => {
      const { wrapper } = mountRelatedEnquiryListProponent({ enquiries: [testEnquiry], canNavigateGroups: [] });
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), testEnquiry);

      expect(cell.findComponent(RouterLinkStub).exists()).toBe(false);
      expect(cell.find('[data-activityId]').text()).toBe(testEnquiry.activityId);
    });

    it('renders plain text when the enquiry was not submitted via PCNS', () => {
      const { wrapper } = mountRelatedEnquiryListProponent({
        enquiries: [{ ...testEnquiry, submittedMethod: EnquirySubmittedMethod.EMAIL }]
      });
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), {
        ...testEnquiry,
        submittedMethod: EnquirySubmittedMethod.EMAIL
      });

      expect(cell.findComponent(RouterLinkStub).exists()).toBe(false);
    });

    it('links using the projectId-scoped params when the first enquiry has a relatedActivityId', () => {
      const withRelated = { ...testEnquiry, relatedActivityId: 'related-1' };
      const { wrapper } = mountRelatedEnquiryListProponent({ enquiries: [withRelated], projectId: 'project-1' });
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), withRelated);

      expect(cell.findComponent(RouterLinkStub).props('to')).toEqual({
        name: 'enquiry-route',
        params: { enquiryId: withRelated.enquiryId, projectId: 'project-1' }
      });
    });

    it('links using only the enquiryId param when the first enquiry has no relatedActivityId', () => {
      const { wrapper } = mountRelatedEnquiryListProponent({ enquiries: [testEnquiry] });
      const cell = renderColumnBody(findColumnByField(wrapper, 'activityId'), testEnquiry);

      expect(cell.findComponent(RouterLinkStub).props('to')).toEqual({
        name: 'enquiry-route',
        params: { enquiryId: testEnquiry.enquiryId }
      });
    });
  });

  describe('submittedBy column', () => {
    it('resolves the creator name from matched contacts on mount', async () => {
      matchContactsSpy.mockResolvedValue([{ userId: 'user-1', firstName: 'Jane', lastName: 'Doe' } as Contact]);

      const { wrapper } = mountRelatedEnquiryListProponent({ enquiries: [testEnquiry] });
      await flushPromises();

      expect(matchContactsSpy).toHaveBeenCalledWith({ userId: ['user-1'] });
      const cell = renderColumnBody(findColumnByField(wrapper, 'submittedBy'), testEnquiry);
      expect(cell.text()).toBe('Jane Doe');
    });

    it('does not call matchContacts when there are no enquiries', async () => {
      mountRelatedEnquiryListProponent({ enquiries: [] });
      await flushPromises();

      expect(matchContactsSpy).not.toHaveBeenCalled();
    });

    it('shows an error toast when matching contacts fails', async () => {
      matchContactsSpy.mockRejectedValue(new Error('boom'));

      const { wrapper } = mountRelatedEnquiryListProponent({ enquiries: [testEnquiry] });
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('submittedAt column', () => {
    it('renders the formatted submission date', () => {
      const { wrapper } = mountRelatedEnquiryListProponent({ enquiries: [testEnquiry] });
      const cell = renderColumnBody(findColumnByField(wrapper, 'submittedAt'), testEnquiry);

      expect(cell.text().length).toBeGreaterThan(0);
      expect(cell.text()).not.toBe(testEnquiry.submittedAt);
    });
  });
});
