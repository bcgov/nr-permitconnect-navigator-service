import type { Knex } from 'knex';

import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application.ts';

const resources = [
  {
    name: Resource.ATS
  }
];

const actions = [
  {
    name: Action.CREATE
  },
  {
    name: Action.READ
  },
  {
    name: Action.UPDATE
  },
  {
    name: Action.DELETE
  }
];

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()

    .then(() => {
      return knex('yars.resource').insert(resources);
    })

    .then(() => {
      /*
       * Add policies
       */

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

    .then(async () => {
      /*
       * Add roles
       */

      const items: { name: string; description: string }[] = [];

      const addRolesForResource = (resourceName: string) => {
        items.push(
          {
            name: `${resourceName.toUpperCase()}_CREATOR`,
            description: `Can create ${resourceName.toLowerCase()}s`
          },
          {
            name: `${resourceName.toUpperCase()}_VIEWER`,
            description: `Can view ${resourceName.toLowerCase()}s`
          },
          {
            name: `${resourceName.toUpperCase()}_EDITOR`,
            description: `Can edit ${resourceName.toLowerCase()}s`
          }
        );
      };

      for (const resource of resources) {
        addRolesForResource(resource.name);
      }

      return knex('yars.role').insert(items);
    })

    .then(async () => {
      /*
       * Add role to policy mappings
       */

      const policies: { policy_id: number; resource_name: string; action_name: Action }[] = await knex
        .select('p.policy_id', 'r.name as resource_name', 'a.name as action_name')
        .from({ p: 'yars.policy' })
        .innerJoin({ r: 'yars.resource' }, 'p.resource_id', '=', 'r.resource_id')
        .innerJoin({ a: 'yars.action' }, 'p.action_id', '=', 'a.action_id');

      const items: { role_id: number; policy_id: number }[] = [];

      const addRolePolicies = async (resourceName: string) => {
        const creatorId: { role_id: number }[] = await knex('yars.role')
          .where({ name: `${resourceName.toUpperCase()}_CREATOR` })
          .select('role_id');
        const viewerId: { role_id: number }[] = await knex('yars.role')
          .where({ name: `${resourceName.toUpperCase()}_VIEWER` })
          .select('role_id');
        const editorId: { role_id: number }[] = await knex('yars.role')
          .where({ name: `${resourceName.toUpperCase()}_EDITOR` })
          .select('role_id');

        const resourcePolicies = policies.filter((x) => x.resource_name === resourceName);
        items.push(
          {
            role_id: creatorId[0].role_id,
            policy_id: resourcePolicies.find((x) => x.action_name == Action.CREATE)!.policy_id
          },
          {
            role_id: viewerId[0].role_id,
            policy_id: resourcePolicies.find((x) => x.action_name == Action.READ)!.policy_id
          },
          {
            role_id: editorId[0].role_id,
            policy_id: resourcePolicies.find((x) => x.action_name == Action.UPDATE)!.policy_id
          },

          {
            role_id: editorId[0].role_id,
            policy_id: resourcePolicies.find((x) => x.action_name == Action.DELETE)!.policy_id
          }
        );
      };

      await addRolePolicies(Resource.ATS);

      return knex('yars.role_policy').insert(items);
    })

    .then(async () => {
      /*
       * Add group to role mappings
       */

      const housing_id = knex('initiative')
        .where({
          code: Initiative.HOUSING
        })
        .select('initiative_id');

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

      const addResourceRoles = async (group_id: number, resourceName: Resource, actionNames: Action[]) => {
        if (actionNames.includes(Action.CREATE)) {
          const creator_role_id: { role_id: number }[] = await knex('yars.role')
            .where({ name: `${resourceName}_CREATOR` })
            .select('role_id');

          items.push({
            group_id: group_id,
            role_id: creator_role_id[0].role_id
          });
        }

        if (actionNames.includes(Action.READ)) {
          const read_role_id: { role_id: number }[] = await knex('yars.role')
            .where({ name: `${resourceName}_VIEWER` })
            .select('role_id');

          items.push({
            group_id: group_id,
            role_id: read_role_id[0].role_id
          });
        }

        if (actionNames.includes(Action.UPDATE) || actionNames.includes(Action.DELETE)) {
          const update_role_id: { role_id: number }[] = await knex('yars.role')
            .where({ name: `${resourceName}_EDITOR` })
            .select('role_id');

          items.push({
            group_id: group_id,
            role_id: update_role_id[0].role_id
          });
        }
      };

      // Note: Only UPDATE or DELETE is required to be given EDITOR role, don't include both
      // prettier-ignore
      {
        // Add all navigator role mappings
        await addResourceRoles(navigator_group_id[0].group_id, Resource.ATS, [Action.CREATE, Action.READ]);

        // Add all navigator read only role mappings
        await addResourceRoles(navigator_read_group_id[0].group_id, Resource.ATS, [Action.READ]);


        // Add all supervisor role mappings
        await addResourceRoles(superviser_group_id[0].group_id, Resource.ATS, [Action.CREATE, Action.READ]);

        // Add all admin role mappings
        await addResourceRoles(admin_group_id[0].group_id, Resource.ATS, [Action.READ]);

      }
      return knex('yars.group_role').insert(items);
    });
}

export async function down(): Promise<void> {
  return Promise.resolve();
}
