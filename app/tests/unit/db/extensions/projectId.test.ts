import projectIdTransform from '../../../../src/db/extensions/projectId.ts';
import { captureExtension } from './captureExtension.ts';

const ext = captureExtension(projectIdTransform);

describe('projectId extension', () => {
  it('computes projectId from electrificationProjectId on electrification_project', () => {
    const result = ext.result.electrification_project.projectId.compute({
      electrificationProjectId: 'ep-1'
    });
    expect(result).toBe('ep-1');
  });

  it('computes projectId from generalProjectId on general_project', () => {
    const result = ext.result.general_project.projectId.compute({
      generalProjectId: 'gp-1'
    });
    expect(result).toBe('gp-1');
  });

  it('computes projectId from housingProjectId on housing_project', () => {
    const result = ext.result.housing_project.projectId.compute({
      housingProjectId: 'hp-1'
    });
    expect(result).toBe('hp-1');
  });

  it('declares the underlying *_project_id fields in `needs`', () => {
    expect(ext.result.electrification_project.projectId.needs).toEqual({ electrificationProjectId: true });
    expect(ext.result.general_project.projectId.needs).toEqual({ generalProjectId: true });
    expect(ext.result.housing_project.projectId.needs).toEqual({ housingProjectId: true });
  });
});
