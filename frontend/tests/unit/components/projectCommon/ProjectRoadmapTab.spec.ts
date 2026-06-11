import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createTestingPinia } from '@pinia/testing';
import { flushPromises, shallowMount } from '@vue/test-utils';

import ProjectRoadmapTab from '@/components/projectCommon/ProjectRoadmapTab.vue';
import i18n from '@/i18n';
import { roadmapService, userService } from '@/services';

vi.mock('@/services', () => ({
  roadmapService: { getRoadmapNote: vi.fn(), sendRoadmap: vi.fn() },
  userService: { listUsers: vi.fn() }
}));

describe('ProjectRoadmapTab.vue', () => {
  it('initializes BCC with multiple emails from config and assignee', async () => {
    vi.mocked(roadmapService.getRoadmapNote).mockResolvedValue('Roadmap note');
    vi.mocked(userService.listUsers).mockResolvedValue([
      {
        userId: 'user1',
        email: 'navigator@bcgov.bc.ca',
        firstName: 'Nav',
        lastName: 'User',
        fullName: 'Nav User',
        sub: 'idir-123',
        idp: 'idir',
        active: true,
        groups: [],
        elevatedRights: false,
        bceidBusinessName: ''
      }
    ]);

    const wrapper = shallowMount(ProjectRoadmapTab, {
      global: {
        plugins: [
          i18n,
          ConfirmationService,
          ToastService,
          createTestingPinia({
            initialState: {
              app: { initiative: 'Housing' },
              config: { config: { ches: { roadmap: { bcc: 'config1@bcgov.bc.ca; config2@bcgov.bc.ca' } } } },
              project: {
                project: { activityId: 'activity1', assignedUserId: 'user1' },
                activityContacts: [{ contactId: 'c1', activityId: 'activity1', contact: { email: 'user@test.com' } }],
                roadmapNote: 'Roadmap note'
              }
            }
          })
        ]
      }
    });

    await flushPromises();

    // Verify BCC field is initialized with config emails + assignee email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((wrapper.vm as any).initialFormValues.bcc).toEqual([
      'config1@bcgov.bc.ca',
      'config2@bcgov.bc.ca',
      'navigator@bcgov.bc.ca'
    ]);
  });
});
