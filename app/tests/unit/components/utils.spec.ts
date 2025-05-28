import { getGitRevision, readFeatureList, readIdpList } from '../../../src/utils/utils';

beforeEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('getGitRevision', () => {
  it('should return a string', () => {
    expect(typeof getGitRevision()).toBe('string');
  });
});

describe('readFeatureList', () => {
  it('should return an object', () => {
    expect(typeof readFeatureList()).toBe('object');
  });
});

describe('readIdpList', () => {
  it('should return an array of objects', () => {
    expect(Array.isArray(readIdpList())).toBeTruthy();
  });
});
