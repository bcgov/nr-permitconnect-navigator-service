export type UserSearchParameters = {
  userId?: string[];
  idp?: string[];
  group?: string[];
  sub?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  active?: boolean;
  includeUserGroups?: boolean;
};
