/* eslint-disable max-len */
import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application';

import type { Knex } from 'knex';
import {
  addGroupRoles,
  addGroups,
  addPolicies,
  addResources,
  addRolePolicies,
  addRoles,
  deleteGroupRoles,
  deletePolicies,
  deleteResources,
  deleteRolePolicies,
  deleteRoles,
  getGroupId,
  getInitiativeId
} from '../utils/yars';

const resources = [Resource.YARS];
const actions = [Action.READ, Action.DELETE];

/*
This migration creates a new groups under the PCNS initiative and
updates group_role mappings for ATS/CONTACT/REPORTING/SSO/USER to use the
new global initiative instead of housing
*/
export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // YARS
      .then(async () => {
        console.log('1');
        return await addResources(knex, resources);
      })

      .then(async () => {
        console.log('2');
        return await addPolicies(knex, resources, actions);
      })

      .then(async () => {
        console.log('3');
        return await addRoles(knex, resources, actions);
      })

      .then(async () => {
        console.log('4');
        return await addRolePolicies(knex, resources, actions);
      })

      .then(async () => {
        console.log('5');
        const electrification_id = await getInitiativeId(knex, Initiative.ELECTRIFICATION);
        console.log(electrification_id);
        const housing_id = await getInitiativeId(knex, Initiative.HOUSING);
        console.log(housing_id);

        const elec_supervisor_group_id = await getGroupId(knex, electrification_id, GroupName.SUPERVISOR);
        console.log(elec_supervisor_group_id);
        const elec_admin_group_id = await getGroupId(knex, electrification_id, GroupName.ADMIN);
        console.log(elec_admin_group_id);
        const housing_supervisor_group_id = await getGroupId(knex, housing_id, GroupName.SUPERVISOR);
        console.log(housing_supervisor_group_id);
        const housing_admin_group_id = await getGroupId(knex, housing_id, GroupName.ADMIN);
        console.log(housing_admin_group_id);

        // prettier-ignore
        {
          // Add all supervisor role mappings
          await addGroupRoles(knex, elec_supervisor_group_id, Resource.YARS, [Action.READ]);
          await addGroupRoles(knex, housing_supervisor_group_id, Resource.YARS, [Action.READ]);

          // Add all admin role mappings
          await addGroupRoles(knex, elec_admin_group_id, Resource.YARS, [Action.READ, Action.DELETE]);
          await addGroupRoles(knex, housing_admin_group_id, Resource.YARS, [Action.READ, Action.DELETE]);
        }
      })

      // Add new groups for PCNS initiative
      .then(async () => {
        console.log('6');
        const groups = [
          {
            name: GroupName.PROPONENT,
            label: 'Proponent'
          },
          {
            name: GroupName.NAVIGATOR,
            label: 'Navigator'
          },
          {
            name: GroupName.NAVIGATOR_READ_ONLY,
            label: 'Navigator (Read-only)'
          },
          {
            name: GroupName.SUPERVISOR,
            label: 'Supervisor'
          },
          {
            name: GroupName.ADMIN,
            label: 'Admin'
          }
        ];

        return await addGroups(knex, Initiative.PCNS, groups);
      })

      // Update policies
      .then(async () => {
        console.log('7');
        const pcns_id = await getInitiativeId(knex, Initiative.PCNS);
        console.log(pcns_id);
        const pcns_navigator_group_id = await getGroupId(knex, pcns_id, GroupName.NAVIGATOR);
        const pcns_navigator_read_group_id = await getGroupId(knex, pcns_id, GroupName.NAVIGATOR_READ_ONLY);
        const pcns_supervisor_group_id = await getGroupId(knex, pcns_id, GroupName.SUPERVISOR);
        const pcns_admin_group_id = await getGroupId(knex, pcns_id, GroupName.ADMIN);
        const pcns_proponent_group_id = await getGroupId(knex, pcns_id, GroupName.PROPONENT);

        console.log(pcns_navigator_group_id);
        console.log(pcns_navigator_read_group_id);
        console.log(pcns_supervisor_group_id);
        console.log(pcns_admin_group_id);
        console.log(pcns_proponent_group_id);

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

        console.log(data);

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
            group_id: pcns_navigator_group_id
          });

        await knex('yars.group_role')
          .where({ group_id: navigator_read[0].group_id })
          .whereIn(
            'role_id',
            navigator_read.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: pcns_navigator_read_group_id
          });

        await knex('yars.group_role')
          .where({ group_id: supervisor[0].group_id })
          .whereIn(
            'role_id',
            supervisor.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: pcns_supervisor_group_id
          });

        await knex('yars.group_role')
          .where({ group_id: admin[0].group_id })
          .whereIn(
            'role_id',
            admin.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: pcns_admin_group_id
          });

        await knex('yars.group_role')
          .where({ group_id: proponent[0].group_id })
          .whereIn(
            'role_id',
            proponent.map((x: any) => x.role_id) // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .update({
            group_id: pcns_proponent_group_id
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

      // Remove group to role mappings for YARS
      .then(async () => {
        return await deleteGroupRoles(knex, Resource.YARS, actions);
      })

      // Remove role to policy mappings for YARS
      .then(async () => {
        return await deleteRolePolicies(knex, Resource.YARS, actions);
      })

      // Remove the YARS roles
      .then(async () => {
        return await deleteRoles(knex, Resource.YARS, actions);
      })

      // Remove the YARS policies
      .then(async () => {
        return await deletePolicies(knex, resources);
      })

      // Remove the YARS resource
      .then(async () => {
        return await deleteResources(knex, resources);
      })
  );
}
