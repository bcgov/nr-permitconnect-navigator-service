import { mockReset } from 'vitest-mock-extended';
import config from 'config';

import {
  TEST_PERMIT_1,
  TEST_PERMIT_2,
  TEST_PERMIT_NOTE_1,
  TEST_IDIR_USER_1,
  TEST_EMAIL_RESPONSE
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import {
  listPeachIntegratedTrackings,
  sendPermitUpdateEmail,
  sendPermitUpdateNotifications
} from '../../../src/domains/permit.ts';
import * as projectDomain from '../../../src/domains/project.ts';
import * as chesExternal from '../../../src/external/ches.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { PermitNeeded } from '../../../src/utils/enums/permit.ts';
import { PermitStage, PermitState } from '../../../src/db/codes/enums.ts';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon.ts';

import type { PermitUpdateEmailParams } from '../../../src/types/index.ts';

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

  describe('sendPermitUpdateEmail', () => {
    it('should send email with correct template and subject for test environment', async () => {
      const emailSpy = vi.spyOn(chesExternal, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

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

      await sendPermitUpdateEmail(params);

      expect(emailSpy).toHaveBeenCalledWith({
        to: ['recipient@example.com'],
        from: 'noreply@example.com',
        cc: ['noreply@example.com'],
        subject: 'TEST -- Updates for project ACTI1234, Water Permit -- TEST',
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

      const emailSpy = vi.spyOn(chesExternal, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const permit = { ...TEST_PERMIT_1, permitType: { name: 'Permit' } };
      const params: PermitUpdateEmailParams = {
        permit: permit as never,
        initiative: Initiative.HOUSING,
        dearName: 'Jane',
        projectId: 'proj-456',
        toEmails: ['recipient@example.com'],
        emailTemplate: vi.fn().mockReturnValue('body')
      };

      await sendPermitUpdateEmail(params);

      const emailCall = emailSpy.mock.calls[0]?.[0];
      expect(emailCall?.subject).toBe('Updates for project ACTI1234, Permit');
      expect(emailCall?.subject).not.toContain('TEST');
    });
  });

  describe('sendPermitUpdateNotifications', () => {
    it('should create permit note and send proponent email', async () => {
      vi.spyOn(chesExternal, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

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

      await sendPermitUpdateNotifications(mockRepos, permit as never, false);

      expect(mockRepos.permitNote.create).toHaveBeenCalled();
      const createCall = mockRepos.permitNote.create.mock.calls[0]?.[0];
      expect(createCall?.permitId).toBe(permit.permitId);
    });

    it('should not send proponent email when no primary contact email', async () => {
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

      await sendPermitUpdateNotifications(mockRepos, permit as never, false);

      expect(mockRepos.permitNote.create).toHaveBeenCalled();
    });

    it('should send navigator email when fromPeachSync is true', async () => {
      const emailSpy = vi.spyOn(chesExternal, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

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

      await sendPermitUpdateNotifications(mockRepos, permit as never, true);

      expect(mockRepos.user.findById).toHaveBeenCalledWith('user-123');
      expect(emailSpy).toHaveBeenCalled();
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

      await expect(sendPermitUpdateNotifications(mockRepos, permit as never, false)).rejects.toThrow(
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

      await sendPermitUpdateNotifications(mockRepos, permit as never, false, customNote);

      const createCall = mockRepos.permitNote.create.mock.calls[0]?.[0];
      expect(createCall?.note).toBe(customNote);
    });

    it('should not send email when permit needed is NO and stage is PRE_SUBMISSION', async () => {
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

      await sendPermitUpdateNotifications(mockRepos, permit as never, false);

      expect(mockRepos.permitNote.create).toHaveBeenCalled();
    });
  });
});
