import type { Action, GroupName, Initiative, Resource } from '@/utils/enums/application';

export interface Permission {
  group: GroupName;
  initiative: Initiative;
  resource: Resource;
  action: Action;
}
