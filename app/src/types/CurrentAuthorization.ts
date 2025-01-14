import { GroupName } from '../utils/enums/application.ts';

export type CurrentAuthorization = {
  attributes: Array<string>;
  groups: Array<GroupName>;
};
