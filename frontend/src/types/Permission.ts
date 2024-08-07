import type { Action, GroupName, Initiative, Resource } from '@/utils/enums/application';

export type Permission = {
  group: GroupName;
  initiative: Initiative;
  resource: Resource;
  action: Action;
};
