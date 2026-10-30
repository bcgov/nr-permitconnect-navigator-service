import config from 'config';
import { mockReset } from 'vitest-mock-extended';

import {
  TEST_IDIR_USER_1,
  TEST_PERMIT_1,
  TEST_PERMIT_2,
  TEST_PERMIT_NOTE_1,
  TEST_PERMIT_TYPE_1
} from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import { PermitStage, PermitState } from '#src/db/codes/enums';
import {
  buildPermitUpdateEmail,
  listPeachIntegratedTrackings,
  prepareNotificationEmails,
  prepareIntakeNotificationEmails
} from '#src/domains/permit';
import * as projectDomain from '#src/domains/project';
import { Initiative } from '#src/utils/enums/application';
import { PermitNeeded } from '#src/utils/enums/permit';
import { ActivityContactRole } from '#src/utils/enums/projectCommon';

import type { CurrentContext, PermitUpdateEmailParams } from '#types';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.ches.submission.cc') return 'noreply@example.com';
        if (key === 'server.env') return 'test';
        if (key === 'server.pcns.navEmail') return 'nav@example.com';
        if (key === 'server.pcns.appUrl') return 'www.example.com';
        if (key === 'server.pcbcUrl') return 'www.example.com';

        return actual.get(key);
      }),
      has: vi.fn(() => false)
    }
  };
});

describe('permit domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('listPeachIntegratedTrackings', () => {
    it('should find permits with PEACH integrated tracking', async () => {
      const permitWithTracking = {
        ...TEST_PERMIT_1,
        permitTracking: [
          {
            ...TEST_PERMIT_1.permitTracking![0],
            sourceSystemKind: { ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind, integrated: true }
          }
        ]
      };

      mockRepos.permit.findMany.mockResolvedValue([permitWithTracking] as never);

      const result = await listPeachIntegratedTrackings(mockRepos);

      expect(mockRepos.permit.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ permitTracking: { some: { sourceSystemKind: { integrated: true } } } }]
        },
        include: {
          permitTracking: {
            where: { AND: [{ sourceSystemKind: { integrated: true } }] },
            include: { sourceSystemKind: true }
          }
        }
      });
      expect(result).toEqual([permitWithTracking]);
    });

    it('should return empty array when no PEACH integrated permits found', async () => {
      mockRepos.permit.findMany.mockResolvedValue([] as never);

      const result = await listPeachIntegratedTrackings(mockRepos);

      expect(result).toEqual([]);
    });
  });

  describe('buildPermitUpdateEmail', () => {
    it('should build email with correct template and subject for test environment', async () => {
      const permit = {
        ...TEST_PERMIT_1,
        permitType: { name: 'Water Permit' }
      };

      const params: PermitUpdateEmailParams = {
        permit: permit as never,
        initiative: Initiative.HOUSING,
        dearName: 'John Doe',
        projectId: 'proj-123',
        toEmails: ['recipient@example.com'],
        emailTemplate: vi.fn().mockReturnValue('<html>Email body</html>')
      };

      const emailData = await buildPermitUpdateEmail(mockRepos, params);

      expect(emailData).toEqual({
        to: ['recipient@example.com'],
        from: 'noreply@example.com',
        cc: ['noreply@example.com'],
        subject: 'TEST -- Updates for Housing project ACTI1234, Water Permit -- TEST',
        bodyType: 'html',
        body: '<html>Email body</html>'
      });

      expect(params.emailTemplate).toHaveBeenCalledWith({
        activityId: 'ACTI1234',
        dearName: 'John Doe',
        initiative: 'housing',
        permitId: TEST_PERMIT_1.permitId,
        permitName: 'Water Permit',
        projectId: 'proj-123',
        submittedDate: expect.any(String)
      });
    });

    it('should format subject for production environment', async () => {
      vi.mocked(config.get).mockImplementation((key: string) => {
        if (key === 'server.ches.submission.cc') return 'noreply@example.com';
        if (key === 'server.env') return 'prod';
        if (key === 'server.pcns.navEmail') return 'nav@example.com';
        return undefined;
      });

      const permit = { ...TEST_PERMIT_1, permitType: { name: 'Permit' } };
      const params: PermitUpdateEmailParams = {
        permit: permit as never,
        initiative: Initiative.HOUSING,
        dearName: 'Jane',
        projectId: 'proj-456',
        toEmails: ['recipient@example.com'],
        emailTemplate: vi.fn().mockReturnValue('body')
      };

      const emailData = await buildPermitUpdateEmail(mockRepos, params);

      expect(emailData.subject).toBe('Updates for Housing project ACTI1234, Permit');
      expect(emailData.subject).not.toContain('TEST');
    });
  });

  describe('prepareNotificationEmails', () => {
    it('should create permit note and build proponent email', async () => {
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectId: 'proj-123',
        activityId: 'ACTI1234',
        activity: {
          initiative: { code: Initiative.HOUSING },
          activityContact: [
            {
              role: ActivityContactRole.PRIMARY,
              contact: { email: 'proponent@example.com', firstName: 'John' }
            }
          ]
        },
        assignedUserId: null
      } as never);

      mockRepos.permitNote.create.mockResolvedValue({
        ...TEST_PERMIT_NOTE_1,
        note: 'This application is in progress in the application submission.'
      } as never);

      const permit = {
        ...TEST_PERMIT_2,
        needed: PermitNeeded.YES,
        stage: PermitStage.APPLICATION_SUBMISSION,
        state: PermitState.IN_PROGRESS,
        permitNote: []
      };

      const emails = await prepareNotificationEmails(mockRepos, permit as never, false);

      expect(mockRepos.permitNote.create).toHaveBeenCalled();
      const createCall = mockRepos.permitNote.create.mock.calls[0]?.[0];
      expect(createCall?.permitId).toBe(permit.permitId);
      expect(emails.length).toBe(1);
    });

    it('should not build proponent email when no primary contact email', async () => {
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectId: 'proj-123',
        activityId: 'ACTI1234',
        activity: {
          initiative: { code: Initiative.HOUSING },
          activityContact: [
            {
              role: ActivityContactRole.PRIMARY,
              contact: { email: null, firstName: 'John' }
            }
          ]
        },
        assignedUserId: null
      } as never);

      mockRepos.permitNote.create.mockResolvedValue({
        ...TEST_PERMIT_NOTE_1,
        note: 'This application is in progress in the application submission.'
      } as never);

      const permit = {
        ...TEST_PERMIT_2,
        needed: PermitNeeded.YES,
        stage: PermitStage.APPLICATION_SUBMISSION,
        permitNote: []
      };

      const emails = await prepareNotificationEmails(mockRepos, permit as never, false);

      expect(mockRepos.permitNote.create).toHaveBeenCalled();
      expect(emails.length).toBe(0);
    });

    it('should build navigator email when fromPeachSync is true', async () => {
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectId: 'proj-123',
        activityId: 'ACTI1234',
        assignedUserId: 'user-123',
        activity: {
          initiative: { code: Initiative.HOUSING },
          activityContact: [
            {
              role: ActivityContactRole.PRIMARY,
              contact: { email: 'proponent@example.com', firstName: 'John' }
            }
          ]
        }
      } as never);

      mockRepos.permitNote.create.mockResolvedValue({
        ...TEST_PERMIT_NOTE_1,
        note: 'This application is in progress in the application submission.'
      } as never);

      mockRepos.user.findById.mockResolvedValue({
        ...TEST_IDIR_USER_1,
        firstName: 'Jane',
        lastName: 'Doe'
      } as never);

      const permit = {
        ...TEST_PERMIT_2,
        needed: PermitNeeded.YES,
        stage: PermitStage.APPLICATION_SUBMISSION,
        permitNote: []
      };

      const emails = await prepareNotificationEmails(mockRepos, permit as never, true);

      expect(mockRepos.user.findById).toHaveBeenCalledWith('user-123');
      expect(emails.length).toBeGreaterThan(0);
    });

    it('should throw error when permit state/stage are invalid', async () => {
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectId: 'proj-123',
        activityId: 'ACTI1234',
        activity: { initiative: { code: Initiative.HOUSING } },
        assignedUserId: null
      } as never);

      const permit = {
        ...TEST_PERMIT_1,
        state: 'INVALID_STATE',
        stage: 'INVALID_STAGE'
      };

      await expect(prepareNotificationEmails(mockRepos, permit as never, false)).rejects.toThrow(
        'Invalid permit.state'
      );
    });

    it('should use permit-supplied note when provided', async () => {
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectId: 'proj-123',
        activityId: 'ACTI1234',
        activity: {
          initiative: { code: Initiative.HOUSING },
          activityContact: []
        },
        assignedUserId: null
      } as never);

      mockRepos.permitNote.create.mockResolvedValue({
        ...TEST_PERMIT_NOTE_1,
        note: 'Custom note'
      } as never);

      const permit = {
        ...TEST_PERMIT_1,
        stage: PermitStage.APPLICATION_SUBMISSION,
        state: PermitState.IN_PROGRESS,
        needed: PermitNeeded.YES,
        permitNote: []
      };

      const customNote = 'Custom note text';

      await prepareNotificationEmails(mockRepos, permit as never, false, customNote);

      const createCall = mockRepos.permitNote.create.mock.calls[0]?.[0];
      expect(createCall?.note).toBe(customNote);
    });

    it('should not build email when permit needed is NO and stage is PRE_SUBMISSION', async () => {
      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectId: 'proj-123',
        activityId: 'ACTI1234',
        activity: {
          initiative: { code: Initiative.HOUSING },
          activityContact: [
            {
              role: ActivityContactRole.PRIMARY,
              contact: { email: 'proponent@example.com', firstName: 'John' }
            }
          ]
        },
        assignedUserId: null
      } as never);

      mockRepos.permitNote.create.mockResolvedValue(TEST_PERMIT_NOTE_1 as never);

      const permit = {
        ...TEST_PERMIT_1,
        needed: PermitNeeded.NO,
        stage: PermitStage.PRE_SUBMISSION,
        permitNote: []
      };

      const emails = await prepareNotificationEmails(mockRepos, permit as never, false);

      expect(mockRepos.permitNote.create).toHaveBeenCalled();
      expect(emails.length).toBe(0);
    });
  });

  describe('prepareIntakeNotificationEmails', () => {
    it('should include a comma-separated link for each submitted permit', async () => {
      const secondPermitType = { ...TEST_PERMIT_TYPE_1, permitTypeId: 2, name: 'PERMIT2' };
      vi.mocked(config.get).mockImplementation((key: string) => {
        if (key === 'server.pcns.appUrl') return 'www.example.com';
        if (key === 'server.pcns.navEmail') return 'nav@example.com';
        return undefined;
      });

      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectId: 'proj-123',
        projectName: 'Project',
        activity: {
          activityId: 'ACTI1234',
          initiative: { code: Initiative.HOUSING },
          activityContact: [
            {
              role: ActivityContactRole.PRIMARY,
              contact: {
                firstName: 'John',
                contactApplicantRelationship: 'Applicant'
              }
            }
          ]
        },
        assignedUserId: null
      } as never);

      mockRepos.contact.findFirst.mockResolvedValue({ firstName: 'John' } as never);
      mockRepos.permitType.findMany.mockResolvedValue([TEST_PERMIT_TYPE_1, secondPermitType] as never);

      const emails = await prepareIntakeNotificationEmails(mockRepos, { userId: 'user-123' } as CurrentContext, [
        { ...TEST_PERMIT_1, createdAt: new Date('2024-01-04T00:00:00.000Z') },
        { ...TEST_PERMIT_2, permitTypeId: 2, createdAt: new Date('2024-01-05T00:00:00.000Z') }
      ]);

      expect(emails).toHaveLength(1);
      const authorizationPath = 'www.example.com/i/housing/project/proj-123/authorization';
      const firstLink = `<a href="${authorizationPath}/${TEST_PERMIT_1.permitId}">DOMAIN: PERMIT1</a>`;
      const secondLink = `<a href="${authorizationPath}/${TEST_PERMIT_2.permitId}">DOMAIN: PERMIT2</a>`;
      expect(emails[0].body).toContain(`${firstLink}, ${secondLink}`);
      expect(mockRepos.permitType.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
