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
} from '../utils/migrations/yars.ts';

import type { Knex } from 'knex';

const PERMIT_TYPE_RESOURCE = Resource.PERMIT_TYPE;
const ACTIONS = [Action.READ];

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add the PERMIT_TYPE resource
      .then(async () => {
        await addResources(knex, [PERMIT_TYPE_RESOURCE]);
      })

      // Add the PERMIT_TYPE policies
      .then(async () => {
        await addPolicies(knex, [PERMIT_TYPE_RESOURCE], ACTIONS);
      })

      // Add the PERMIT_TYPE roles
      .then(async () => {
        await addRoles(knex, [PERMIT_TYPE_RESOURCE], ACTIONS);
      })

      // Add role to policy mappings for PERMIT_TYPE
      .then(async () => {
        await addRolePolicies(knex, [PERMIT_TYPE_RESOURCE], ACTIONS);
      })

      .then(async () => {
        // Add all group to role mappings
        await addGroupRoles(knex, Initiative.PCNS, GroupName.PROPONENT, PERMIT_TYPE_RESOURCE, ACTIONS);
        await addGroupRoles(knex, Initiative.PCNS, GroupName.NAVIGATOR, PERMIT_TYPE_RESOURCE, ACTIONS);
        await addGroupRoles(knex, Initiative.PCNS, GroupName.NAVIGATOR_READ_ONLY, PERMIT_TYPE_RESOURCE, [Action.READ]);
        await addGroupRoles(knex, Initiative.PCNS, GroupName.SUPERVISOR, PERMIT_TYPE_RESOURCE, ACTIONS);
        await addGroupRoles(knex, Initiative.PCNS, GroupName.ADMIN, PERMIT_TYPE_RESOURCE, ACTIONS);
      })

      .then(async () => {
        await addPolicyAttributes(knex, PERMIT_TYPE_RESOURCE, ACTIONS, ['scope:all', 'scope:self']);
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Remove group to role mappings for PERMIT_TYPE
      .then(async () => {
        await deleteGroupRoles(knex, PERMIT_TYPE_RESOURCE, ACTIONS);
      })

      // Remove role to policy mappings for PERMIT_TYPE
      .then(async () => {
        await deleteRolePolicies(knex, PERMIT_TYPE_RESOURCE, ACTIONS);
      })

      // Remove the PERMIT_TYPE roles
      .then(async () => {
        await deleteRoles(knex, PERMIT_TYPE_RESOURCE, ACTIONS);
      })

      // Remove the PERMIT_TYPE policies
      .then(async () => {
        await deletePolicies(knex, [PERMIT_TYPE_RESOURCE]);
      })

      // Remove the PERMIT_TYPE resource
      .then(async () => {
        await deleteResources(knex, [PERMIT_TYPE_RESOURCE]);
      })
  );
}
