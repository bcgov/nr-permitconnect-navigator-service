import { unitOfWork } from '../repository/uow.ts';
import { isTruthy } from '../utils/index.ts';

import type { User } from '../types/models.ts';
import type { Group, UserSearchParameters } from '../types/stuff.ts';

export type UserWithGroup = User & { groups?: Group[] };

/**
 * Search and filter for specific users
 * @param params - Optional filtering parameters
 * @param params.userId - Optional array of uuids representing the user subject
 * @param params.idp - Optional array of identity providers
 * @param params.sub - Optional sub string to match on
 * @param params.email - Optional email string to match on
 * @param params.firstName - Optional firstName string to match on
 * @param params.fullName - Optional fullName string to match on
 * @param params.lastName - Optional lastName string to match on
 * @param params.active - Optional boolean on user active status
 * @returns A Promise that resolves into a list of users from search params
 */
export const searchUsersService = async (params: UserSearchParameters): Promise<User[]> => {
  return await unitOfWork.execute(async ({ initiative, subjectGroup, user }) => {
    const users = await user.search(params);

    // Inject found users with their groups if necessary
    let userWithGroups: UserWithGroup[] = users;

    if (params.group?.length || isTruthy(params.includeUserGroups)) {
      for (const user of userWithGroups) {
        user.groups = await subjectGroup.getSubjectGroups(user.sub);
      }

      // Filters users based on groups
      if (params.group?.length) {
        userWithGroups = userWithGroups.filter((user) =>
          params.group?.some((g) => user.groups?.some((ug) => ug.name === g))
        );
      }

      // Filters user groups based on initiative
      if (params.initiative?.length) {
        const initiativeResult = (
          await Promise.all(
            params.initiative.map((i) =>
              initiative.findFirstOrThrow({
                where: {
                  code: i
                }
              })
            )
          )
        ).flatMap((r) => r);
        userWithGroups.forEach((user) => {
          if (user.groups)
            user.groups = user.groups.filter((ug) => initiativeResult.some((i) => ug.initiativeId === i.initiativeId));
        });
      }

      // Remove groups if not requested
      if (!isTruthy(params.includeUserGroups)) {
        for (const user of userWithGroups) {
          delete user.groups;
        }
      }
    }

    return userWithGroups;
  });
};
