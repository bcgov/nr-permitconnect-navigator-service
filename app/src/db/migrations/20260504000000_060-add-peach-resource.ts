import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application.ts';
import {
  addGroupRoles,
  addPolicies,
  addPolicyAttributes,
  addResources,
  addRolePolicies,
  addRoles,
  deleteGroupRoles,
  deletePolicies,
  deleteResources,
  deleteRolePolicies,
  deleteRoles
} from '../utils/yars.ts';

import type { Knex } from 'knex';

const PEACH_RESOURCE = Resource.PEACH;
const ACTIONS = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE];

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add the PEACH resource
      .then(async () => {
        await addResources(knex, [PEACH_RESOURCE]);
      })

      // Add the PEACH policies
      .then(async () => {
        await addPolicies(knex, [PEACH_RESOURCE], ACTIONS);
      })

      // Add the PEACH roles
      .then(async () => {
        await addRoles(knex, [PEACH_RESOURCE], ACTIONS);
      })

      // Add role to policy mappings for PEACH
      .then(async () => {
        await addRolePolicies(knex, [PEACH_RESOURCE], ACTIONS);
      })

      .then(async () => {
        // Add all group to role mappings
        await addGroupRoles(knex, Initiative.PCNS, GroupName.NAVIGATOR, PEACH_RESOURCE, ACTIONS);
        await addGroupRoles(knex, Initiative.PCNS, GroupName.NAVIGATOR_READ_ONLY, PEACH_RESOURCE, [Action.READ]);
        await addGroupRoles(knex, Initiative.PCNS, GroupName.SUPERVISOR, PEACH_RESOURCE, ACTIONS);
        await addGroupRoles(knex, Initiative.PCNS, GroupName.ADMIN, PEACH_RESOURCE, ACTIONS);
      })

      .then(async () => {
        await addPolicyAttributes(
          knex,
          PEACH_RESOURCE,
          [Action.READ, Action.UPDATE, Action.DELETE],
          ['scope:all', 'scope:self']
        );
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Remove group to role mappings for PEACH
      .then(async () => {
        await deleteGroupRoles(knex, PEACH_RESOURCE, ACTIONS);
      })

      // Remove role to policy mappings for PEACH
      .then(async () => {
        await deleteRolePolicies(knex, PEACH_RESOURCE, ACTIONS);
      })

      // Remove the PEACH roles
      .then(async () => {
        await deleteRoles(knex, PEACH_RESOURCE, ACTIONS);
      })

      // Remove the PEACH policies
      .then(async () => {
        await deletePolicies(knex, [PEACH_RESOURCE]);
      })

      // Remove the PEACH resource
      .then(async () => {
        await deleteResources(knex, [PEACH_RESOURCE]);
      })
  );
}
