import { getGitRevision, readFeatureList } from './src/utils/utils';

export const state = {
  features: readFeatureList(),
  gitRev: getGitRevision(),
  ready: true, // No dependencies so application is always ready
  shutdown: false
};
