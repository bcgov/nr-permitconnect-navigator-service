import { mockReset } from 'vitest-mock-extended';

import {
  TEST_ACTIVITY_CONTACT_1,
  TEST_CONTACT_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import * as activityContactDomain from '../../../src/domains/activityContact.ts';
import { email } from '../../../src/external/ches.ts';
import {
  createActivityContactService,
  deleteActivityContactService,
  listActivityContactsService,
  updateActivityContactService
} from '../../../src/services/activityContact.ts';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon.ts';
import Problem from '../../../src/utils/problem.ts';

import type { ActivityContact } from '../../../src/types/index.ts';

vi.mock('config');
vi.mock('../../../src/external/ches.ts', () => ({
  email: vi.fn()
}));

vi.mock('../../../src/utils/templates.ts', () => ({
  teamAdminAddedTemplate: vi.fn().mockReturnValue('<html>Admin Template</html>'),
  teamMemberAddedTemplate: vi.fn().mockReturnValue('<html>Member Template</html>'),
  teamMemberRevokedTemplate: vi.fn().mockReturnValue('<html>Revoked Template</html>'),
  teamPrimaryAddedTemplate: vi.fn().mockReturnValue('<html>Primary Template</html>')
}));

const verifyPrimaryChangeSpy = vi.spyOn(activityContactDomain, 'verifyPrimaryChange');
const getTeamMemberEmailTemplateDataSpy = vi.spyOn(activityContactDomain, 'getTeamMemberEmailTemplateData');

const TEMPLATE_PARAMS = {
  dearName: 'John Doe',
  adminName: undefined,
  projectName: 'Test Project',
  initiative: 'housing',
  projectId: 'project-123'
};

describe('activityContact service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createActivityContactService', () => {
    it('creates an activity contact and sends notification email', async () => {
      verifyPrimaryChangeSpy.mockResolvedValue(undefined);
      mockRepos.activityContact.create.mockResolvedValue(TEST_ACTIVITY_CONTACT_1);
      mockRepos.contact.findUniqueOrThrow.mockResolvedValue(TEST_CONTACT_1);
      getTeamMemberEmailTemplateDataSpy.mockResolvedValue({
        templateParams: TEMPLATE_PARAMS,
        navEmail: 'nav@example.com'
      });

      const result = await createActivityContactService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        TEST_ACTIVITY_CONTACT_1.activityId,
        TEST_CONTACT_1.contactId,
        ActivityContactRole.MEMBER
      );

      expect(mockRepos.activityContact.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.activityContact.create).toHaveBeenCalledWith({
        activityId: TEST_ACTIVITY_CONTACT_1.activityId,
        contactId: TEST_CONTACT_1.contactId,
        role: ActivityContactRole.MEMBER
      });
      expect(getTeamMemberEmailTemplateDataSpy).toHaveBeenCalledTimes(1);
      expect(email).toHaveBeenCalledTimes(1);
      expect(email).toHaveBeenCalledWith({
        to: [TEST_CONTACT_1.email],
        from: 'nav@example.com',
        subject: `You've been added to the project ${TEMPLATE_PARAMS.projectName} project in the Navigator Service`,
        bodyType: 'html',
        body: '<html>Member Template</html>'
      });
      expect(result).toEqual(TEST_ACTIVITY_CONTACT_1);
    });

    it('verifies primary change when creating PRIMARY role', async () => {
      verifyPrimaryChangeSpy.mockResolvedValue(undefined);
      mockRepos.activityContact.create.mockResolvedValue(undefined as never);
      mockRepos.contact.findUniqueOrThrow.mockResolvedValue(TEST_CONTACT_1);
      getTeamMemberEmailTemplateDataSpy.mockResolvedValue({
        templateParams: TEMPLATE_PARAMS,
        navEmail: 'nav@example.com'
      });

      await createActivityContactService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        TEST_ACTIVITY_CONTACT_1.activityId,
        TEST_CONTACT_1.contactId,
        ActivityContactRole.PRIMARY
      );

      expect(verifyPrimaryChangeSpy).toHaveBeenCalledTimes(1);
      expect(verifyPrimaryChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activityContact: mockRepos.activityContact,
          contact: mockRepos.contact
        }),
        TEST_ACTIVITY_CONTACT_1.activityId,
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT
      );
    });

    it('does not verify primary change for MEMBER role', async () => {
      mockRepos.activityContact.create.mockResolvedValue(undefined as never);
      mockRepos.contact.findUniqueOrThrow.mockResolvedValue(TEST_CONTACT_1);
      getTeamMemberEmailTemplateDataSpy.mockResolvedValue({
        templateParams: TEMPLATE_PARAMS,
        navEmail: 'nav@example.com'
      });

      await createActivityContactService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        TEST_ACTIVITY_CONTACT_1.activityId,
        TEST_CONTACT_1.contactId,
        ActivityContactRole.MEMBER
      );

      expect(verifyPrimaryChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('deleteActivityContactService', () => {
    it('throws 403 when trying to delete PRIMARY contact', async () => {
      const primaryContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.PRIMARY
      };

      mockRepos.activityContact.findFirstOrThrow.mockResolvedValue(primaryContact);

      await expect(
        deleteActivityContactService(TEST_CURRENT_CONTEXT, TEST_ACTIVITY_CONTACT_1.activityId, TEST_CONTACT_1.contactId)
      ).rejects.toThrow(new Problem(403, { detail: 'Cannot remove PRIMARY contact' }));
    });

    it('deletes a non-PRIMARY activity contact and sends notification', async () => {
      const memberContact: ActivityContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.MEMBER,
        contact: TEST_CONTACT_1
      };

      mockRepos.activityContact.findFirstOrThrow.mockResolvedValue(memberContact);
      mockRepos.activityContact.delete.mockResolvedValue(undefined as never);
      getTeamMemberEmailTemplateDataSpy.mockResolvedValue({
        templateParams: TEMPLATE_PARAMS,
        navEmail: 'nav@example.com'
      });

      await deleteActivityContactService(
        TEST_CURRENT_CONTEXT,
        TEST_ACTIVITY_CONTACT_1.activityId,
        TEST_CONTACT_1.contactId
      );

      expect(mockRepos.activityContact.delete).toHaveBeenCalledTimes(1);
      expect(mockRepos.activityContact.delete).toHaveBeenCalledWith(
        {
          activityId_contactId: {
            activityId: TEST_ACTIVITY_CONTACT_1.activityId,
            contactId: TEST_CONTACT_1.contactId
          }
        },
        { hard: true }
      );
      expect(email).toHaveBeenCalledTimes(1);
      expect(email).toHaveBeenCalledWith({
        to: [TEST_CONTACT_1.email],
        from: 'nav@example.com',
        subject: `You no longer have access to ${TEMPLATE_PARAMS.projectName} project in the Navigator Service`,
        bodyType: 'html',
        body: '<html>Revoked Template</html>'
      });
    });
  });

  describe('listActivityContactsService', () => {
    it('lists activity contacts for a given activity', async () => {
      const activityContacts = [TEST_ACTIVITY_CONTACT_1];

      mockRepos.activityContact.findMany.mockResolvedValue(activityContacts);

      const result = await listActivityContactsService(TEST_ACTIVITY_CONTACT_1.activityId);

      expect(mockRepos.activityContact.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.activityContact.findMany).toHaveBeenCalledWith({
        where: {
          activityId: TEST_ACTIVITY_CONTACT_1.activityId
        },
        include: { contact: true }
      });
      expect(result).toEqual(activityContacts);
    });
  });

  describe('updateActivityContactService', () => {
    it('throws 403 when trying to update PRIMARY contact', async () => {
      mockRepos.activityContact.findFirstOrThrow.mockResolvedValue({
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.PRIMARY
      });

      await expect(
        updateActivityContactService(
          TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
          TEST_CURRENT_CONTEXT,
          TEST_ACTIVITY_CONTACT_1.activityId,
          TEST_CONTACT_1.contactId,
          ActivityContactRole.MEMBER
        )
      ).rejects.toThrow(new Problem(403, { detail: 'Cannot remove PRIMARY contact' }));
    });

    it('updates an activity contact role and sends email', async () => {
      const updatedContact = {
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.ADMIN
      };

      mockRepos.activityContact.findFirstOrThrow.mockResolvedValue({
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.MEMBER
      });
      verifyPrimaryChangeSpy.mockResolvedValue(undefined);
      mockRepos.activityContact.update.mockResolvedValue(updatedContact);
      mockRepos.contact.findUniqueOrThrow.mockResolvedValue(TEST_CONTACT_1);
      getTeamMemberEmailTemplateDataSpy.mockResolvedValue({
        templateParams: TEMPLATE_PARAMS,
        navEmail: 'nav@example.com'
      });

      const result = await updateActivityContactService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        TEST_ACTIVITY_CONTACT_1.activityId,
        TEST_CONTACT_1.contactId,
        ActivityContactRole.ADMIN
      );

      expect(mockRepos.activityContact.update).toHaveBeenCalledTimes(1);
      expect(mockRepos.activityContact.update).toHaveBeenCalledWith(
        {
          activityId_contactId: {
            activityId: TEST_ACTIVITY_CONTACT_1.activityId,
            contactId: TEST_CONTACT_1.contactId
          }
        },
        {
          role: ActivityContactRole.ADMIN
        }
      );
      expect(email).toHaveBeenCalledTimes(1);
      expect(email).toHaveBeenCalledWith({
        to: [TEST_CONTACT_1.email],
        from: 'nav@example.com',
        subject: `You are now the Admin of ${TEMPLATE_PARAMS.projectName} project in the Navigator Service`,
        bodyType: 'html',
        body: '<html>Admin Template</html>'
      });
      expect(result).toEqual({ updated: updatedContact, demoted: undefined });
    });

    it('verifies primary change when updating to PRIMARY role', async () => {
      const demotedContact = { ...TEST_ACTIVITY_CONTACT_1, contactId: 'old-primary', role: ActivityContactRole.ADMIN };
      const updatedContact = { ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.PRIMARY };

      mockRepos.activityContact.findFirstOrThrow.mockResolvedValue({
        ...TEST_ACTIVITY_CONTACT_1,
        role: ActivityContactRole.MEMBER
      });
      verifyPrimaryChangeSpy.mockResolvedValue(demotedContact);
      mockRepos.activityContact.update.mockResolvedValue(updatedContact);
      mockRepos.contact.findUniqueOrThrow.mockResolvedValue(TEST_CONTACT_1);
      getTeamMemberEmailTemplateDataSpy.mockResolvedValue({
        templateParams: TEMPLATE_PARAMS,
        navEmail: 'nav@example.com'
      });

      const result = await updateActivityContactService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        TEST_ACTIVITY_CONTACT_1.activityId,
        TEST_CONTACT_1.contactId,
        ActivityContactRole.PRIMARY
      );

      expect(verifyPrimaryChangeSpy).toHaveBeenCalledTimes(1);
      expect(verifyPrimaryChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activityContact: mockRepos.activityContact,
          contact: mockRepos.contact
        }),
        TEST_ACTIVITY_CONTACT_1.activityId,
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT
      );
      expect(result).toEqual({ updated: updatedContact, demoted: demotedContact });
    });
  });
});
