import { mockReset } from 'vitest-mock-extended';

import {
  TEST_ACTIVITY_CONTACT_1,
  TEST_ACTIVITY_HOUSING,
  TEST_CONTACT_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_ENQUIRY_1,
  TEST_GROUP_1,
  TEST_GROUP_2_ADMIN,
  TEST_GROUP_3_SUPERVISOR,
  TEST_HOUSING_PROJECT_1,
  TEST_INITIATIVE_HOUSING
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { getTeamMemberEmailTemplateData, verifyPrimaryChange } from '../../../src/domains/activityContact.ts';
import * as projectDomain from '../../../src/domains/project.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon.ts';
import { Problem } from '../../../src/utils/index.ts';

import type { ActivityContact, CurrentAuthorization } from '../../../src/types/index.ts';

vi.mock('../../../src/domains/project.ts');
vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.pcns.navEmail') {
          return 'navigator@example.com';
        }
        return actual.get(key);
      }),
      has: vi.fn(() => false)
    }
  };
});

describe('activityContact domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('getTeamMemberEmailTemplateData', () => {
    it('should return template data with admin contact and project name', async () => {
      const mockProject = {
        ...TEST_HOUSING_PROJECT_1,
        projectName: 'Test Project',
        projectId: 'PROJ1234',
        activity: {
          ...TEST_ACTIVITY_HOUSING,
          initiative: TEST_INITIATIVE_HOUSING
        }
      };

      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue(mockProject as never);

      const contact = {
        ...TEST_CONTACT_1,
        firstName: 'Jane',
        lastName: 'Smith'
      };

      const result = await getTeamMemberEmailTemplateData(
        mockRepos,
        Initiative.HOUSING,
        TEST_CURRENT_CONTEXT.userId,
        'ACTI1234',
        contact
      );

      expect(result.templateParams).toBeDefined();
      expect(result.templateParams?.dearName).toBe('Jane Smith');
      expect(result.templateParams?.adminName).toBe('John Doe');
      expect(result.templateParams?.projectName).toBe('Test Project');
      expect(result.templateParams?.initiative).toBe(Initiative.HOUSING.toLowerCase());
      expect(result.templateParams?.projectId).toBe('PROJ1234');
      expect(result.navEmail).toBe('navigator@example.com');
    });

    it('should return template data without admin name when admin contact not found', async () => {
      const mockProject = {
        ...TEST_HOUSING_PROJECT_1,
        projectName: 'Test Project',
        projectId: 'PROJ1234',
        activity: {
          ...TEST_ACTIVITY_HOUSING,
          initiative: TEST_INITIATIVE_HOUSING
        }
      };

      mockRepos.contact.search.mockResolvedValueOnce([] as never);
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue(mockProject as never);

      const result = await getTeamMemberEmailTemplateData(
        mockRepos,
        Initiative.HOUSING,
        TEST_CURRENT_CONTEXT.userId,
        'ACTI1234',
        TEST_CONTACT_1
      );

      expect(result.templateParams?.adminName).toBeUndefined();
    });

    it('should handle undefined userId and skip admin contact search', async () => {
      const mockProject = {
        ...TEST_HOUSING_PROJECT_1,
        projectName: 'Test Project',
        projectId: 'PROJ1234',
        activity: {
          ...TEST_ACTIVITY_HOUSING,
          initiative: TEST_INITIATIVE_HOUSING
        }
      };

      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue(mockProject as never);

      await getTeamMemberEmailTemplateData(mockRepos, Initiative.HOUSING, undefined, 'ACTI1234', TEST_CONTACT_1);

      expect(mockRepos.contact.search).not.toHaveBeenCalled();
    });

    it('should fall back to enquiry search when getProjectByActivityId fails', async () => {
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.enquiry.search.mockResolvedValueOnce([{ ...TEST_ENQUIRY_1, enquiryId: 'ENQ1234' }] as never);
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockRejectedValueOnce(new Error('Not found'));

      const result = await getTeamMemberEmailTemplateData(
        mockRepos,
        Initiative.HOUSING,
        TEST_CURRENT_CONTEXT.userId,
        'ACTI1234',
        TEST_CONTACT_1
      );

      expect(result.templateParams).toBeUndefined();
      expect(result.navEmail).toBeUndefined();
      expect(mockRepos.enquiry.search).toHaveBeenCalledWith({ activityId: ['ACTI1234'] }, Initiative.HOUSING);
    });

    it('should throw error when project not found and enquiry not found', async () => {
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.enquiry.search.mockResolvedValueOnce([] as never);
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockRejectedValueOnce(new Error('Activity not found'));

      await expect(
        getTeamMemberEmailTemplateData(
          mockRepos,
          Initiative.HOUSING,
          TEST_CURRENT_CONTEXT.userId,
          'ACTI1234',
          TEST_CONTACT_1
        )
      ).rejects.toThrow('Activity not found');
    });
  });

  describe('verifyPrimaryChange', () => {
    it('should allow primary contact to change primary role', async () => {
      const currentPrimaryContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.PRIMARY,
        contactId: TEST_CONTACT_1.contactId
      };

      mockRepos.activityContact.findMany.mockResolvedValueOnce([currentPrimaryContact] as never);
      mockRepos.activityContact.update.mockResolvedValueOnce({
        ...currentPrimaryContact,
        role: ActivityContactRole.ADMIN
      } as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const emptyAuth: CurrentAuthorization = { attributes: [], groups: [] };

      const result = await verifyPrimaryChange(mockRepos, 'ACTI1234', emptyAuth, TEST_CURRENT_CONTEXT);

      expect(result?.role).toBe(ActivityContactRole.ADMIN);
      expect(mockRepos.activityContact.update).toHaveBeenCalledWith(
        {
          activityId_contactId: {
            activityId: 'ACTI1234',
            contactId: TEST_CONTACT_1.contactId
          }
        },
        {
          role: ActivityContactRole.ADMIN
        }
      );
    });

    it('should allow navigator to change primary role', async () => {
      const otherPrimaryContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.PRIMARY,
        contactId: 'some-other-contact-id'
      };

      mockRepos.activityContact.findMany.mockResolvedValueOnce([otherPrimaryContact] as never);
      mockRepos.activityContact.update.mockResolvedValueOnce({
        ...otherPrimaryContact,
        role: ActivityContactRole.ADMIN
      } as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const result = await verifyPrimaryChange(
        mockRepos,
        'ACTI1234',
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT
      );

      expect(result).toBeDefined();
      expect(mockRepos.activityContact.update).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId_contactId: { activityId: 'ACTI1234', contactId: 'some-other-contact-id' }
        }),
        expect.any(Object)
      );
    });

    it('should allow user with scope:all to change primary role', async () => {
      const currentPrimaryContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.PRIMARY,
        contactId: 'contact-123'
      };

      mockRepos.activityContact.findMany.mockResolvedValueOnce([currentPrimaryContact] as never);
      mockRepos.activityContact.update.mockResolvedValueOnce({
        ...currentPrimaryContact,
        role: ActivityContactRole.ADMIN
      } as never);

      const scopeAllAuth: CurrentAuthorization = {
        ...TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        attributes: ['scope:all']
      };

      const result = await verifyPrimaryChange(mockRepos, 'ACTI1234', scopeAllAuth, TEST_CURRENT_CONTEXT);

      expect(result).toBeDefined();
      expect(mockRepos.contact.search).not.toHaveBeenCalled();
    });

    it('should throw error when non-primary, non-navigator user tries to change primary role', async () => {
      const otherPrimaryContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.PRIMARY,
        contactId: 'some-other-contact-id'
      };

      mockRepos.activityContact.findMany.mockResolvedValueOnce([otherPrimaryContact] as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const noAuthAuth: CurrentAuthorization = {
        attributes: [],
        groups: []
      };

      await expect(verifyPrimaryChange(mockRepos, 'ACTI1234', noAuthAuth, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        Problem
      );
    });

    it('should return undefined when no primary contact exists', async () => {
      const adminContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.ADMIN,
        contactId: 'some-other-contact-id'
      };

      mockRepos.activityContact.findMany.mockResolvedValueOnce([adminContact] as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const result = await verifyPrimaryChange(
        mockRepos,
        'ACTI1234',
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT
      );

      expect(result).toBeUndefined();
      expect(mockRepos.activityContact.update).not.toHaveBeenCalled();
    });

    it('should handle supervisor group authorization', async () => {
      const otherPrimaryContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.PRIMARY,
        contactId: 'some-other-contact-id'
      };

      mockRepos.activityContact.findMany.mockResolvedValueOnce([otherPrimaryContact] as never);
      mockRepos.activityContact.update.mockResolvedValueOnce({
        ...otherPrimaryContact,
        role: ActivityContactRole.ADMIN
      } as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const supervisorAuth: CurrentAuthorization = {
        attributes: [],
        groups: [TEST_GROUP_3_SUPERVISOR]
      };

      const result = await verifyPrimaryChange(mockRepos, 'ACTI1234', supervisorAuth, TEST_CURRENT_CONTEXT);

      expect(result).toBeDefined();
      expect(mockRepos.activityContact.update).toHaveBeenCalled();
    });

    it('should handle admin group authorization', async () => {
      const otherPrimaryContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.PRIMARY,
        contactId: 'some-other-contact-id'
      };

      mockRepos.activityContact.findMany.mockResolvedValueOnce([otherPrimaryContact] as never);
      mockRepos.activityContact.update.mockResolvedValueOnce({
        ...otherPrimaryContact,
        role: ActivityContactRole.ADMIN
      } as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const adminAuth: CurrentAuthorization = {
        attributes: [],
        groups: [TEST_GROUP_2_ADMIN]
      };

      const result = await verifyPrimaryChange(mockRepos, 'ACTI1234', adminAuth, TEST_CURRENT_CONTEXT);

      expect(result).toBeDefined();
    });

    it('should reject navigator from different initiative', async () => {
      const otherPrimaryContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.PRIMARY,
        contactId: 'some-other-contact-id'
      };

      mockRepos.activityContact.findMany.mockResolvedValueOnce([otherPrimaryContact] as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const differentInitiativeAuth: CurrentAuthorization = {
        attributes: [],
        groups: [{ ...TEST_GROUP_1, initiativeCode: Initiative.ELECTRIFICATION }]
      };

      await expect(
        verifyPrimaryChange(mockRepos, 'ACTI1234', differentInitiativeAuth, TEST_CURRENT_CONTEXT)
      ).rejects.toThrow(Problem);
    });
  });
});
