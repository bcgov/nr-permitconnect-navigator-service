/* eslint-disable max-len */
import type { Knex } from 'knex';

import * as yars from '../utils/yars.ts';
import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application.ts';

const resources = [Resource.ACTIVITY_CONTACT];
const actions = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE];

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() =>
        knex.schema.alterTable('activity_contact', function (table) {
          table
            .enu('role', ['PRIMARY', 'ADMIN', 'MEMBER'], {
              useNative: true,
              enumName: 'activity_contact_role_enum'
            })
            .defaultTo('MEMBER')
            .notNullable();
        })
      )

      // Set every existing activity_contact to PRIMARY as they are all the creators at this point
      .then(() => knex('activity_contact').update({ role: 'PRIMARY' }))

      // YARS
      .then(async () => {
        await yars.addAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.NAVIGATOR, 'scope:all');
        await yars.addAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.NAVIGATOR_READ_ONLY, 'scope:all');
        await yars.addAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.SUPERVISOR, 'scope:all');
        await yars.addAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.ADMIN, 'scope:all');
        await yars.addAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.PROPONENT, 'scope:self');
      })

      .then(async () => {
        await yars.addAttributeGroup(knex, Initiative.PCNS, GroupName.NAVIGATOR, 'scope:all');
        await yars.addAttributeGroup(knex, Initiative.PCNS, GroupName.NAVIGATOR_READ_ONLY, 'scope:all');
        await yars.addAttributeGroup(knex, Initiative.PCNS, GroupName.SUPERVISOR, 'scope:all');
        await yars.addAttributeGroup(knex, Initiative.PCNS, GroupName.ADMIN, 'scope:all');
        await yars.addAttributeGroup(knex, Initiative.PCNS, GroupName.PROPONENT, 'scope:self');
      })

      .then(async () => {
        await yars.addResources(knex, resources);
      })

      .then(async () => {
        await yars.addPolicies(knex, resources, actions);
      })

      .then(async () => {
        await yars.addRoles(knex, resources, actions);
      })

      .then(async () => {
        await yars.addRolePolicies(knex, resources, actions);
      })

      .then(async () => {
        // prettier-ignore
        {
          // Add all NAVIGATOR role mappings
          await yars.addGroupRoles(knex, Initiative.PCNS, GroupName.NAVIGATOR, Resource.ACTIVITY_CONTACT, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]);

          // Add all NAVIGATOR_READ_ONLY role mappings
          await yars.addGroupRoles(knex, Initiative.PCNS, GroupName.NAVIGATOR_READ_ONLY, Resource.ACTIVITY_CONTACT, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]);

          // Add all SUPERVISOR role mappings
          await yars.addGroupRoles(knex, Initiative.PCNS, GroupName.SUPERVISOR, Resource.ACTIVITY_CONTACT, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]);

          // Add all ADMIN role mappings
          await yars.addGroupRoles(knex, Initiative.PCNS, GroupName.ADMIN, Resource.ACTIVITY_CONTACT, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]);

          // Add PROPONENT role mappings
          await yars.addGroupRoles(knex, Initiative.PCNS, GroupName.PROPONENT, Resource.ACTIVITY_CONTACT, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]);
        }
      })

      .then(async () => {
        await yars.addPolicyAttributes(
          knex,
          Resource.ACTIVITY_CONTACT,
          [Action.READ, Action.UPDATE, Action.DELETE],
          ['scope:all', 'scope:self']
        );
      })

      .then(() => knex.schema.withSchema('yars').dropViewIfExists('group_role_policy_vw'))

      .then(async () => {
        await knex.raw(`create view yars.group_role_policy_vw as select
          row_number() OVER (),
          yars.group.group_id,
          public.initiative.code as initiative_code,
          yars.group.name as group_name,
          yars.role.name as role_name,
          yars.policy.policy_id as policy_id,
          yars.resource.name as resource_name,
          yars.action.name as action_name,
          attribute.name AS attribute_name
        from yars.group
        inner join public.initiative on yars.group.initiative_id = public.initiative.initiative_id
        inner join yars.group_role on yars.group_role.group_id = yars.group.group_id
        inner join yars.role on yars.role.role_id = yars.group_role.role_id
        inner join yars.role_policy on yars.role_policy.role_id = yars.role.role_id
        inner join yars.policy on yars.policy.policy_id = yars.role_policy.policy_id
        inner join yars.resource on resource.resource_id = yars.policy.resource_id
        inner join yars.action on yars.action.action_id = yars.policy.action_id
        inner join yars.attribute_group on yars.attribute_group.group_id = yars.group.group_id
        left join yars.policy_attribute ON yars.policy_attribute.policy_id = yars.role_policy.policy_id and yars.policy_attribute.attribute_id = yars.attribute_group.attribute_id
        left join yars.attribute on yars.attribute.attribute_id = yars.policy_attribute.attribute_id`);
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() => knex.schema.withSchema('yars').dropViewIfExists('group_role_policy_vw'))

      .then(async () => {
        await knex.raw(`create view yars.group_role_policy_vw as select
          row_number() OVER (),
          yars.group.group_id,
          public.initiative.code as initiative_code,
          yars.group.name as group_name,
          yars.role.name as role_name,
          yars.policy.policy_id as policy_id,
          yars.resource.name as resource_name,
          yars.action.name as action_name
        from yars.group
        inner join public.initiative on yars.group.initiative_id = public.initiative.initiative_id
        inner join yars.group_role on yars.group_role.group_id = yars.group.group_id
        inner join yars.role on yars.role.role_id = yars.group_role.role_id
        inner join yars.role_policy on yars.role_policy.role_id = yars.role.role_id
        inner join yars.policy on yars.policy.policy_id = yars.role_policy.policy_id
        inner join yars.resource on resource.resource_id = yars.policy.resource_id
        inner join yars.action on yars.action.action_id = yars.policy.action_id;`);
      })

      // Remove group to role mappings for ACTIVITY_CONTACT
      .then(async () => {
        await yars.deleteGroupRoles(knex, Resource.ACTIVITY_CONTACT, actions);
      })

      // Remove role to policy mappings for ACTIVITY_CONTACT
      .then(async () => {
        await yars.deleteRolePolicies(knex, Resource.ACTIVITY_CONTACT, actions);
      })

      // Remove the ACTIVITY_CONTACT roles
      .then(async () => {
        await yars.deleteRoles(knex, Resource.ACTIVITY_CONTACT, actions);
      })

      // Remove the ACTIVITY_CONTACT policies
      .then(async () => {
        await yars.deletePolicies(knex, resources);
      })

      // Remove the ACTIVITY_CONTACT resource
      .then(async () => {
        await yars.deleteResources(knex, resources);
      })

      // Remove the attribute_group bindings for PCNS
      .then(async () => {
        await yars.deleteAttributeGroup(knex, Initiative.PCNS, GroupName.NAVIGATOR, 'scope:all');
        await yars.deleteAttributeGroup(knex, Initiative.PCNS, GroupName.NAVIGATOR_READ_ONLY, 'scope:all');
        await yars.deleteAttributeGroup(knex, Initiative.PCNS, GroupName.SUPERVISOR, 'scope:all');
        await yars.deleteAttributeGroup(knex, Initiative.PCNS, GroupName.ADMIN, 'scope:all');
        await yars.deleteAttributeGroup(knex, Initiative.PCNS, GroupName.PROPONENT, 'scope:self');
      })

      // Remove the attribute_group bindings for ELECTRIFICATION
      .then(async () => {
        await yars.deleteAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.NAVIGATOR, 'scope:all');
        await yars.deleteAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.NAVIGATOR_READ_ONLY, 'scope:all');
        await yars.deleteAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.SUPERVISOR, 'scope:all');
        await yars.deleteAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.ADMIN, 'scope:all');
        await yars.deleteAttributeGroup(knex, Initiative.ELECTRIFICATION, GroupName.PROPONENT, 'scope:self');
      })

      .then(() =>
        knex.schema
          .alterTable('activity_contact', function (table) {
            table.dropColumn('role');
          })

          // Drop the activity_contact_role_enum type
          .then(() => knex.schema.raw('DROP TYPE IF EXISTS activity_contact_role_enum'))
      )
  );
}
