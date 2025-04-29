import { Group } from './Group';

export type CurrentAuthorization = {
  attributes: Array<string>;
  groups: Array<Group>;
};
