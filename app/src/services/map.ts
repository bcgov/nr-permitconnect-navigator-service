import { unitOfWork } from '#src/db/unitOfWork';
import { getProjectByProjectId } from '#src/domains/project';
import { getPids } from '#src/external/openMaps';

export const getPidsService = async (projectId: string): Promise<string | undefined> => {
  return await unitOfWork.execute(async ({ electrificationProject, generalProject, housingProject }) => {
    const project = await getProjectByProjectId({ electrificationProject, generalProject, housingProject }, projectId);
    if (project && 'geoJson' in project) return await getPids(project.geoJson);
  });
};
