/**
 * Create CONTACT_UPDATER role (UPDATE only, no DELETE)
 * Map role to UPDATE policy on CONTACT
 * Swap PROPONENT + NAVIGATOR_READ_ONLY (PCNS) from CONTACT_EDITOR to CONTACT_UPDATER
 */

import type { Knex } from 'knex';
import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application';

const CONTACT_EDITOR = 'CONTACT_EDITOR';
const CONTACT_UPDATER = 'CONTACT_UPDATER';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()

      // Insert the new CONTACT_UPDATER role
      .then(() =>
        knex('yars.role')
          .insert({
            name: CONTACT_UPDATER,
            description: 'Can update contacts (no delete)'
          })
          .returning('role_id')
      )

      // Get IDs for the initiative, groups, roles, and policies
      .then(async ([{ role_id }]) => {
        const updaterRoleId = role_id;

        const { initiative_id } = await knex('initiative').where({ code: Initiative.PCNS }).first();

        const groupIds: number[] = await knex('yars.group')
          .where({ initiative_id })
          .whereIn('name', [GroupName.PROPONENT, GroupName.NAVIGATOR_READ_ONLY])
          .pluck('group_id');

        const [{ role_id: editorRoleId }] = await knex('yars.role').where({ name: CONTACT_EDITOR });

        const [{ resource_id }] = await knex('yars.resource').where({ name: Resource.CONTACT });

        const [{ action_id }] = await knex('yars.action').where({ name: Action.UPDATE });

        const [{ policy_id: updatePolicyId }] = await knex('yars.policy').where({ resource_id, action_id });

        return { groupIds, editorRoleId, updaterRoleId, updatePolicyId };
      })

      // Link UPDATE policy to CONTACT_UPDATER
      .then((ids) =>
        knex('yars.role_policy')
          .insert({ role_id: ids.updaterRoleId, policy_id: ids.updatePolicyId })
          .then(() => ids)
      )

      // Remove CONTACT_EDITOR & add CONTACT_UPDATER in group_role table for PROPONENT and NAVIGATOR_READ_ONLY
      .then(({ groupIds, editorRoleId, updaterRoleId }) => {
        return knex('yars.group_role')
          .whereIn('group_id', groupIds)
          .andWhere({ role_id: editorRoleId })
          .del()
          .then(() => {
            const groupRoles = groupIds.map((g) => ({ group_id: g, role_id: updaterRoleId }));
            return knex('yars.group_role').insert(groupRoles);
          });
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()

      // Get IDs for the initiative, groups, roles, and policies
      .then(async () => {
        const { initiative_id } = await knex('initiative').where({ code: Initiative.PCNS }).first();

        const groupIds: number[] = await knex('yars.group')
          .where({ initiative_id })
          .whereIn('name', [GroupName.PROPONENT, GroupName.NAVIGATOR_READ_ONLY])
          .pluck('group_id');

        const [{ role_id: editorRoleId }] = await knex('yars.role').where({ name: CONTACT_EDITOR });

        const [{ role_id: updaterRoleId }] = await knex('yars.role').where({ name: CONTACT_UPDATER });

        return { groupIds, editorRoleId, updaterRoleId };
      })

      // Remove CONTACT_UPDATER for PROPONENT and NAVIGATOR_READ_ONLY & restore CONTACT_EDITOR in group_role table
      .then(({ groupIds, editorRoleId, updaterRoleId }) => {
        return knex('yars.group_role')
          .whereIn('group_id', groupIds)
          .andWhere({ role_id: updaterRoleId })
          .del()
          .then(() => {
            const rows = groupIds.map((g) => ({ group_id: g, role_id: editorRoleId }));
            return knex('yars.group_role').insert(rows);
          })
          .then(() => updaterRoleId); // pass forward
      })

      // Drop role_policy link and the CONTACT_UPDATER role
      .then((updaterRoleId) =>
        knex('yars.role_policy')
          .where({ role_id: updaterRoleId })
          .del()
          .then(() => knex('yars.role').where({ role_id: updaterRoleId }).del())
      )
  );
}
