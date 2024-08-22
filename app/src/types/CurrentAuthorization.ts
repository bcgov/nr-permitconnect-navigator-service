import { GroupName } from '../utils/enums/application';

export type CurrentAuthorization = {
  attributes: Array<string>;
  groups: Array<GroupName>;
};
