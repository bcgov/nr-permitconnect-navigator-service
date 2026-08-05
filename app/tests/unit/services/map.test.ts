import { mockReset } from 'vitest-mock-extended';

import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import * as projectDomain from '../../../src/domains/project.ts';
import * as openMapsExternal from '../../../src/external/openMaps.ts';
import * as mapService from '../../../src/services/map.ts';

const getProjectByProjectIdSpy = vi.spyOn(projectDomain, 'getProjectByProjectId');
const getPidsSpy = vi.spyOn(openMapsExternal, 'getPids');

describe('map service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('getPidsService', () => {
    it('fetches PIDs using geoJson when a project has geoJson data', async () => {
      const projectId = 'proj-1';
      const mockGeoJson = { type: 'FeatureCollection', features: [] };

      getProjectByProjectIdSpy.mockResolvedValueOnce({ geoJson: mockGeoJson } as never);
      getPidsSpy.mockResolvedValueOnce('123,456' as never);

      const result = await mapService.getPidsService(projectId);

      expect(getProjectByProjectIdSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          electrificationProject: mockRepos.electrificationProject,
          generalProject: mockRepos.generalProject,
          housingProject: mockRepos.housingProject
        }),
        projectId
      );
      expect(getPidsSpy).toHaveBeenCalledWith(mockGeoJson);
      expect(result).toBe('123,456');
    });

    it('returns undefined when project is found but has no geoJson property', async () => {
      const projectId = 'proj-2';

      // Simulating a project structure that lacks the geoJson property
      getProjectByProjectIdSpy.mockResolvedValueOnce({ projectName: 'No GeoJson Project' } as never);

      const result = await mapService.getPidsService(projectId);

      expect(getProjectByProjectIdSpy).toHaveBeenCalledTimes(1);
      expect(getPidsSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('returns undefined when project is not found', async () => {
      const projectId = 'proj-3';

      getProjectByProjectIdSpy.mockResolvedValueOnce(undefined as never);

      const result = await mapService.getPidsService(projectId);

      expect(getProjectByProjectIdSpy).toHaveBeenCalledTimes(1);
      expect(getPidsSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
