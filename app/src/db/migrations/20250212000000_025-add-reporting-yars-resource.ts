import type { Knex } from 'knex';
import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application.ts';

const resources = [
  {
    name: Resource.REPORTING
  }
];

const actions = [
  {
    name: Action.READ
  }
];

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()

      // Insert the REPORTING resource
      .then(() => {
        return knex('yars.resource').insert(resources);
      })

      // Add policies (only the READ policy)
      .then(() => {
        const items = [];
        for (const resource of resources) {
          for (const action of actions) {
            items.push({
              resource_id: knex('yars.resource').where({ name: resource.name }).select('resource_id'),
              action_id: knex('yars.action').where({ name: action.name }).select('action_id')
            });
          }
        }
        return knex('yars.policy').insert(items);
      })

      // Add roles (only add the VIEWER role for a read-only resource)
      .then(() => {
        const items: { name: string; description: string }[] = [];
        for (const resource of resources) {
          items.push({
            name: `${resource.name.toUpperCase()}_VIEWER`,
            description: `Can view ${resource.name.toLowerCase()}s`
          });
        }
        return knex('yars.role').insert(items);
      })

      // Map the REPORTING_VIEWER role to the REPORTING READ policy
      .then(async () => {
        const policies: { policy_id: number; resource_name: string; action_name: Action }[] = await knex
          .select('p.policy_id', 'r.name as resource_name', 'a.name as action_name')
          .from({ p: 'yars.policy' })
          .innerJoin({ r: 'yars.resource' }, 'p.resource_id', '=', 'r.resource_id')
          .innerJoin({ a: 'yars.action' }, 'p.action_id', '=', 'a.action_id');

        const items: { role_id: number; policy_id: number }[] = [];

        const addRolePolicies = async (resourceName: string) => {
          const viewerId: { role_id: number }[] = await knex('yars.role')
            .where({ name: `${resourceName.toUpperCase()}_VIEWER` })
            .select('role_id');
          const resourcePolicies = policies.filter((x) => x.resource_name === resourceName);
          items.push({
            role_id: viewerId[0].role_id,
            policy_id: resourcePolicies.find((x) => x.action_name === Action.READ)!.policy_id
          });
        };

        await addRolePolicies(Resource.REPORTING);

        return knex('yars.role_policy').insert(items);
      })

      // Add group to role mappings for REPORTING (read action only)
      .then(async () => {
        const housing_id = knex('initiative').where({ code: Initiative.HOUSING }).select('initiative_id');

        const navigator_group_id: { group_id: number }[] = await knex('yars.group')
          .where({ initiative_id: housing_id, name: GroupName.NAVIGATOR })
          .select('group_id');

        const navigator_read_group_id: { group_id: number }[] = await knex('yars.group')
          .where({ initiative_id: housing_id, name: GroupName.NAVIGATOR_READ_ONLY })
          .select('group_id');

        const superviser_group_id: { group_id: number }[] = await knex('yars.group')
          .where({ initiative_id: housing_id, name: GroupName.SUPERVISOR })
          .select('group_id');

        const admin_group_id: { group_id: number }[] = await knex('yars.group')
          .where({ initiative_id: housing_id, name: GroupName.ADMIN })
          .select('group_id');

        const items: { group_id: number; role_id: number }[] = [];

        const addResourceRoles = async (group_id: number, resourceName: string, actionNames: string[]) => {
          if (actionNames.includes(Action.READ)) {
            const read_role_id: { role_id: number }[] = await knex('yars.role')
              .where({ name: `${resourceName}_VIEWER` })
              .select('role_id');

            items.push({
              group_id: group_id,
              role_id: read_role_id[0].role_id
            });
          }
        };

        // Add all navigator role mappings
        await addResourceRoles(navigator_group_id[0].group_id, Resource.REPORTING, [Action.READ]);
        // Add all navigator read only role mappings
        await addResourceRoles(navigator_read_group_id[0].group_id, Resource.REPORTING, [Action.READ]);
        // Add all supervisor role mappings
        await addResourceRoles(superviser_group_id[0].group_id, Resource.REPORTING, [Action.READ]);
        // Add all admin role mappings
        await addResourceRoles(admin_group_id[0].group_id, Resource.REPORTING, [Action.READ]);

        return knex('yars.group_role').insert(items);
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Remove group to role mappings for REPORTING
      .then(async () => {
        const viewerRole: { role_id: number }[] = await knex('yars.role')
          .where({ name: `${Resource.REPORTING}_VIEWER` })
          .select('role_id');
        if (viewerRole && viewerRole.length > 0) {
          return knex('yars.group_role').where({ role_id: viewerRole[0].role_id }).del();
        }
      })
      // Remove role to policy mappings for REPORTING
      .then(async () => {
        const viewerRole: { role_id: number }[] = await knex('yars.role')
          .where({ name: `${Resource.REPORTING}_VIEWER` })
          .select('role_id');
        if (viewerRole && viewerRole.length > 0) {
          return knex('yars.role_policy').where({ role_id: viewerRole[0].role_id }).del();
        }
      })
      // Remove the REPORTING_VIEWER role
      .then(() => {
        return knex('yars.role')
          .where({ name: `${Resource.REPORTING}_VIEWER` })
          .del();
      })
      // Remove the REPORTING policy (the READ policy)
      .then(async () => {
        const resourceRow: { resource_id: number } = await knex('yars.resource')
          .where({ name: Resource.REPORTING })
          .select('resource_id')
          .first<{ resource_id: number }>(); // TODO: This might be an issue templating this?
        if (resourceRow) {
          return knex('yars.policy').where({ resource_id: resourceRow.resource_id }).del();
        }
      })
      // Remove the REPORTING resource
      .then(() => {
        return knex('yars.resource').where({ name: Resource.REPORTING }).del();
      })
  );
}
