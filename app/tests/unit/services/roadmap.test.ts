import { mockReset } from 'vitest-mock-extended';

import { TEST_CURRENT_CONTEXT } from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { PermitStage } from '../../../src/db/codes/enums.ts';
import * as projectDomain from '../../../src/domains/project.ts';
import * as chesMail from '../../../src/external/ches.ts';
import * as coms from '../../../src/external/coms.ts';
import * as roadmapService from '../../../src/services/roadmap.ts';
import { PermitNeeded } from '../../../src/utils/enums/permit.ts';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon.ts';
import Problem from '../../../src/utils/problem.ts';
import * as templates from '../../../src/utils/templates.ts';

import type { Email } from '../../../src/types/index.ts';

vi.mock('config');

const getProjectByActivityIdSpy = vi.spyOn(projectDomain, 'getProjectByActivityId');
const getObjectSpy = vi.spyOn(coms, 'getObject');
const searchObjectSpy = vi.spyOn(coms, 'searchObject');
const emailSpy = vi.spyOn(chesMail, 'email');
const roadmapTemplateSpy = vi.spyOn(templates, 'roadmapTemplate');

describe('roadmap service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('getRoadmapNoteService', () => {
    it('generates roadmap note using project, contact, and permit details', async () => {
      const activityId = 'activity-1';
      const mockProject = {
        activityId,
        projectName: 'Test Project',
        activity: {
          activityContact: [{ role: ActivityContactRole.PRIMARY, contact: { firstName: 'John', lastName: 'Doe' } }]
        }
      };
      const mockPermits = [
        { stage: PermitStage.APPLICATION_SUBMISSION, needed: PermitNeeded.YES, permitType: { name: 'Permit A' } },
        { stage: PermitStage.POST_DECISION, needed: PermitNeeded.YES, permitType: { name: 'Permit B' } },
        {
          stage: PermitStage.PRE_SUBMISSION,
          needed: PermitNeeded.UNDER_INVESTIGATION,
          permitType: { name: 'Permit C' }
        },
        { stage: PermitStage.PRE_SUBMISSION, needed: PermitNeeded.YES, permitType: { name: 'Permit D' } }
      ];

      getProjectByActivityIdSpy.mockResolvedValueOnce(mockProject as never);
      mockRepos.permit.findMany.mockResolvedValueOnce(mockPermits as never);
      roadmapTemplateSpy.mockReturnValueOnce('Mocked Roadmap Note');

      const result = await roadmapService.getRoadmapNoteService(activityId);

      expect(getProjectByActivityIdSpy).toHaveBeenCalledTimes(1);
      expect(mockRepos.permit.findMany).toHaveBeenCalledWith({ where: { activityId } });
      expect(roadmapTemplateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          contactName: 'John Doe',
          projectName: 'Test Project',
          permitStateNew: ['Permit D'],
          permitPossiblyNeeded: ['Permit C'],
          permitStateApplied: ['Permit A'],
          permitStateCompleted: ['Permit B'],
          navigatorName: expect.any(String)
        })
      );
      expect(result).toBe('Mocked Roadmap Note');
    });
  });

  describe('sendRoadmapService', () => {
    const baseEmailData: Email = {
      bcc: [],
      bodyType: 'text',
      body: 'Test roadmap body',
      cc: [],
      delayTS: 0,
      from: 'test@example.com',
      priority: 'normal',
      subject: 'Test Roadmap',
      to: ['recipient@example.com'],
      tag: 'roadmap'
    };

    it('should handle missing filename from COMS and throw 500 error', async () => {
      const activityId = 'activity-2';
      const selectedFileIds = ['file-1'];
      const contextWithToken = { ...TEST_CURRENT_CONTEXT, bearerToken: 'mock-token' }; // Inject token

      getObjectSpy.mockResolvedValueOnce({
        status: 200,
        headers: { 'content-type': 'application/pdf' },
        data: Buffer.from('file content')
      } as never);

      searchObjectSpy.mockResolvedValueOnce({
        data: [{ name: null }]
      } as never);

      await expect(
        roadmapService.sendRoadmapService(contextWithToken, activityId, selectedFileIds, baseEmailData)
      ).rejects.toThrow(new Problem(500, { detail: 'Unable to obtain filename for file file-1' }));
    });

    it('should fetch attachments from COMS, send email, and append filenames to note body', async () => {
      const activityId = 'activity-4';
      const selectedFileIds = ['file-1'];
      const emailData = { ...baseEmailData };
      const contextWithToken = { ...TEST_CURRENT_CONTEXT, bearerToken: 'mock-token' }; // Inject token

      getObjectSpy.mockResolvedValueOnce({
        status: 200,
        headers: { 'content-type': 'application/pdf' },
        data: Buffer.from('file content')
      } as never);

      searchObjectSpy.mockResolvedValueOnce({
        data: [{ name: 'test-roadmap.pdf' }]
      } as never);

      emailSpy.mockResolvedValueOnce({ status: 201 } as never);
      mockRepos.noteHistory.create.mockResolvedValueOnce({ noteHistoryId: 'nh-1' } as never);
      mockRepos.note.create.mockResolvedValueOnce({ noteId: 'n-1' } as never);

      await roadmapService.sendRoadmapService(contextWithToken, activityId, selectedFileIds, emailData);

      expect(getObjectSpy).toHaveBeenCalledWith('mock-token', 'file-1');
      expect(searchObjectSpy).toHaveBeenCalledWith('mock-token', 'file-1');
      expect(emailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: [
            {
              content: expect.any(String),
              contentType: 'application/pdf',
              encoding: 'base64',
              filename: 'test-roadmap.pdf'
            }
          ]
        })
      );
      expect(mockRepos.note.create).toHaveBeenCalledWith(
        expect.objectContaining({
          note: expect.stringContaining('Attachments:\ntest-roadmap.pdf\n')
        })
      );
    });

    it('should send roadmap without attachments when selectedFileIds is empty', async () => {
      const activityId = 'activity-3';
      const selectedFileIds: string[] = [];

      emailSpy.mockResolvedValueOnce({ status: 201 } as never);

      const mockNoteHistory = {
        noteHistoryId: 'nh-2',
        activityId,
        type: 'Roadmap',
        title: 'Sent roadmap',
        createdAt: new Date(),
        createdBy: 'user-1',
        updatedAt: new Date(),
        updatedBy: 'user-1',
        deletedAt: null,
        deletedBy: null
      };

      const mockNote = {
        noteId: 'n-2',
        noteHistoryId: 'nh-2',
        note: 'Test roadmap body',
        createdAt: new Date(),
        createdBy: 'user-1',
        updatedAt: new Date(),
        updatedBy: 'user-1',
        deletedAt: null,
        deletedBy: null
      };

      mockRepos.noteHistory.create.mockResolvedValueOnce(mockNoteHistory as never);
      mockRepos.note.create.mockResolvedValueOnce(mockNote as never);

      const result = await roadmapService.sendRoadmapService(
        TEST_CURRENT_CONTEXT,
        activityId,
        selectedFileIds,
        baseEmailData
      );

      expect(getObjectSpy).not.toHaveBeenCalled();
      expect(emailSpy).toHaveBeenCalledWith(baseEmailData);
      expect(mockRepos.noteHistory.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.note.create).toHaveBeenCalledTimes(1);
      expect(result.noteHistoryId).toBe('nh-2');
    });

    it('should handle email service failure and throw 500 error', async () => {
      const activityId = 'activity-5';
      const selectedFileIds: string[] = [];

      emailSpy.mockResolvedValueOnce({ status: 500 } as never);

      await expect(
        roadmapService.sendRoadmapService(TEST_CURRENT_CONTEXT, activityId, selectedFileIds, baseEmailData)
      ).rejects.toThrow(new Problem(500, { detail: 'Failed to send roadmap email.' }));
    });

    it('should skip COMS fetch when bearer token is not present', async () => {
      const activityId = 'activity-6';
      const selectedFileIds = ['file-1'];
      const contextWithoutToken = { ...TEST_CURRENT_CONTEXT, bearerToken: null };

      emailSpy.mockResolvedValueOnce({ status: 201 } as never);
      mockRepos.noteHistory.create.mockResolvedValueOnce({ noteHistoryId: 'nh-3' } as never);
      mockRepos.note.create.mockResolvedValueOnce({ noteId: 'n-3' } as never);

      const result = await roadmapService.sendRoadmapService(
        contextWithoutToken as never,
        activityId,
        selectedFileIds,
        baseEmailData
      );

      expect(getObjectSpy).not.toHaveBeenCalled();
      expect(emailSpy).toHaveBeenCalledWith(baseEmailData);
      expect(result.noteHistoryId).toBe('nh-3');
    });

    it('should handle post-email note creation success', async () => {
      const activityId = 'activity-7';
      const selectedFileIds: string[] = [];

      emailSpy.mockResolvedValueOnce({ status: 201 } as never);

      const mockNoteHistory = {
        noteHistoryId: 'nh-6',
        activityId,
        type: 'Roadmap',
        title: 'Sent roadmap',
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null
      };

      mockRepos.noteHistory.create.mockResolvedValueOnce(mockNoteHistory as never);
      mockRepos.note.create.mockResolvedValueOnce({ noteId: 'n-6' } as never);

      const result = await roadmapService.sendRoadmapService(
        TEST_CURRENT_CONTEXT,
        activityId,
        selectedFileIds,
        baseEmailData
      );

      expect(mockRepos.noteHistory.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.note.create).toHaveBeenCalledTimes(1);
      expect(result.noteHistoryId).toBe('nh-6');
      expect(result.type).toBe('Roadmap');
    });
  });
});
