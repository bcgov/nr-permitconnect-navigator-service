import { getGitRevision, readFeatureList } from './src/utils/utils.ts';

export const state = {
  features: readFeatureList(),
  gitRev: getGitRevision(),
  ready: false,
  shutdown: false
};
