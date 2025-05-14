/* eslint-disable max-len */
import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application';

import type { Knex } from 'knex';

const resources = [
  {
    name: Resource.YARS
  }
];

const actions = [
  {
    name: Action.READ
  },
  {
    name: Action.DELETE
  }
];

/*
This migration creates a new groups under the PCNS initiative and
updates group_role mappings for ATS/CONTACT/REPORTING/SSO/USER to use the
new global initiative instead of housing
*/
export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // YARS
      .then(() => {
        return knex('yars.resource').insert(resources);
      })

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

      .then(() => {
        const items: Array<{ name: string; description: string }> = [];
        for (const resource of resources) {
          items.push(
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

      .then(async () => {
        const policies = await knex
          .select('p.policy_id', 'r.name as resource_name', 'a.name as action_name')
          .from({ p: 'yars.policy' })
          .innerJoin({ r: 'yars.resource' }, 'p.resource_id', '=', 'r.resource_id')
          .innerJoin({ a: 'yars.action' }, 'p.action_id', '=', 'a.action_id');

        const items: Array<{ role_id: number; policy_id: number }> = [];

        const addRolePolicies = async (resourceName: string) => {
          const viewerId = await knex('yars.role')
            .where({ name: `${resourceName.toUpperCase()}_VIEWER` })
            .select('role_id');
          const editorId = await knex('yars.role')
            .where({ name: `${resourceName.toUpperCase()}_EDITOR` })
            .select('role_id');

          const resourcePolicies = policies.filter((x) => x.resource_name === resourceName);
          items.push(
            {
              role_id: viewerId[0].role_id,
              policy_id: resourcePolicies.find((x) => x.action_name == Action.READ).policy_id
            },
            {
              role_id: editorId[0].role_id,
              policy_id: resourcePolicies.find((x) => x.action_name == Action.DELETE).policy_id
            }
          );
        };

        await addRolePolicies(Resource.YARS);

        return knex('yars.role_policy').insert(items);
      })

      // Add new groups for PCNS initiative
      .then(async () => {
        const pcns_id = knex('initiative')
          .where({
            code: Initiative.PCNS
          })
          .select('initiative_id');

        const items = [
          {
            initiative_id: pcns_id,
            name: GroupName.PROPONENT,
            label: 'Proponent'
          },
          {
            initiative_id: pcns_id,
            name: GroupName.NAVIGATOR,
            label: 'Navigator'
          },
          {
            initiative_id: pcns_id,
            name: GroupName.NAVIGATOR_READ_ONLY,
            label: 'Navigator (Read-only)'
          },
          {
            initiative_id: pcns_id,
            name: GroupName.SUPERVISOR,
            label: 'Supervisor'
          },
          {
            initiative_id: pcns_id,
            name: GroupName.ADMIN,
            label: 'Admin'
          }
        ];
        return knex('yars.group').insert(items);
      })

      // Update policies
      .then(async () => {
        const pcns_id = await knex('initiative')
          .where({
            code: Initiative.PCNS
          })
          .select('initiative_id');

        const pcns_navigator_group_id = await knex('yars.group')
          .where({ initiative_id: pcns_id[0].initiative_id, name: GroupName.NAVIGATOR })
          .select('group_id');

        const pcns_navigator_read_group_id = await knex('yars.group')
          .where({ initiative_id: pcns_id[0].initiative_id, name: GroupName.NAVIGATOR_READ_ONLY })
          .select('group_id');

        const pcns_supervisor_group_id = await knex('yars.group')
          .where({ initiative_id: pcns_id[0].initiative_id, name: GroupName.SUPERVISOR })
          .select('group_id');

        const pcns_admin_group_id = await knex('yars.group')
          .where({ initiative_id: pcns_id[0].initiative_id, name: GroupName.ADMIN })
          .select('group_id');

        const pcns_proponent_group_id = await knex('yars.group')
          .where({ initiative_id: pcns_id[0].initiative_id, name: GroupName.PROPONENT })
          .select('group_id');

        // Get all necessary data
        // Filterable by group_name
        const data = await knex
          .raw(
            `SELECT
          "group".group_id,
          role.role_id,
          initiative.code AS initiative_code,
          "group".name AS group_name,
          role.name AS role_name
        FROM yars."group"
          JOIN initiative ON "group".initiative_id = initiative.initiative_id
          JOIN yars.group_role ON group_role.group_id = "group".group_id
          JOIN yars.role ON role.role_id = group_role.role_id
          JOIN yars.role_policy ON role_policy.role_id = role.role_id
          JOIN yars.policy ON policy.policy_id = role_policy.policy_id
          JOIN yars.resource ON resource.resource_id = policy.resource_id
        WHERE
          initiative.code = 'HOUSING' and
          resource.name in ('ATS', 'CONTACT', 'REPORTING', 'SSO', 'USER')`
          )
          .then((res) => {
            return res.rows;
          });

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const navigator = data.filter((x: any) => x.group_name === GroupName.NAVIGATOR);
        const navigator_read = data.filter((x: any) => x.group_name === GroupName.NAVIGATOR_READ_ONLY);
        const supervisor = data.filter((x: any) => x.group_name === GroupName.SUPERVISOR);
        const admin = data.filter((x: any) => x.group_name === GroupName.ADMIN);
        const proponent = data.filter((x: any) => x.group_name === GroupName.PROPONENT);
        /* eslint-enable @typescript-eslint/no-explicit-any */

        await knex('yars.group_role')
          .where({ group_id: navigator[0].group_id })
          .whereIn(
            'role_id',
            navigator.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: pcns_navigator_group_id[0].group_id
          });

        await knex('yars.group_role')
          .where({ group_id: navigator_read[0].group_id })
          .whereIn(
            'role_id',
            navigator_read.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: pcns_navigator_read_group_id[0].group_id
          });

        await knex('yars.group_role')
          .where({ group_id: supervisor[0].group_id })
          .whereIn(
            'role_id',
            supervisor.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: pcns_supervisor_group_id[0].group_id
          });

        await knex('yars.group_role')
          .where({ group_id: admin[0].group_id })
          .whereIn(
            'role_id',
            admin.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: pcns_admin_group_id[0].group_id
          });

        await knex('yars.group_role')
          .where({ group_id: proponent[0].group_id })
          .whereIn(
            'role_id',
            proponent.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: pcns_proponent_group_id[0].group_id
          });
      })

      .then(async () => {
        const pcns_id = await knex('initiative')
          .where({
            code: Initiative.PCNS
          })
          .select('initiative_id');

        const pcns_supervisor_group_id = await knex('yars.group')
          .where({ initiative_id: pcns_id[0].initiative_id, name: GroupName.SUPERVISOR })
          .select('group_id');

        const pcns_admin_group_id = await knex('yars.group')
          .where({ initiative_id: pcns_id[0].initiative_id, name: GroupName.ADMIN })
          .select('group_id');
        const items: Array<{ group_id: number; role_id: number }> = [];

        const addResourceRoles = async (group_id: number, resourceName: Resource, actionNames: Array<Action>) => {
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

          if (actionNames.includes(Action.DELETE)) {
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
          // Add role mappings
          await addResourceRoles(pcns_supervisor_group_id[0].group_id, Resource.YARS, [Action.READ]);
          await addResourceRoles(pcns_admin_group_id[0].group_id, Resource.YARS, [Action.READ, Action.DELETE]);
        }
        return knex('yars.group_role').insert(items);
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Revert policies
      .then(async () => {
        const housing_id = await knex('initiative')
          .where({
            code: Initiative.HOUSING
          })
          .select('initiative_id');

        const housing_navigator_group_id = await knex('yars.group')
          .where({ initiative_id: housing_id[0].initiative_id, name: GroupName.NAVIGATOR })
          .select('group_id');

        const housing_navigator_read_group_id = await knex('yars.group')
          .where({ initiative_id: housing_id[0].initiative_id, name: GroupName.NAVIGATOR_READ_ONLY })
          .select('group_id');

        const housing_supervisor_group_id = await knex('yars.group')
          .where({ initiative_id: housing_id[0].initiative_id, name: GroupName.SUPERVISOR })
          .select('group_id');

        const housing_admin_group_id = await knex('yars.group')
          .where({ initiative_id: housing_id[0].initiative_id, name: GroupName.ADMIN })
          .select('group_id');

        const housing_proponent_group_id = await knex('yars.group')
          .where({ initiative_id: housing_id[0].initiative_id, name: GroupName.PROPONENT })
          .select('group_id');

        // Get all necessary data
        // Filterable by group_name
        const data = await knex
          .raw(
            `SELECT
          "group".group_id,
          role.role_id,
          initiative.code AS initiative_code,
          "group".name AS group_name,
          role.name AS role_name
        FROM yars."group"
          JOIN initiative ON "group".initiative_id = initiative.initiative_id
          JOIN yars.group_role ON group_role.group_id = "group".group_id
          JOIN yars.role ON role.role_id = group_role.role_id
          JOIN yars.role_policy ON role_policy.role_id = role.role_id
          JOIN yars.policy ON policy.policy_id = role_policy.policy_id
          JOIN yars.resource ON resource.resource_id = policy.resource_id
        WHERE
          initiative.code = 'PCNS' and
          resource.name in ('ATS', 'CONTACT', 'REPORTING', 'SSO', 'USER')`
          )
          .then((res) => {
            return res.rows;
          });

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const navigator = data.filter((x: any) => x.group_name === GroupName.NAVIGATOR);
        const navigator_read = data.filter((x: any) => x.group_name === GroupName.NAVIGATOR_READ_ONLY);
        const supervisor = data.filter((x: any) => x.group_name === GroupName.SUPERVISOR);
        const admin = data.filter((x: any) => x.group_name === GroupName.ADMIN);
        const proponent = data.filter((x: any) => x.group_name === GroupName.PROPONENT);
        /* eslint-enable @typescript-eslint/no-explicit-any */

        await knex('yars.group_role')
          .where({ group_id: navigator[0].group_id })
          .whereIn(
            'role_id',
            navigator.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: housing_navigator_group_id[0].group_id
          });

        await knex('yars.group_role')
          .where({ group_id: navigator_read[0].group_id })
          .whereIn(
            'role_id',
            navigator_read.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: housing_navigator_read_group_id[0].group_id
          });

        await knex('yars.group_role')
          .where({ group_id: supervisor[0].group_id })
          .whereIn(
            'role_id',
            supervisor.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: housing_supervisor_group_id[0].group_id
          });

        await knex('yars.group_role')
          .where({ group_id: admin[0].group_id })
          .whereIn(
            'role_id',
            admin.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: housing_admin_group_id[0].group_id
          });

        await knex('yars.group_role')
          .where({ group_id: proponent[0].group_id })
          .whereIn(
            'role_id',
            proponent.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: housing_proponent_group_id[0].group_id
          });
      })

      // Remove new groups for PCNS initiative
      .then(async () => {
        const pcns_id = await knex('initiative')
          .where({
            code: Initiative.PCNS
          })
          .select('initiative_id')
          .first();

        if (pcns_id) {
          await knex('yars.group').where({ initiative_id: pcns_id.initiative_id, name: GroupName.ADMIN }).del();
          await knex('yars.group').where({ initiative_id: pcns_id.initiative_id, name: GroupName.NAVIGATOR }).del();
          await knex('yars.group')
            .where({ initiative_id: pcns_id.initiative_id, name: GroupName.NAVIGATOR_READ_ONLY })
            .del();
          await knex('yars.group').where({ initiative_id: pcns_id.initiative_id, name: GroupName.SUPERVISOR }).del();
          await knex('yars.group').where({ initiative_id: pcns_id.initiative_id, name: GroupName.PROPONENT }).del();
        }
      })

      // Remove group to role mappings for YARS
      .then(async () => {
        const viewerRole = await knex('yars.role')
          .where({ name: `${Resource.YARS}_VIEWER` })
          .select('role_id');
        const editorRole = await knex('yars.role')
          .where({ name: `${Resource.YARS}_EDITOR` })
          .select('role_id');
        if (viewerRole && viewerRole.length > 0) {
          await knex('yars.group_role').where({ role_id: viewerRole[0].role_id }).del();
        }
        if (editorRole && editorRole.length > 0) {
          await knex('yars.group_role').where({ role_id: editorRole[0].role_id }).del();
        }
      })

      // Remove role to policy mappings for YARS
      .then(async () => {
        const viewerRole = await knex('yars.role')
          .where({ name: `${Resource.YARS}_VIEWER` })
          .select('role_id');
        const editorRole = await knex('yars.role')
          .where({ name: `${Resource.YARS}_EDITOR` })
          .select('role_id');
        if (viewerRole && viewerRole.length > 0) {
          await knex('yars.role_policy').where({ role_id: viewerRole[0].role_id }).del();
        }
        if (editorRole && editorRole.length > 0) {
          await knex('yars.role_policy').where({ role_id: editorRole[0].role_id }).del();
        }
      })

      // Remove the YARS roles
      .then(async () => {
        await knex('yars.role')
          .where({ name: `${Resource.YARS}_VIEWER` })
          .del();
        await knex('yars.role')
          .where({ name: `${Resource.YARS}_EDITOR` })
          .del();
      })

      // Remove the YARS policies
      .then(async () => {
        const resourceRow = await knex('yars.resource').where({ name: Resource.YARS }).select('resource_id').first();
        if (resourceRow) {
          return knex('yars.policy').where({ resource_id: resourceRow.resource_id }).del();
        }
      })

      // Remove the YARS resource
      .then(() => {
        return knex('yars.resource').where({ name: Resource.YARS }).del();
      })
  );
}
