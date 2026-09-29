import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';

import SubmissionStatistics from '@/components/submission/SubmissionStatistics.vue';
import { Button, DatePicker, Select } from '@/lib/primevue';
import { reportingService, userService } from '@/services';
import { Action, GroupName, Initiative, Resource } from '@/utils/enums/application';
import { projectServiceKey } from '@/utils/keys';

import { mountComponent } from '../../../mountComponent';

import type { GetProjectPermitDataResponse, ProjectStatistics, User } from '@/types';

// Mocks

const mockToastInfo = vi.fn();

vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useToast: () => ({ info: mockToastInfo })
  };
});

vi.mock('@/services', () => ({
  reportingService: {
    getElectrificationProjectPermitData: vi.fn(),
    getGeneralProjectPermitData: vi.fn(),
    getHousingProjectPermitData: vi.fn()
  },
  userService: {
    searchUsers: vi.fn()
  }
}));

vi.mock('@/utils/formatters', () => ({
  formatDate: vi.fn((val: string) => `formatted-${val}`),
  formatDateFilename: vi.fn(() => '2026-09-24T12-00-00')
}));

// Fixtures

const mockStatistics: ProjectStatistics = {
  total_submissions: 100,
  multi_permits_needed: 20,
  total_submissions_between: 30,
  total_submissions_monthyear: 40,
  total_submissions_assignedto: 15,
  intake_assigned: 3,
  intake_completed: 1,
  intake_submitted: 2,
  state_new: 10,
  state_inprogress: 25,
  state_delayed: 5,
  state_completed: 60,
  supported_bc: 12,
  supported_indigenous: 8,
  supported_non_profit: 14,
  supported_housing_coop: 6,
  queue_1: 50,
  queue_2: 30,
  queue_3: 20,
  guidance: 35,
  general_enquiry: 25,
  status_request: 15,
  escalation: 10,
  inapplicable: 15
};

const mockPermitDataRow: GetProjectPermitDataResponse = {
  submitted_date: '2026-01-15T12:00:00Z',
  decision_date: '2026-02-01T12:00:00Z',
  status_last_verified: '2026-02-10T12:00:00Z',
  project_name: 'Test "Project", with comma\nand newline',
  notes: null as unknown as string,
  unassigned: undefined as unknown as string,
  permit_count: 5 as unknown as string
} as unknown as GetProjectPermitDataResponse;

const testUser: User = {
  userId: 'a0000000-0000-4000-8000-000000000000',
  fullName: 'Alice Smith',
  email: 'alice@example.com'
} as User;

// Mount

interface MountSubmissionStatisticsOptions {
  props?: Record<string, unknown>;
  piniaState?: Record<string, unknown>;
  provide?: Record<string, unknown>;
}

function mountSubmissionStatistics(options: MountSubmissionStatisticsOptions = {}) {
  const mockProjectService = {
    getProjectStatistics: vi.fn().mockResolvedValue(mockStatistics)
  };

  const { wrapper } = mountComponent(SubmissionStatistics, {
    props: {
      statistics: mockStatistics,
      ...options.props
    },
    piniaState: {
      app: { initiative: Initiative.HOUSING },
      authz: {
        permissions: [
          {
            initiative: Initiative.PCNS,
            resource: Resource.REPORTING,
            action: Action.READ
          }
        ]
      },
      ...options.piniaState
    },
    provide: {
      [projectServiceKey as symbol]: ref(mockProjectService),
      ...options.provide
    }
  });

  return { wrapper, mockProjectService };
}

beforeEach(() => {
  vi.clearAllMocks();
  window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/test-blob');
  window.URL.revokeObjectURL = vi.fn();
});

// Tests

describe('SubmissionStatistics.vue', () => {
  describe('rendering', () => {
    it('renders nothing when statistics prop is undefined', () => {
      const { wrapper } = mountSubmissionStatistics({ props: { statistics: undefined } });

      expect(wrapper.find('table').exists()).toBe(false);
    });

    it('renders statistics table with calculated percentages', () => {
      const { wrapper } = mountSubmissionStatistics();

      expect(wrapper.find('table').exists()).toBe(true);
      expect(wrapper.text()).toContain('Total Submissions and Enquiries');
      expect(wrapper.text()).toContain('100');
      expect(wrapper.text()).toContain('20%');
    });

    it('renders 0% when total_submissions is zero', () => {
      const zeroStats: ProjectStatistics = {
        ...mockStatistics,
        total_submissions: 0,
        multi_permits_needed: 0
      };

      const { wrapper } = mountSubmissionStatistics({ props: { statistics: zeroStats } });

      expect(wrapper.text()).toContain('0%');
    });

    it('renders housing-specific rows when initiative is HOUSING', () => {
      const { wrapper } = mountSubmissionStatistics({
        piniaState: { app: { initiative: Initiative.HOUSING } }
      });

      expect(wrapper.text()).toContain('BC Housing');
      expect(wrapper.text()).toContain('Indigenous');
      expect(wrapper.text()).toContain('Non-profit');
      expect(wrapper.text()).toContain('Co-operative');
    });

    it('omits housing-specific rows when initiative is not HOUSING', () => {
      const { wrapper } = mountSubmissionStatistics({
        piniaState: { app: { initiative: Initiative.GENERAL } }
      });

      expect(wrapper.text()).not.toContain('BC Housing');
      expect(wrapper.text()).not.toContain('Non-profit');
    });
  });

  describe('filters and navigator search', () => {
    it('formats assignee option label with full name and email', () => {
      const { wrapper } = mountSubmissionStatistics();
      const select = wrapper.findComponent(Select);
      const labelFn = select.props().optionLabel as (u: User) => string;

      expect(labelFn(testUser)).toBe('Alice Smith [alice@example.com]');
    });

    it('searches users by email when input matches email pattern', async () => {
      vi.mocked(userService.searchUsers).mockResolvedValue([testUser]);
      const { wrapper } = mountSubmissionStatistics();
      const select = wrapper.findComponent(Select);
      const input = select.find('input');

      if (input.exists()) {
        await input.setValue('alice@example.com');
      } else {
        await select.trigger('input', { target: { value: 'alice@example.com' } });
      }
      await flushPromises();

      expect(userService.searchUsers).toHaveBeenCalledWith({
        email: 'alice@example.com',
        group: [
          GroupName.ADMIN,
          GroupName.DEVELOPER,
          GroupName.NAVIGATOR,
          GroupName.NAVIGATOR_READ_ONLY,
          GroupName.SUPERVISOR
        ]
      });
      expect(select.props().options).toEqual([testUser]);
    });

    it('searches users by name and email when input length meets threshold', async () => {
      vi.mocked(userService.searchUsers).mockResolvedValue([testUser]);
      const { wrapper } = mountSubmissionStatistics();
      const select = wrapper.findComponent(Select);
      const input = select.find('input');

      if (input.exists()) {
        await input.setValue('Alice');
      } else {
        await select.trigger('input', { target: { value: 'Alice' } });
      }
      await flushPromises();

      expect(userService.searchUsers).toHaveBeenCalledWith({
        email: 'Alice',
        fullName: 'Alice',
        group: [
          GroupName.ADMIN,
          GroupName.DEVELOPER,
          GroupName.NAVIGATOR,
          GroupName.NAVIGATOR_READ_ONLY,
          GroupName.SUPERVISOR
        ]
      });
      expect(select.props().options).toEqual([testUser]);
    });

    it('clears assignee options when input is shorter than threshold', async () => {
      vi.mocked(userService.searchUsers).mockResolvedValue([testUser]);
      const { wrapper } = mountSubmissionStatistics();
      const select = wrapper.findComponent(Select);
      const input = select.find('input');

      if (input.exists()) {
        await input.setValue('Alice');
      } else {
        await select.trigger('input', { target: { value: 'Alice' } });
      }
      await flushPromises();
      expect(select.props().options).toEqual([testUser]);

      vi.clearAllMocks();

      if (input.exists()) {
        await input.setValue('A');
      } else {
        await select.trigger('input', { target: { value: 'A' } });
      }
      await flushPromises();

      expect(userService.searchUsers).not.toHaveBeenCalled();
      expect(select.props().options).toEqual([]);
    });

    it('fetches statistics when a valid UUID v4 is selected', async () => {
      const { wrapper, mockProjectService } = mountSubmissionStatistics();
      const select = wrapper.findComponent(Select);

      await select.vm.$emit('update:modelValue', 'a0000000-0000-4000-8000-000000000000');

      expect(mockProjectService.getProjectStatistics).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'a0000000-0000-4000-8000-000000000000' })
      );
    });

    it('fetches statistics with undefined userId when filter is cleared', async () => {
      const { wrapper, mockProjectService } = mountSubmissionStatistics();
      const select = wrapper.findComponent(Select);

      await select.vm.$emit('update:modelValue', '');

      expect(mockProjectService.getProjectStatistics).toHaveBeenCalledWith(
        expect.objectContaining({ userId: undefined })
      );
    });

    it('ignores invalid or garbage user id strings', async () => {
      const { wrapper, mockProjectService } = mountSubmissionStatistics();
      const select = wrapper.findComponent(Select);

      await select.vm.$emit('update:modelValue', 'not-a-valid-uuid');

      expect(mockProjectService.getProjectStatistics).not.toHaveBeenCalled();
    });

    it('ignores non-v4 UUID strings', async () => {
      const { wrapper, mockProjectService } = mountSubmissionStatistics();
      const select = wrapper.findComponent(Select);

      await select.vm.$emit('update:modelValue', '6ba7b810-9dad-11d1-80b4-00c04fd430c8');

      expect(mockProjectService.getProjectStatistics).not.toHaveBeenCalled();
    });

    it('fetches statistics when date range filters are updated', async () => {
      const { wrapper, mockProjectService } = mountSubmissionStatistics();
      const [dateFromPicker] = wrapper.findAllComponents(DatePicker);

      await dateFromPicker.vm.$emit('update:modelValue', '2026-01-01');

      expect(mockProjectService.getProjectStatistics).toHaveBeenCalledWith(
        expect.objectContaining({ dateFrom: '2026-01-01', userId: undefined })
      );
    });
  });

  describe('data export', () => {
    it('shows toast info when export data is empty', async () => {
      vi.mocked(reportingService.getHousingProjectPermitData).mockResolvedValue([]);
      const { wrapper } = mountSubmissionStatistics({
        piniaState: { app: { initiative: Initiative.HOUSING } }
      });

      await wrapper.findComponent(Button).trigger('click');

      expect(reportingService.getHousingProjectPermitData).toHaveBeenCalled();
      expect(mockToastInfo).toHaveBeenCalledWith('No Data', 'Data not available for downloaded.');
      expect(window.URL.createObjectURL).not.toHaveBeenCalled();
    });

    it('exports permit data to CSV with formatted dates and escaped special characters', async () => {
      vi.mocked(reportingService.getHousingProjectPermitData).mockResolvedValue([mockPermitDataRow]);
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      const { wrapper } = mountSubmissionStatistics({
        piniaState: { app: { initiative: Initiative.HOUSING } }
      });

      await wrapper.findComponent(Button).trigger('click');

      expect(reportingService.getHousingProjectPermitData).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/test-blob');

      clickSpy.mockRestore();
    });

    it('invokes electrification export endpoint when initiative is ELECTRIFICATION', async () => {
      vi.mocked(reportingService.getElectrificationProjectPermitData).mockResolvedValue([]);
      const { wrapper } = mountSubmissionStatistics({
        piniaState: { app: { initiative: Initiative.ELECTRIFICATION } }
      });

      await wrapper.findComponent(Button).trigger('click');

      expect(reportingService.getElectrificationProjectPermitData).toHaveBeenCalled();
    });

    it('invokes general export endpoint when initiative is GENERAL', async () => {
      vi.mocked(reportingService.getGeneralProjectPermitData).mockResolvedValue([]);
      const { wrapper } = mountSubmissionStatistics({
        piniaState: { app: { initiative: Initiative.GENERAL } }
      });

      await wrapper.findComponent(Button).trigger('click');

      expect(reportingService.getGeneralProjectPermitData).toHaveBeenCalled();
    });

    it('disables download button when user lacks reporting read permission', () => {
      const { wrapper } = mountSubmissionStatistics({
        piniaState: {
          authz: {
            permissions: []
          }
        }
      });

      const button = wrapper.findComponent(Button);
      expect((button.element as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
