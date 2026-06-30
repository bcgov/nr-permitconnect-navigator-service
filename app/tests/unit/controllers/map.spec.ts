import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { getPIDsController } from '../../../src/controllers/map.ts';
import * as mapService from '../../../src/external/openMaps.ts';
import * as projectService from '../../../src/services/project.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';

const mockResponse = () => {
  const res: { locals: Record<string, unknown>; status?: Mock; json?: Mock; end?: Mock } = {
    locals: {}
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('getPIDsController', () => {
  const getProjectSpy = vi.spyOn(projectService, 'getProjectByProjectId');
  const getPIDsSpy = vi.spyOn(mapService, 'getPIDs');

  it('returns 200 with PIDs when project has geoJson', async () => {
    getProjectSpy.mockResolvedValueOnce({ geoJson: { type: 'Feature' } } as never);
    getPIDsSpy.mockResolvedValueOnce('123|456');

    await getPIDsController(
      { params: { projectId: 'PRJ1' } } as unknown as Request<{ projectId: string }>,
      res as unknown as Response
    );

    expect(getProjectSpy).toHaveBeenCalledWith(prismaTxMock, 'PRJ1');
    expect(getPIDsSpy).toHaveBeenCalledWith({ type: 'Feature' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith('123|456');
  });

  it('returns 204 when project has no geoJson', async () => {
    getProjectSpy.mockResolvedValueOnce({} as never);

    await getPIDsController(
      { params: { projectId: 'PRJ2' } } as unknown as Request<{ projectId: string }>,
      res as unknown as Response
    );

    expect(getPIDsSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('returns 204 when project not found', async () => {
    getProjectSpy.mockResolvedValueOnce(null as never);

    await getPIDsController(
      { params: { projectId: 'NOPE' } } as unknown as Request<{ projectId: string }>,
      res as unknown as Response
    );

    expect(getPIDsSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
