/* eslint-disable max-len */
import { GroupName, Initiative } from '../../utils/enums/application';

import type { Knex } from 'knex';

/*
TODO
Deal with YARS permissions somehow. Currently not protected
*/

/*
This migration creates a new groups under the PCNS initiative and
updates group_role mappings for ATS/CONTACT/REPORTING/SSO/USER to use the
new global initiative instead of housing
*/
export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // YARS
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
        /*
        SELECT
          "group".group_id,
          role.role_id,
          initiative.code AS initiative_code,
          "group".name AS group_name,
          role.name AS role_name,
          policy.policy_id
        FROM yars."group"
          JOIN initiative ON "group".initiative_id = initiative.initiative_id
          JOIN yars.group_role ON group_role.group_id = "group".group_id
          JOIN yars.role ON role.role_id = group_role.role_id
          JOIN yars.role_policy ON role_policy.role_id = role.role_id
          JOIN yars.policy ON policy.policy_id = role_policy.policy_id
          JOIN yars.resource ON resource.resource_id = policy.resource_id
        WHERE
          initiative.code = 'HOUSING' and
          resource.name in ('ATS', 'CONTACT', 'SSO', 'USER')
        */

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
  );
}
