/* eslint-disable max-len */
import { v4 as uuidv4 } from 'uuid';

import stamps from '../stamps';
import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application';

import type { Knex } from 'knex';

const resources = [
  {
    name: Resource.ELECTRIFICATION_PROJECT
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
  return (
    Promise.resolve()
      .then(() => {
        const items = [
          {
            initiative_id: uuidv4(),
            code: 'ELECTRIFICATION',
            label: 'Electrification'
          }
        ];
        return knex('initiative').insert(items);
      })

      // Create public schema tables
      .then(() =>
        knex.schema.createTable('electrification_project', (table) => {
          table.uuid('electrification_project_id').primary();
          table
            .text('activity_id')
            .notNullable()
            .references('activity_id')
            .inTable('activity')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table.uuid('assigned_user_id').references('user_id').inTable('user').onUpdate('CASCADE').onDelete('CASCADE');
          table.timestamp('submitted_at', { useTz: true }).notNullable();
          stamps(knex, table);
        })
      )

      // Create before update triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_electrification_project_trigger
        BEFORE UPDATE ON electrification_project
        FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`)
      )

      // Create audit triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_electrification_project_trigger
        AFTER UPDATE OR DELETE ON electrification_project
        FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      // YARS
      // Insert the ELECTRIFICATION_PROJECT resource
      .then(() => {
        return knex('yars.resource').insert(resources);
      })

      // Add new groups for electrification initiative
      .then(async () => {
        const electrification_id = knex('initiative')
          .where({
            code: Initiative.ELECTRIFICATION
          })
          .select('initiative_id');

        const items = [
          {
            initiative_id: electrification_id,
            name: GroupName.PROPONENT,
            label: 'Proponent'
          },
          {
            initiative_id: electrification_id,
            name: GroupName.NAVIGATOR,
            label: 'Navigator'
          },
          {
            initiative_id: electrification_id,
            name: GroupName.NAVIGATOR_READ_ONLY,
            label: 'Navigator (Read-only)'
          },
          {
            initiative_id: electrification_id,
            name: GroupName.SUPERVISOR,
            label: 'Supervisor'
          },
          {
            initiative_id: electrification_id,
            name: GroupName.ADMIN,
            label: 'Admin'
          }
        ];
        return knex('yars.group').insert(items);
      })

      // Add policies
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

      // Add roles
      .then(() => {
        const items: Array<{ name: string; description: string }> = [];
        for (const resource of resources) {
          items.push(
            {
              name: `${resource.name.toUpperCase()}_CREATOR`,
              description: `Can create ${resource.name.toLowerCase()}s`
            },
            {
              name: `${resource.name.toUpperCase()}_VIEWER`,
              description: `Can view ${resource.name.toLowerCase()}s`
            },
            {
              name: `${resource.name.toUpperCase()}_EDITOR`,
              description: `Can edit ${resource.name.toLowerCase()}s`
            }
          );
        }
        return knex('yars.role').insert(items);
      })

      // Add role to policy mappings
      .then(async () => {
        const policies = await knex
          .select('p.policy_id', 'r.name as resource_name', 'a.name as action_name')
          .from({ p: 'yars.policy' })
          .innerJoin({ r: 'yars.resource' }, 'p.resource_id', '=', 'r.resource_id')
          .innerJoin({ a: 'yars.action' }, 'p.action_id', '=', 'a.action_id');

        const items: Array<{ role_id: number; policy_id: number }> = [];

        const addRolePolicies = async (resourceName: string) => {
          const creatorId = await knex('yars.role')
            .where({ name: `${resourceName.toUpperCase()}_CREATOR` })
            .select('role_id');
          const viewerId = await knex('yars.role')
            .where({ name: `${resourceName.toUpperCase()}_VIEWER` })
            .select('role_id');
          const editorId = await knex('yars.role')
            .where({ name: `${resourceName.toUpperCase()}_EDITOR` })
            .select('role_id');

          const resourcePolicies = policies.filter((x) => x.resource_name === resourceName);
          items.push(
            {
              role_id: creatorId[0].role_id,
              policy_id: resourcePolicies.find((x) => x.action_name == Action.CREATE).policy_id
            },
            {
              role_id: viewerId[0].role_id,
              policy_id: resourcePolicies.find((x) => x.action_name == Action.READ).policy_id
            },
            {
              role_id: editorId[0].role_id,
              policy_id: resourcePolicies.find((x) => x.action_name == Action.UPDATE).policy_id
            },

            {
              role_id: editorId[0].role_id,
              policy_id: resourcePolicies.find((x) => x.action_name == Action.DELETE).policy_id
            }
          );
        };

        await addRolePolicies(Resource.ELECTRIFICATION_PROJECT);

        return knex('yars.role_policy').insert(items);
      })

      // Add group to role mappings for ELECTRIFICATION_PROJECT
      .then(async () => {
        const electrification_id = await knex('initiative')
          .where({
            code: Initiative.ELECTRIFICATION
          })
          .select('initiative_id');

        const navigator_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.NAVIGATOR })
          .select('group_id');

        const navigator_read_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.NAVIGATOR_READ_ONLY })
          .select('group_id');

        const superviser_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.SUPERVISOR })
          .select('group_id');

        const admin_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.ADMIN })
          .select('group_id');

        const proponent_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.PROPONENT })
          .select('group_id');

        const items: Array<{ group_id: number; role_id: number }> = [];

        const addResourceRoles = async (group_id: number, resourceName: Resource, actionNames: Array<Action>) => {
          if (actionNames.includes(Action.CREATE)) {
            items.push({
              group_id: group_id,
              role_id: (
                await knex('yars.role')
                  .where({ name: `${resourceName}_CREATOR` })
                  .select('role_id')
              )[0].role_id
            });
          }

          if (actionNames.includes(Action.READ)) {
            items.push({
              group_id: group_id,
              role_id: (
                await knex('yars.role')
                  .where({ name: `${resourceName}_VIEWER` })
                  .select('role_id')
              )[0].role_id
            });
          }

          if (actionNames.includes(Action.UPDATE) || actionNames.includes(Action.DELETE)) {
            items.push({
              group_id: group_id,
              role_id: (
                await knex('yars.role')
                  .where({ name: `${resourceName}_EDITOR` })
                  .select('role_id')
              )[0].role_id
            });
          }
        };

        // Note: Only UPDATE or DELETE is required to be given EDITOR role, don't include both
        // prettier-ignore
        {
          // Add all navigator role mappings
          await addResourceRoles(navigator_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);

          // Add all navigator read only role mappings
          await addResourceRoles(navigator_read_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.READ]);

          // Add all supervisor role mappings
          await addResourceRoles(superviser_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);

          // Add all admin role mappings
          await addResourceRoles(admin_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.READ]);

          // Add all proponent role mappings
          await addResourceRoles(proponent_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);
        }
        return knex('yars.group_role').insert(items);
      })

      .then(async () => {
        /*
         * Attach scope attributes to all non CREATE ELECTRIFICATION_PROJECT policies
         */

        const action_create_id = await knex('yars.action').where({ name: Action.CREATE }).select('action_id');

        const electrification_resource_id = await knex('yars.resource')
          .where({ name: Resource.ELECTRIFICATION_PROJECT })
          .select('resource_id');

        const scopeAllId = await knex('yars.attribute').where({ name: 'scope:all' }).select('attribute_id');
        const scopeSelfId = await knex('yars.attribute').where({ name: 'scope:self' }).select('attribute_id');

        const policies = await knex('yars.policy')
          .where({ resource_id: electrification_resource_id[0].resource_id })
          .whereNot({ action_id: action_create_id[0].action_id })
          .select('policy_id');

        const items: Array<{ policy_id: number; attribute_id: number }> = [];

        for (const policy of policies) {
          items.push({ policy_id: policy.policy_id, attribute_id: scopeAllId[0].attribute_id });
          items.push({ policy_id: policy.policy_id, attribute_id: scopeSelfId[0].attribute_id });
        }

        return knex('yars.policy_attribute').insert(items);
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Remove YARS
      // Remove group to role mappings for ELECTRIFICATION_PROJECT
      .then(async () => {
        const creatorRole = await knex('yars.role')
          .where({ name: `${Resource.ELECTRIFICATION_PROJECT}_CREATOR` })
          .select('role_id');
        const viewerRole = await knex('yars.role')
          .where({ name: `${Resource.ELECTRIFICATION_PROJECT}_VIEWER` })
          .select('role_id');
        const editorRole = await knex('yars.role')
          .where({ name: `${Resource.ELECTRIFICATION_PROJECT}_EDITOR` })
          .select('role_id');
        if (creatorRole && creatorRole.length > 0) {
          await knex('yars.group_role').where({ role_id: creatorRole[0].role_id }).del();
        }
        if (viewerRole && viewerRole.length > 0) {
          await knex('yars.group_role').where({ role_id: viewerRole[0].role_id }).del();
        }
        if (editorRole && editorRole.length > 0) {
          await knex('yars.group_role').where({ role_id: editorRole[0].role_id }).del();
        }
      })

      // Remove role to policy mappings for ELECTRIFICATION_PROJECT
      .then(async () => {
        const creatorRole = await knex('yars.role')
          .where({ name: `${Resource.ELECTRIFICATION_PROJECT}_CREATOR` })
          .select('role_id');
        const viewerRole = await knex('yars.role')
          .where({ name: `${Resource.ELECTRIFICATION_PROJECT}_VIEWER` })
          .select('role_id');
        const editorRole = await knex('yars.role')
          .where({ name: `${Resource.ELECTRIFICATION_PROJECT}_EDITOR` })
          .select('role_id');
        if (creatorRole && creatorRole.length > 0) {
          await knex('yars.role_policy').where({ role_id: creatorRole[0].role_id }).del();
        }
        if (viewerRole && viewerRole.length > 0) {
          await knex('yars.role_policy').where({ role_id: viewerRole[0].role_id }).del();
        }
        if (editorRole && editorRole.length > 0) {
          await knex('yars.role_policy').where({ role_id: editorRole[0].role_id }).del();
        }
      })

      // Remove the ELECTRIFICATION_PROJECT roles
      .then(async () => {
        await knex('yars.role')
          .where({ name: `${Resource.ELECTRIFICATION_PROJECT}_CREATOR` })
          .del();
        await knex('yars.role')
          .where({ name: `${Resource.ELECTRIFICATION_PROJECT}_VIEWER` })
          .del();
        await knex('yars.role')
          .where({ name: `${Resource.ELECTRIFICATION_PROJECT}_EDITOR` })
          .del();
      })

      // Remove the ELECTRIFICATION_PROJECT policies
      .then(async () => {
        const resourceRow = await knex('yars.resource')
          .where({ name: Resource.ELECTRIFICATION_PROJECT })
          .select('resource_id')
          .first();
        if (resourceRow) {
          return knex('yars.policy').where({ resource_id: resourceRow.resource_id }).del();
        }
      })

      // Remove the ELECTRIFICATION_PROJECT groups
      .then(async () => {
        const electrificationRow = await knex('initiative')
          .where({
            code: Initiative.ELECTRIFICATION
          })
          .select('initiative_id')
          .first();

        if (electrificationRow) {
          return knex('yars.group').where({ initiative_id: electrificationRow.initiative_id }).del();
        }
      })

      // Remove the ELECTRIFICATION_PROJECT resource
      .then(() => {
        return knex('yars.resource').where({ name: Resource.ELECTRIFICATION_PROJECT }).del();
      })

      // Drop audit triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_electrification_project_trigger ON draft'))

      // Drop public schema table triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_electrification_project_trigger ON draft'))

      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('electrification_project'))

      // Delete data
      .then(() => knex('initiative').where('code', 'ELECTRIFICATION').del())
  );
}
