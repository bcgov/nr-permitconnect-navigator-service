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

const electrificationPermits = [
  {
    agency: 'Environment and Parks',
    division: 'Conservation and Recreation',
    branch: 'Provincial Services',
    business_domain: 'Parks',
    type: 'Park Use Permit - Land Use Occupancy',
    name: 'Park Use Permit - Land Use Occupancy',
    source_system: 'Electronic Park Use Permit System',
    source_system_acronym: 'EPUPS'
  },
  {
    agency: 'Environment and Parks',
    division: 'Environmental Protection',
    branch: 'Digital Services',
    business_domain: 'Environment',
    type: 'Waste Discharge Permit',
    name: 'Waste Discharge Permit',
    source_system: 'Waste Permit Administration System',
    source_system_acronym: 'WASTE'
  },
  {
    agency: 'Forests',
    division: 'Integrated Resource Operations',
    branch: 'Forest Tenures',
    business_domain: 'Forestry',
    type: 'Forest Road Use Permit',
    name: 'Forest Road Use Permit',
    source_system: 'Resource Roads System',
    source_system_acronym: 'RRS'
  },
  {
    agency: 'Forests',
    division: 'Integrated Resource Operations',
    branch: 'Forest Tenures',
    business_domain: 'Forestry',
    type: 'Works Permit',
    name: 'Works Permit',
    source_system: 'Forest Tenure Administration',
    source_system_acronym: 'FTA'
  },
  {
    agency: 'Forests',
    division: 'Integrated Resource Operations',
    branch: 'Forest Tenures',
    business_domain: 'Forestry',
    type: 'Special Use Permit',
    name: 'Special Use Permit',
    source_system: 'Forest Tenure Administration',
    source_system_acronym: 'FTA'
  },
  {
    agency: 'Forests',
    division: 'Integrated Resource Operations',
    branch: 'Forest Tenures',
    business_domain: 'Forestry',
    type: 'Forest Service Road Road Use Permit',
    name: 'Forest Service Road Road Use Permit',
    source_system: 'Resource Roads System',
    source_system_acronym: 'RRS'
  },
  {
    agency: 'Water, Land and Resource Stewardship',
    division: 'Integrated Resource Operations',
    branch: 'Lands Program',
    business_domain: 'Lands',
    type: 'Wind Power Investigative Licence',
    name: 'Wind Power Investigative Licence',
    source_system: 'Tantalis',
    source_system_acronym: 'TANTALIS'
  },
  {
    agency: 'Water, Land and Resource Stewardship',
    division: 'Integrated Resource Operations',
    branch: 'Lands Program',
    business_domain: 'Lands',
    type: 'Wind Power Multi-Tenure Instrument',
    name: 'Wind Power Multi-Tenure Instrument',
    source_system: 'Tantalis',
    source_system_acronym: 'TANTALIS'
  },
  {
    agency: 'Mining and Critical Minerals',
    division: 'Mines Health, Safety and Enforcement',
    branch: 'Office of the Chief Inspector',
    business_domain: 'Mining',
    type: 'Aggregates and Quarry Materials Tenure',
    name: 'Aggregates and Quarry Materials Tenure',
    source_system: 'Mines Digital Services',
    source_system_acronym: 'MDS'
  },
  {
    agency: 'Water, Land and Resource Stewardship',
    division: 'Integrated Resource Operations',
    branch: 'Lands Program',
    business_domain: 'Lands',
    type: 'Industrial General Tenure',
    name: 'Industrial General Tenure',
    source_system: 'Tantalis',
    source_system_acronym: 'TANTALIS'
  },
  {
    agency: 'Water, Land and Resource Stewardship',
    division: 'Integrated Resource Operations',
    branch: 'Lands Program',
    business_domain: 'Lands',
    type: 'Statutory Right of Way',
    name: 'Statutory Right of Way',
    source_system: 'Tantalis',
    source_system_acronym: 'TANTALIS'
  },
  {
    agency: 'Mining and Critical Minerals',
    division: 'Mines Health, Safety and Enforcement',
    branch: 'Office of the Chief Inspector',
    business_domain: 'Mining',
    type: 'Notice of Work',
    name: 'Notice of Work',
    source_system: 'Mines Digital Services',
    source_system_acronym: 'MDS'
  },
  {
    agency: 'Water, Land and Resource Stewardship',
    division: 'Water, Fisheries and Coast',
    branch: 'Fisheries, Aquaculture and Wild Salmon',
    business_domain: 'Fish and Wildlife',
    type: 'Fish & Wildlife Application',
    name: 'General Wildlife Permit',
    source_system: 'POSSE (ELicencing)',
    source_system_acronym: 'ELIC'
  },
  {
    agency: 'Water, Land and Resource Stewardship',
    division: 'Water, Fisheries and Coast',
    branch: 'Fisheries, Aquaculture and Wild Salmon',
    business_domain: 'Fish and Wildlife',
    type: 'Fish & Wildlife Application',
    name: 'Scientific Fish Collection Permit',
    source_system: 'POSSE (ELicencing)',
    source_system_acronym: 'ELIC'
  },
  {
    agency: 'Environment and Parks',
    division: 'Conservation and Recreation',
    branch: 'Provincial Services',
    business_domain: 'Parks',
    type: '',
    name: 'Section 16 Authorization for use of a site or trail for industrial purpose',
    source_system: 'NO SYSTEM',
    source_system_acronym: 'NA'
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

      .then(() =>
        knex.schema.createTable('permit_type_initiative_xref', (table) => {
          table.primary(['permit_type_id', 'initiative_id']);
          table
            .integer('permit_type_id')
            .notNullable()
            .references('permit_type_id')
            .inTable('permit_type')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
          table
            .uuid('initiative_id')
            .notNullable()
            .references('initiative_id')
            .inTable('initiative')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
          stamps(knex, table);
        })
      )

      // Alter public schema tables
      .then(() =>
        knex.schema.alterTable('permit_type', (table) => {
          table.unique(['agency', 'division', 'branch', 'name']);
        })
      )

      // Create before update triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_electrification_project_trigger
        BEFORE UPDATE ON electrification_project
        FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_permit_type_initiative_xref_trigger
        BEFORE UPDATE ON permit_type_initiative_xref
        FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`)
      )

      // Create audit triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_electrification_project_trigger
        AFTER UPDATE OR DELETE ON electrification_project
        FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_permit_type_initiative_xref_trigger
        AFTER UPDATE OR DELETE ON permit_type_initiative_xref
        FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      // Add current permit types to xref table for housing initiative
      .then(async () => {
        const housing = await knex
          .select('initiative_id')
          .from('initiative')
          .where({
            code: Initiative.HOUSING
          })
          .first();

        const housing_permit_ids = await knex.select('permit_type_id').from('permit_type');

        const items = housing_permit_ids.map((x) => ({
          permit_type_id: x.permit_type_id,
          initiative_id: housing.initiative_id
        }));

        return knex('permit_type_initiative_xref').insert(items);
      })

      // Populate new permits for ELECTRIFICATION_PROJECT
      .then(() => {
        return knex('permit_type').insert(electrificationPermits);
      })

      // Add electrification permit types to xref table
      .then(async () => {
        const electrification = await knex
          .select('initiative_id')
          .from('initiative')
          .where({
            code: Initiative.ELECTRIFICATION
          })
          .first();

        // All permits except these 4
        const electrification_permit_ids = await knex
          .select('permit_type_id')
          .from('permit_type')
          .whereNotIn('name', [
            'Sponsored Crown Grant',
            'Residential Lands Tenure',
            'Nominal Rent Tenure',
            'Site Remediation Authorization'
          ]);

        const items = electrification_permit_ids.map((x) => ({
          permit_type_id: x.permit_type_id,
          initiative_id: electrification.initiative_id
        }));

        return knex('permit_type_initiative_xref').insert(items);
      })

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

        const supervisor_group_id = await knex('yars.group')
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
          await addResourceRoles(supervisor_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);

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
      .then(() =>
        knex.schema.raw(
          'DROP TRIGGER IF EXISTS audit_permit_type_initiative_xref_trigger ON permit_type_initiative_xref'
        )
      )
      .then(() =>
        knex.schema.raw('DROP TRIGGER IF EXISTS audit_electrification_project_trigger ON electrification_project')
      )

      // Drop public schema table triggers
      .then(() =>
        knex.schema.raw(
          'DROP TRIGGER IF EXISTS before_update_permit_type_initiative_xref_trigger ON permit_type_initiative_xref'
        )
      )
      .then(() =>
        knex.schema.raw(
          'DROP TRIGGER IF EXISTS before_update_electrification_project_trigger ON electrification_project'
        )
      )

      // Revert public schema table alters
      .then(() =>
        knex.schema.alterTable('permit_type', (table) => {
          table.dropUnique(['agency', 'division', 'branch', 'name']);
        })
      )

      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('permit_type_initiative_xref'))
      .then(() => knex.schema.dropTableIfExists('electrification_project'))

      // Delete data
      .then(async () => {
        await Promise.all(
          electrificationPermits.map(async (x) => await knex('permit_type').where('name', x.name).del())
        );
      })
      .then(() => knex('initiative').where('code', 'ELECTRIFICATION').del())
  );
}
