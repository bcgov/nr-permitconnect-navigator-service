import { mockReset } from 'vitest-mock-extended';

import { TEST_EMAIL_RESPONSE, TEST_IDIR_USER_1, TEST_NOTE_HISTORY_1 } from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { emailBringForwardNotification } from '../../../src/domains/noteHistory.ts';
import * as projectDomain from '../../../src/domains/project.ts';
import { GroupName, Initiative, Resource } from '../../../src/utils/enums/application.ts';
import { NoteType } from '../../../src/utils/enums/projectCommon.ts';

import type { NoteHistory } from '../../../src/types/index.ts';

vi.mock('../../../src/domains/project.ts');
vi.mock('../../../src/external/ches.ts');
vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn(() => 'noreply@example.com'),
      has: vi.fn(() => false)
    }
  };
});

describe('noteHistory domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('emailBringForwardNotification', () => {
    it('should not send email when noteHistory type is not BRING_FORWARD', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.GENERAL
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.HOUSING, Resource.ENQUIRY);

      expect(emailSpy).not.toHaveBeenCalled();
    });

    it('should not send email when escalateToSupervisor is false', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: false
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.HOUSING, Resource.ENQUIRY);

      expect(emailSpy).not.toHaveBeenCalled();
    });

    it('should not send email when no supervisors found', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.HOUSING, Resource.ENQUIRY);

      expect(emailSpy).not.toHaveBeenCalled();
    });

    it('should not send email when supervisors have no email addresses', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const supervisorWithoutEmail = { ...TEST_IDIR_USER_1, email: null };

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([{ sub: 'supervisor-1' }] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([supervisorWithoutEmail] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.HOUSING, Resource.ENQUIRY);

      expect(emailSpy).not.toHaveBeenCalled();
    });

    it('should send email for ENQUIRY resource with bring forward escalation', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([{ sub: 'supervisor-1' }] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true,
        activityId: 'ACTI1234'
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.HOUSING, Resource.ENQUIRY);

      expect(emailSpy).toHaveBeenCalled();
      const emailCall = emailSpy.mock.calls[0]?.[0];
      expect(emailCall?.to).toContain(TEST_IDIR_USER_1.email);
      expect(emailCall?.subject).toBe('New escalation in PCNS');
      expect(emailCall?.from).toBe('noreply@example.com');
    });

    it('should query subjectGroup with correct initiative and group filters', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([{ sub: 'supervisor-1' }] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.ELECTRIFICATION, Resource.ENQUIRY);

      expect(mockRepos.subjectGroup.findMany).toHaveBeenCalledWith({
        where: {
          group: {
            name: GroupName.SUPERVISOR,
            initiative: {
              code: Initiative.ELECTRIFICATION
            }
          }
        }
      });
    });

    it('should query users with supervisor subs and active status', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([{ sub: 'sup-1' }, { sub: 'sup-2' }] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.HOUSING, Resource.ENQUIRY);

      expect(mockRepos.user.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ sub: { in: ['sup-1', 'sup-2'] } }, { active: true }]
        }
      });
    });

    it('should send email for ELECTRIFICATION_PROJECT resource', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectName: 'Test Electrification Project'
      } as never);

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([{ sub: 'supervisor-1' }] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true,
        activityId: 'ACTI5678'
      };

      await emailBringForwardNotification(
        mockRepos,
        noteHistory,
        Initiative.ELECTRIFICATION,
        Resource.ELECTRIFICATION_PROJECT
      );

      expect(emailSpy).toHaveBeenCalled();
      const emailCall = emailSpy.mock.calls[0]?.[0];
      expect(emailCall?.to).toContain(TEST_IDIR_USER_1.email);
      expect(emailCall?.body).toContain('Test Electrification Project');
    });

    it('should send email for GENERAL_PROJECT resource', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectName: 'Test General Project'
      } as never);

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([{ sub: 'supervisor-1' }] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true,
        activityId: 'ACTI9999'
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.GENERAL, Resource.GENERAL_PROJECT);

      expect(emailSpy).toHaveBeenCalled();
    });

    it('should send email for HOUSING_PROJECT resource', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        projectName: 'Test Housing Project'
      } as never);

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([{ sub: 'supervisor-1' }] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true,
        activityId: 'ACTI0000'
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.HOUSING, Resource.HOUSING_PROJECT);

      expect(emailSpy).toHaveBeenCalled();
    });

    it('should not send email when getProjectByActivityId returns null', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue(null as never);

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([{ sub: 'supervisor-1' }] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true,
        activityId: 'NONEXISTENT'
      };

      await emailBringForwardNotification(
        mockRepos,
        noteHistory,
        Initiative.ELECTRIFICATION,
        Resource.ELECTRIFICATION_PROJECT
      );

      expect(emailSpy).not.toHaveBeenCalled();
    });

    it('should gather emails from multiple supervisors', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const supervisor2 = { ...TEST_IDIR_USER_1, email: 'jane.smith@example.com' };

      mockRepos.subjectGroup.findMany.mockResolvedValueOnce([{ sub: 'sup-1' }, { sub: 'sup-2' }] as never);
      mockRepos.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1, supervisor2] as never);

      const noteHistory: NoteHistory = {
        ...TEST_NOTE_HISTORY_1,
        type: NoteType.BRING_FORWARD,
        escalateToSupervisor: true
      };

      await emailBringForwardNotification(mockRepos, noteHistory, Initiative.HOUSING, Resource.ENQUIRY);

      expect(emailSpy).toHaveBeenCalled();
      const emailCall = emailSpy.mock.calls[0]?.[0];
      expect(emailCall?.to).toContain(TEST_IDIR_USER_1.email);
      expect(emailCall?.to).toContain('jane.smith@example.com');
    });
  });
});
