import {
  electrificationProjectService,
  createProject,
  deleteProject,
  getProject,
  listActivityIds,
  listProjects,
  searchProjects,
  patchProject,
  getProjectStatistics,
  submitDraft,
  deleteDraft,
  getDraft,
  listDrafts,
  upsertDraft
} from '@/services/electrificationProjectService';

import { appAxios } from '@/services/interceptors';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('electrificationProject service', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockPatch = vi.fn();
  const mockDelete = vi.fn();

  const PATH = 'electrification/project';

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      patch: mockPatch,
      delete: mockDelete
    } as never);
  });

  describe('createProject', () => {
    it('creates a project and returns data', async () => {
      const project = { projectId: 'project-1' };

      mockPost.mockResolvedValue({ data: project });

      const result = await createProject(project as never);

      expect(mockPost).toHaveBeenCalledWith(PATH, project);
      expect(result).toEqual(project);
    });

    it('propagates errors', async () => {
      const error = new Error('create failed');

      mockPost.mockRejectedValue(error);

      await expect(createProject({} as never)).rejects.toThrow(error);
    });
  });

  describe('deleteProject', () => {
    it('deletes the project', async () => {
      mockDelete.mockResolvedValue({});

      await deleteProject({
        projectId: 'project-1'
      });

      expect(mockDelete).toHaveBeenCalledWith(`${PATH}/project-1`);
    });

    it('propagates errors', async () => {
      const error = new Error('delete failed');

      mockDelete.mockRejectedValue(error);

      await expect(deleteProject({ projectId: 'project-1' })).rejects.toThrow(error);
    });
  });

  describe('listActivityIds', () => {
    it('returns activity ids', async () => {
      const activityIds = ['a1', 'a2'];

      mockGet.mockResolvedValue({
        data: activityIds
      });

      const result = await listActivityIds();

      expect(mockGet).toHaveBeenCalledWith(`${PATH}/activityIds`);

      expect(result).toEqual(activityIds);
    });

    it('propagates errors', async () => {
      mockGet.mockRejectedValue(new Error('failed'));

      await expect(listActivityIds()).rejects.toThrow('failed');
    });
  });

  describe('getProject', () => {
    it('returns a project', async () => {
      const project = { projectId: 'project-1' };

      mockGet.mockResolvedValue({
        data: project
      });

      const result = await getProject({
        projectId: 'project-1'
      });

      expect(mockGet).toHaveBeenCalledWith(`${PATH}/project-1`);

      expect(result).toEqual(project);
    });

    it('propagates errors', async () => {
      mockGet.mockRejectedValue(new Error('failed'));

      await expect(getProject({ projectId: 'project-1' })).rejects.toThrow('failed');
    });
  });

  describe('listProjects', () => {
    it('returns all projects', async () => {
      const projects = [{ projectId: '1' }];

      mockGet.mockResolvedValue({
        data: projects
      });

      const result = await listProjects();

      expect(mockGet).toHaveBeenCalledWith(PATH);
      expect(result).toEqual(projects);
    });

    it('propagates errors', async () => {
      mockGet.mockRejectedValue(new Error('failed'));

      await expect(listProjects()).rejects.toThrow('failed');
    });
  });

  describe('searchProjects', () => {
    it('posts filters and returns projects', async () => {
      const filters = {
        status: 'ACTIVE'
      };

      const projects = [{ projectId: '1' }];

      mockPost.mockResolvedValue({
        data: projects
      });

      const result = await searchProjects(filters as never);

      expect(mockPost).toHaveBeenCalledWith(`${PATH}/search`, filters);

      expect(result).toEqual(projects);
    });

    it('propagates errors', async () => {
      mockPost.mockRejectedValue(new Error('failed'));

      await expect(searchProjects({} as never)).rejects.toThrow('failed');
    });
  });

  describe('patchProject', () => {
    it('patches project and returns updated data', async () => {
      const request = {
        projectId: 'project-1',
        name: 'Updated Name'
      };

      const updatedProject = {
        projectId: 'project-1',
        name: 'Updated Name'
      };

      mockPatch.mockResolvedValue({
        data: updatedProject
      });

      const result = await patchProject(request as never);

      expect(mockPatch).toHaveBeenCalledWith(`${PATH}/project-1`, {
        name: 'Updated Name'
      });

      expect(result).toEqual(updatedProject);
    });

    it('propagates errors', async () => {
      mockPatch.mockRejectedValue(new Error('failed'));

      await expect(
        patchProject({
          projectId: 'project-1'
        } as never)
      ).rejects.toThrow('failed');
    });
  });

  describe('getProjectStatistics', () => {
    it('passes filters as query params', async () => {
      const filters = {
        year: 2025
      };

      const statistics = {
        totalProjects: 12
      };

      mockGet.mockResolvedValue({
        data: statistics
      });

      const result = await getProjectStatistics(filters as never);

      expect(mockGet).toHaveBeenCalledWith(`${PATH}/statistics`, {
        params: filters
      });

      expect(result).toEqual(statistics);
    });

    it('propagates errors', async () => {
      mockGet.mockRejectedValue(new Error('failed'));

      await expect(getProjectStatistics({} as never)).rejects.toThrow('failed');
    });
  });

  describe('submitDraft', () => {
    it('submits draft and returns project', async () => {
      const request = {
        draftId: 'draft-1'
      };

      const project = {
        projectId: 'project-1'
      };

      mockPut.mockResolvedValue({
        data: project
      });

      const result = await submitDraft(request as never);

      expect(mockPut).toHaveBeenCalledWith(`${PATH}/draft/submit`, request);

      expect(result).toEqual(project);
    });

    it('propagates errors', async () => {
      mockPut.mockRejectedValue(new Error('failed'));

      await expect(submitDraft({} as never)).rejects.toThrow('failed');
    });
  });

  describe('deleteDraft', () => {
    it('deletes draft', async () => {
      mockDelete.mockResolvedValue({});

      await deleteDraft({
        draftId: 'draft-1'
      });

      expect(mockDelete).toHaveBeenCalledWith(`${PATH}/draft/draft-1`);
    });

    it('propagates errors', async () => {
      mockDelete.mockRejectedValue(new Error('failed'));

      await expect(deleteDraft({ draftId: 'draft-1' })).rejects.toThrow('failed');
    });
  });

  describe('getDraft', () => {
    it('returns draft', async () => {
      const draft = {
        draftId: 'draft-1'
      };

      mockGet.mockResolvedValue({
        data: draft
      });

      const result = await getDraft({
        draftId: 'draft-1'
      });

      expect(mockGet).toHaveBeenCalledWith(`${PATH}/draft/draft-1`);

      expect(result).toEqual(draft);
    });

    it('propagates errors', async () => {
      mockGet.mockRejectedValue(new Error('failed'));

      await expect(getDraft({ draftId: 'draft-1' })).rejects.toThrow('failed');
    });
  });

  describe('getDrafts', () => {
    it('returns drafts', async () => {
      const drafts = [{ draftId: '1' }, { draftId: '2' }];

      mockGet.mockResolvedValue({
        data: drafts
      });

      const result = await listDrafts();

      expect(mockGet).toHaveBeenCalledWith(`${PATH}/draft`);

      expect(result).toEqual(drafts);
    });

    it('propagates errors', async () => {
      mockGet.mockRejectedValue(new Error('failed'));

      await expect(listDrafts()).rejects.toThrow('failed');
    });
  });

  describe('upsertDraft', () => {
    it('creates or updates a draft', async () => {
      const draft = {
        draftId: 'draft-1'
      };

      mockPut.mockResolvedValue({
        data: draft
      });

      const result = await upsertDraft(draft as never);

      expect(mockPut).toHaveBeenCalledWith(`${PATH}/draft`, draft);

      expect(result).toEqual(draft);
    });

    it('propagates errors', async () => {
      mockPut.mockRejectedValue(new Error('failed'));

      await expect(upsertDraft({} as never)).rejects.toThrow('failed');
    });
  });

  it('exports all service functions', () => {
    expect(electrificationProjectService).toEqual({
      createProject,
      deleteDraft,
      deleteProject,
      getDraft,
      getProject,
      getProjectStatistics,
      listActivityIds,
      listDrafts,
      listProjects,
      patchProject,
      searchProjects,
      submitDraft,
      upsertDraft
    });
  });
});
