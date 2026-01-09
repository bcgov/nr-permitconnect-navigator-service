/* eslint-disable max-len */
import { v4 as uuidv4 } from 'uuid';

import stamps from '../stamps.ts';
import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application.ts';

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

      .then(() => {
        const items = [
          {
            draft_code: 'ELECTRIFICATION_PROJECT'
          }
        ];
        return knex('draft_code').insert(items);
      })

      // Create code tables
      .then(() =>
        knex.schema.createTable('electrification_project_type_code', (table) => {
          table.text('code').primary().checkRegex('^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$'); // Constrains to SCREAMING_SNAKE w/ no double or trailing underscores
          table.text('display').unique().notNullable();
          table.text('definition').notNullable();
          table.boolean('active').notNullable().defaultTo(true);
          stamps(knex, table);
        })
      )
      .then(() =>
        knex.schema.createTable('electrification_project_category_code', (table) => {
          table.text('code').primary().checkRegex('^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$'); // Constrains to SCREAMING_SNAKE w/ no double or trailing underscores
          table.text('display').unique().notNullable();
          table.text('definition').notNullable();
          table.boolean('active').notNullable().defaultTo(true);
          stamps(knex, table);
        })
      )

      // Seeding code tables
      .then(() => {
        const types = [
          {
            code: 'IPP_HYDRO',
            display: 'IPP Hydro',
            definition: 'Independent Power Producer generating electricity from water.'
          },
          {
            code: 'IPP_SOLAR',
            display: 'IPP Solar',
            definition: 'Independent Power Producer generating electricity from solar.'
          },
          {
            code: 'IPP_WIND',
            display: 'IPP Wind',
            definition: 'Independent Power Producer generating electricity from wind.'
          },
          {
            code: 'OTHER',
            display: 'Other',
            definition: 'Any other Electrification project not generating power from solar, water or wind.'
          }
        ];
        return knex('electrification_project_type_code').insert(types);
      })
      .then(() => {
        const categories = [
          {
            code: 'IPP',
            display: 'Independent Power Producer',
            definition: 'Projects generating renewable electricity independent of BC Hydro\'s "Call for Power".'
          },
          {
            code: 'POWER_2024',
            display: 'Call for Power 2024',
            definition: 'Energy projects that successfully participated in the 2024 BC Hydro "Call for Power".'
          },
          {
            code: 'POWER_2025',
            display: 'Call for Power 2025',
            definition: 'Energy projects participating in the 2025 BC Hydro "Call for Power".'
          },
          {
            code: 'REMOTE_RENEWABLE',
            display: 'Remote Community Renewable Project',
            definition: 'Energy projects in line with the "Remote Community Energy Strategy" for non-integrated areas.'
          },
          {
            code: 'SUSTAINMENT',
            display: 'BC Hydro Sustainment',
            definition: 'Projects to upgrade and maintain existing BC Hydro infrastructure.'
          }
        ];
        return knex('electrification_project_category_code').insert(categories);
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
          table.text('intake_status');
          table.text('application_status');
          table.integer('queue_priority');
          table.text('project_name');
          table.text('project_description');
          table.text('company_name_registered');
          table.text('bc_hydro_number');
          table.text('submission_type');
          table.text('has_epa');
          table.text('bc_environment_assess_needed');
          table.decimal('megawatts', null);
          table.text('location_description');
          table.boolean('aai_updated').notNullable().defaultTo(false);
          table.integer('ats_client_id');
          table.text('ast_notes');
          table
            .text('project_type') // Nullable for nav project creation
            .references('code')
            .inTable('electrification_project_type_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
          table
            .text('project_category') // Nullable for nav project creation
            .references('code')
            .inTable('electrification_project_category_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
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
        const items: { name: string; description: string }[] = [];
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

        const items: { role_id: number; policy_id: number }[] = [];

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

        const elec_navigator_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.NAVIGATOR })
          .select('group_id');

        const elec_navigator_read_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.NAVIGATOR_READ_ONLY })
          .select('group_id');

        const elec_supervisor_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.SUPERVISOR })
          .select('group_id');

        const elec_admin_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.ADMIN })
          .select('group_id');

        const elec_proponent_group_id = await knex('yars.group')
          .where({ initiative_id: electrification_id[0].initiative_id, name: GroupName.PROPONENT })
          .select('group_id');

        const items: { group_id: number; role_id: number }[] = [];

        const addResourceRoles = async (group_id: number, resourceName: Resource, actionNames: Action[]) => {
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
          await addResourceRoles(elec_navigator_group_id[0].group_id, Resource.DOCUMENT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_navigator_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_navigator_group_id[0].group_id, Resource.ENQUIRY, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_navigator_group_id[0].group_id, Resource.NOTE, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_navigator_group_id[0].group_id, Resource.PERMIT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_navigator_group_id[0].group_id, Resource.ROADMAP, [Action.CREATE, Action.READ, Action.UPDATE]);

          // Add all navigator read only role mappings
          await addResourceRoles(elec_navigator_read_group_id[0].group_id, Resource.DOCUMENT, [Action.READ]);
          await addResourceRoles(elec_navigator_read_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.READ]);
          await addResourceRoles(elec_navigator_read_group_id[0].group_id, Resource.ENQUIRY, [Action.READ]);
          await addResourceRoles(elec_navigator_read_group_id[0].group_id, Resource.NOTE, [Action.READ]);
          await addResourceRoles(elec_navigator_read_group_id[0].group_id, Resource.PERMIT, [Action.READ]);
          await addResourceRoles(elec_navigator_read_group_id[0].group_id, Resource.ROADMAP, [Action.READ]);

          // Add all supervisor role mappings
          await addResourceRoles(elec_supervisor_group_id[0].group_id, Resource.ACCESS_REQUEST, [Action.CREATE, Action.READ]);
          await addResourceRoles(elec_supervisor_group_id[0].group_id, Resource.DOCUMENT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_supervisor_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_supervisor_group_id[0].group_id, Resource.ENQUIRY, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_supervisor_group_id[0].group_id, Resource.NOTE, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_supervisor_group_id[0].group_id, Resource.PERMIT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_supervisor_group_id[0].group_id, Resource.ROADMAP, [Action.CREATE, Action.READ, Action.UPDATE]);

          // Add all admin role mappings
          await addResourceRoles(elec_admin_group_id[0].group_id, Resource.ACCESS_REQUEST, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_admin_group_id[0].group_id, Resource.DOCUMENT, [Action.READ]);
          await addResourceRoles(elec_admin_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.READ]);
          await addResourceRoles(elec_admin_group_id[0].group_id, Resource.ENQUIRY, [Action.READ]);
          await addResourceRoles(elec_admin_group_id[0].group_id, Resource.NOTE, [Action.READ]);
          await addResourceRoles(elec_admin_group_id[0].group_id, Resource.PERMIT, [Action.READ]);
          await addResourceRoles(elec_admin_group_id[0].group_id, Resource.ROADMAP, [Action.READ]);

          // Add all proponent role mappings
          await addResourceRoles(elec_proponent_group_id[0].group_id, Resource.DOCUMENT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_proponent_group_id[0].group_id, Resource.ELECTRIFICATION_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_proponent_group_id[0].group_id, Resource.ENQUIRY, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_proponent_group_id[0].group_id, Resource.NOTE, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addResourceRoles(elec_proponent_group_id[0].group_id, Resource.PERMIT, [Action.CREATE, Action.READ, Action.UPDATE]);

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

        const items: { policy_id: number; attribute_id: number }[] = [];

        for (const policy of policies) {
          items.push({ policy_id: policy.policy_id, attribute_id: scopeAllId[0].attribute_id });
          items.push({ policy_id: policy.policy_id, attribute_id: scopeSelfId[0].attribute_id });
        }

        return knex('yars.policy_attribute').insert(items);
      })

      // Drop public schema functions
      .then(() =>
        knex.schema.raw(`drop function public.get_activity_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )`)
      )

      // Create public schema functions
      .then(() =>
        knex.schema.raw(`create or replace function public.get_electrification_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )
        returns table (total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, intake_submitted bigint, intake_assigned bigint, intake_completed bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, waiting_on bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
        language plpgsql
        as $$
        begin
            return query
            with electrification_project_counts as (
              select
                count(*) as electrification_project_count,
                (select count(*) from public.electrification_project where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as electrification_project_count_between,
                (select count(*) from public.electrification_project where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as electrification_project_count_monthyear,
                (select count(*) from public.electrification_project where "assigned_user_id" = user_id) as electrification_project_count_assignedto,
                count(*) filter (where ep."intake_status" = 'Submitted') as intake_submitted_electrification_project_count,
                count(*) filter (where ep."intake_status" = 'Assigned') as intake_assigned_electrification_project_count,
                count(*) filter (where ep."intake_status" = 'Completed') as intake_completed_electrification_project_count,
                count(*) filter (where ep."application_status" = 'New') as state_new_electrification_project_count,
                count(*) filter (where ep."application_status" = 'In Progress') as state_inprogress_electrification_project_count,
                count(*) filter (where ep."application_status" = 'Delayed') as state_delayed_electrification_project_count,
                count(*) filter (where ep."application_status" = 'Completed') as state_completed_electrification_project_count,
                count(*) filter (where ep."queue_priority" = 1) as queue_1_electrification_project_count,
                count(*) filter (where ep."queue_priority" = 2) as queue_2_electrification_project_count,
                count(*) filter (where ep."queue_priority" = 3) as queue_3_electrification_project_count,
                count(*) filter (where ep."submission_type" = 'Guidance') as guidance_electrification_project_count,
                count(*) filter (where ep."submission_type" = 'Inapplicable') as inapplicable_electrification_project_count,
                count(distinct ep.activity_id) filter (where permit_counts.permit_count > 1) as multi_permits_needed
              from public.electrification_project ep
              join public.activity a on ep.activity_id = a.activity_id
              left join (
                        select p.activity_id, count(*) as permit_count
                        from public.permit p
                        where p.needed = 'Yes'
                        group by p.activity_id
                        ) permit_counts on permit_counts.activity_id = ep.activity_id
              where a.is_deleted = false and ep.intake_status <> 'Draft'
              ),
              enquiry_counts as (
                select
                count(*) as enquiry_count,
                (select count(*) from public.enquiry where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as enquiry_count_between,
                (select count(*) from public.enquiry where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as enquiry_count_monthyear,
                (select count(*) from public.enquiry where "assigned_user_id" = user_id) as enquiry_count_assignedto,
                count(*) filter (where e."intake_status" = 'Submitted') as intake_submitted_enquiry_count,
                count(*) filter (where e."intake_status" = 'Assigned') as intake_assigned_enquiry_count,
                count(*) filter (where e."intake_status" = 'Completed') as intake_completed_enquiry_count,
                count(*) filter (where e."waiting_on" is not null) waiting_on_enquiry_count,
                count(*) filter (where e."submission_type" = 'Escalation') escalation_enquiry_count,
                count(*) filter (where e."submission_type" = 'General enquiry') general_enquiry_count,
                count(*) filter (where e."submission_type" = 'Inapplicable') as inapplicable_enquiry_count,
                count(*) filter (where e."submission_type" = 'Status request') as status_request_enquiry_count
              from public.enquiry e
              join public.activity a on e.activity_id = a.activity_id
              join public.initiative i on a.initiative_id = i.initiative_id
              where a.is_deleted = false and e.intake_status <> 'Draft' and i.code = 'ELECTRIFICATION')
        select
            (electrification_project_counts.electrification_project_count + enquiry_counts.enquiry_count) AS total_submissions,
            (electrification_project_counts.electrification_project_count_between + enquiry_counts.enquiry_count_between) AS total_submissions_between,
            (electrification_project_counts.electrification_project_count_monthyear + enquiry_counts.enquiry_count_monthyear) AS total_submissions_monthyear,
            (electrification_project_counts.electrification_project_count_assignedto + enquiry_counts.enquiry_count_assignedto) AS total_submissions_assignedto,
            (electrification_project_counts.intake_submitted_electrification_project_count + enquiry_counts.intake_submitted_enquiry_count) AS intake_submitted,
            (electrification_project_counts.intake_assigned_electrification_project_count + enquiry_counts.intake_assigned_enquiry_count) AS intake_assigned,
            (electrification_project_counts.intake_completed_electrification_project_count + enquiry_counts.intake_completed_enquiry_count) AS intake_completed,
            (electrification_project_counts.state_new_electrification_project_count) AS state_new,
            (electrification_project_counts.state_inprogress_electrification_project_count) AS state_inprogress,
            (electrification_project_counts.state_delayed_electrification_project_count) AS state_delayed,
            (electrification_project_counts.state_completed_electrification_project_count) AS state_completed,
            (enquiry_counts.waiting_on_enquiry_count) AS waiting_on,
            (electrification_project_counts.queue_1_electrification_project_count) AS queue_1,
            (electrification_project_counts.queue_2_electrification_project_count) AS queue_2,
            (electrification_project_counts.queue_3_electrification_project_count) AS queue_3,
            (enquiry_counts.escalation_enquiry_count) AS escalation,
            (enquiry_counts.general_enquiry_count) AS general_enquiry,
            (electrification_project_counts.guidance_electrification_project_count) AS guidance,
            (electrification_project_counts.inapplicable_electrification_project_count + enquiry_counts.inapplicable_enquiry_count) AS inapplicable,
            (enquiry_counts.status_request_enquiry_count) AS status_request,
            (electrification_project_counts.multi_permits_needed) AS multi_permits_needed
        from electrification_project_counts, enquiry_counts;
        end; $$`)
      )

      .then(() =>
        knex.schema.raw(`create or replace function public.get_housing_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )
        returns table (total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, intake_submitted bigint, intake_assigned bigint, intake_completed bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, supported_bc bigint, supported_indigenous bigint, supported_non_profit bigint, supported_housing_coop bigint, waiting_on bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
        language plpgsql
        as $$
        begin
            return query
            with housing_project_counts as (
              select
                count(*) as housing_project_count,
                (select count(*) from public.housing_project where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as housing_project_count_between,
                (select count(*) from public.housing_project where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as housing_project_count_monthyear,
                (select count(*) from public.housing_project where "assigned_user_id" = user_id) as housing_project_count_assignedto,
                count(*) filter (where hp."intake_status" = 'Submitted') as intake_submitted_housing_project_count,
                count(*) filter (where hp."intake_status" = 'Assigned') as intake_assigned_housing_project_count,
                count(*) filter (where hp."intake_status" = 'Completed') as intake_completed_housing_project_count,
                count(*) filter (where hp."application_status" = 'New') as state_new_housing_project_count,
                count(*) filter (where hp."application_status" = 'In Progress') as state_inprogress_housing_project_count,
                count(*) filter (where hp."application_status" = 'Delayed') as state_delayed_housing_project_count,
                count(*) filter (where hp."application_status" = 'Completed') as state_completed_housing_project_count,
                count(*) filter (where hp."financially_supported_bc" = 'Yes') as supported_bc_housing_project_count,
                count(*) filter (where hp."financially_supported_indigenous" = 'Yes') as supported_indigenous_housing_project_count,
                count(*) filter (where hp."financially_supported_non_profit" = 'Yes') as supported_non_profit_housing_project_count,
                count(*) filter (where hp."financially_supported_housing_coop" = 'Yes') as supported_housing_coop_housing_project_count,
                count(*) filter (where hp."waiting_on" is not null) as waiting_on_housing_project_count,
                count(*) filter (where hp."queue_priority" = 1) as queue_1_housing_project_count,
                count(*) filter (where hp."queue_priority" = 2) as queue_2_housing_project_count,
                count(*) filter (where hp."queue_priority" = 3) as queue_3_housing_project_count,
                count(*) filter (where hp."submission_type" = 'Guidance') as guidance_housing_project_count,
                count(*) filter (where hp."submission_type" = 'Inapplicable') as inapplicable_housing_project_count,
                count(distinct hp.activity_id) filter (where permit_counts.permit_count > 1) as multi_permits_needed
              from public.housing_project hp
              join public.activity a on hp.activity_id = a.activity_id
              left join (
                        select p.activity_id, count(*) as permit_count
                        from public.permit p
                        where p.needed = 'Yes'
                        group by p.activity_id
                        ) permit_counts on permit_counts.activity_id = hp.activity_id
              where a.is_deleted = false and hp.intake_status <> 'Draft'
              ),
              enquiry_counts as (
                select
                count(*) as enquiry_count,
                (select count(*) from public.enquiry where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as enquiry_count_between,
                (select count(*) from public.enquiry where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as enquiry_count_monthyear,
                (select count(*) from public.enquiry where "assigned_user_id" = user_id) as enquiry_count_assignedto,
                count(*) filter (where e."intake_status" = 'Submitted') as intake_submitted_enquiry_count,
                count(*) filter (where e."intake_status" = 'Assigned') as intake_assigned_enquiry_count,
                count(*) filter (where e."intake_status" = 'Completed') as intake_completed_enquiry_count,
                count(*) filter (where e."waiting_on" is not null) waiting_on_enquiry_count,
                count(*) filter (where e."submission_type" = 'Escalation') escalation_enquiry_count,
                count(*) filter (where e."submission_type" = 'General enquiry') general_enquiry_count,
                count(*) filter (where e."submission_type" = 'Inapplicable') as inapplicable_enquiry_count,
                count(*) filter (where e."submission_type" = 'Status request') as status_request_enquiry_count
              from public.enquiry e
              join public.activity a on e.activity_id = a.activity_id
              join public.initiative i on a.initiative_id = i.initiative_id
              where a.is_deleted = false and e.intake_status <> 'Draft' and i.code = 'HOUSING')
        select
            (housing_project_counts.housing_project_count + enquiry_counts.enquiry_count) AS total_submissions,
            (housing_project_counts.housing_project_count_between + enquiry_counts.enquiry_count_between) AS total_submissions_between,
            (housing_project_counts.housing_project_count_monthyear + enquiry_counts.enquiry_count_monthyear) AS total_submissions_monthyear,
            (housing_project_counts.housing_project_count_assignedto + enquiry_counts.enquiry_count_assignedto) AS total_submissions_assignedto,
            (housing_project_counts.intake_submitted_housing_project_count + enquiry_counts.intake_submitted_enquiry_count) AS intake_submitted,
            (housing_project_counts.intake_assigned_housing_project_count + enquiry_counts.intake_assigned_enquiry_count) AS intake_assigned,
            (housing_project_counts.intake_completed_housing_project_count + enquiry_counts.intake_completed_enquiry_count) AS intake_completed,
            (housing_project_counts.state_new_housing_project_count) AS state_new,
            (housing_project_counts.state_inprogress_housing_project_count) AS state_inprogress,
            (housing_project_counts.state_delayed_housing_project_count) AS state_delayed,
            (housing_project_counts.state_completed_housing_project_count) AS state_completed,
            (housing_project_counts.supported_bc_housing_project_count) AS supported_bc,
            (housing_project_counts.supported_indigenous_housing_project_count) AS supported_indigenous,
            (housing_project_counts.supported_non_profit_housing_project_count) AS supported_non_profit,
            (housing_project_counts.supported_housing_coop_housing_project_count) AS supported_housing_coop,
            (housing_project_counts.waiting_on_housing_project_count + enquiry_counts.waiting_on_enquiry_count) AS waiting_on,
            (housing_project_counts.queue_1_housing_project_count) AS queue_1,
            (housing_project_counts.queue_2_housing_project_count) AS queue_2,
            (housing_project_counts.queue_3_housing_project_count) AS queue_3,
            (enquiry_counts.escalation_enquiry_count) AS escalation,
            (enquiry_counts.general_enquiry_count) AS general_enquiry,
            (housing_project_counts.guidance_housing_project_count) AS guidance,
            (housing_project_counts.inapplicable_housing_project_count + enquiry_counts.inapplicable_enquiry_count) AS inapplicable,
            (enquiry_counts.status_request_enquiry_count) AS status_request,
            (housing_project_counts.multi_permits_needed) AS multi_permits_needed
        from housing_project_counts, enquiry_counts;
        end; $$`)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() =>
        knex.schema.raw(`drop function public.get_housing_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )`)
      )

      .then(() =>
        knex.schema.raw(`drop function public.get_electrification_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )`)
      )

      // Create public schema functions
      .then(() =>
        knex.schema.raw(`create or replace function public.get_activity_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )
        returns table (total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, intake_submitted bigint, intake_assigned bigint, intake_completed bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, supported_bc bigint, supported_indigenous bigint, supported_non_profit bigint, supported_housing_coop bigint, waiting_on bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
        language plpgsql
        as $$
        begin
            return query
            with housing_project_counts as (
              select
                count(*) as housing_project_count,
                (select count(*) from public.housing_project where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as housing_project_count_between,
                (select count(*) from public.housing_project where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as housing_project_count_monthyear,
                (select count(*) from public.housing_project where "assigned_user_id" = user_id) as housing_project_count_assignedto,
                count(*) filter (where hp."intake_status" = 'Submitted') as intake_submitted_housing_project_count,
                count(*) filter (where hp."intake_status" = 'Assigned') as intake_assigned_housing_project_count,
                count(*) filter (where hp."intake_status" = 'Completed') as intake_completed_housing_project_count,
                count(*) filter (where hp."application_status" = 'New') as state_new_housing_project_count,
                count(*) filter (where hp."application_status" = 'In Progress') as state_inprogress_housing_project_count,
                count(*) filter (where hp."application_status" = 'Delayed') as state_delayed_housing_project_count,
                count(*) filter (where hp."application_status" = 'Completed') as state_completed_housing_project_count,
                count(*) filter (where hp."financially_supported_bc" = 'Yes') as supported_bc_housing_project_count,
                count(*) filter (where hp."financially_supported_indigenous" = 'Yes') as supported_indigenous_housing_project_count,
                count(*) filter (where hp."financially_supported_non_profit" = 'Yes') as supported_non_profit_housing_project_count,
                count(*) filter (where hp."financially_supported_housing_coop" = 'Yes') as supported_housing_coop_housing_project_count,
                count(*) filter (where hp."waiting_on" is not null) as waiting_on_housing_project_count,
                count(*) filter (where hp."queue_priority" = 1) as queue_1_housing_project_count,
                count(*) filter (where hp."queue_priority" = 2) as queue_2_housing_project_count,
                count(*) filter (where hp."queue_priority" = 3) as queue_3_housing_project_count,
                count(*) filter (where hp."submission_type" = 'Guidance') as guidance_housing_project_count,
                count(*) filter (where hp."submission_type" = 'Inapplicable') as inapplicable_housing_project_count,
                count(distinct hp.activity_id) filter (where permit_counts.permit_count > 1) as multi_permits_needed
              from public.housing_project hp
              join public.activity a on hp.activity_id = a.activity_id
              left join (
                        select p.activity_id, count(*) as permit_count
                        from public.permit p
                        where p.needed = 'Yes'
                        group by p.activity_id
                        ) permit_counts on permit_counts.activity_id = hp.activity_id
              where a.is_deleted = false and hp.intake_status <> 'Draft'
              ),
              enquiry_counts as (
                select
                count(*) as enquiry_count,
                (select count(*) from public.enquiry where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as enquiry_count_between,
                (select count(*) from public.enquiry where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as enquiry_count_monthyear,
                (select count(*) from public.enquiry where "assigned_user_id" = user_id) as enquiry_count_assignedto,
                count(*) filter (where e."intake_status" = 'Submitted') as intake_submitted_enquiry_count,
                count(*) filter (where e."intake_status" = 'Assigned') as intake_assigned_enquiry_count,
                count(*) filter (where e."intake_status" = 'Completed') as intake_completed_enquiry_count,
                count(*) filter (where e."waiting_on" is not null) waiting_on_enquiry_count,
                count(*) filter (where e."submission_type" = 'Escalation') escalation_enquiry_count,
                count(*) filter (where e."submission_type" = 'General enquiry') general_enquiry_count,
                count(*) filter (where e."submission_type" = 'Inapplicable') as inapplicable_enquiry_count,
                count(*) filter (where e."submission_type" = 'Status request') as status_request_enquiry_count
              from public.enquiry e
              join public.activity a on e.activity_id = a.activity_id
              where a.is_deleted = false and e.intake_status <> 'Draft')
        select
            (housing_project_counts.housing_project_count + enquiry_counts.enquiry_count) AS total_submissions,
            (housing_project_counts.housing_project_count_between + enquiry_counts.enquiry_count_between) AS total_submissions_between,
            (housing_project_counts.housing_project_count_monthyear + enquiry_counts.enquiry_count_monthyear) AS total_submissions_monthyear,
            (housing_project_counts.housing_project_count_assignedto + enquiry_counts.enquiry_count_assignedto) AS total_submissions_assignedto,
            (housing_project_counts.intake_submitted_housing_project_count + enquiry_counts.intake_submitted_enquiry_count) AS intake_submitted,
            (housing_project_counts.intake_assigned_housing_project_count + enquiry_counts.intake_assigned_enquiry_count) AS intake_assigned,
            (housing_project_counts.intake_completed_housing_project_count + enquiry_counts.intake_completed_enquiry_count) AS intake_completed,
            (housing_project_counts.state_new_housing_project_count) AS state_new,
            (housing_project_counts.state_inprogress_housing_project_count) AS state_inprogress,
            (housing_project_counts.state_delayed_housing_project_count) AS state_delayed,
            (housing_project_counts.state_completed_housing_project_count) AS state_completed,
            (housing_project_counts.supported_bc_housing_project_count) AS supported_bc,
            (housing_project_counts.supported_indigenous_housing_project_count) AS supported_indigenous,
            (housing_project_counts.supported_non_profit_housing_project_count) AS supported_non_profit,
            (housing_project_counts.supported_housing_coop_housing_project_count) AS supported_housing_coop,
            (housing_project_counts.waiting_on_housing_project_count + enquiry_counts.waiting_on_enquiry_count) AS waiting_on,
            (housing_project_counts.queue_1_housing_project_count) AS queue_1,
            (housing_project_counts.queue_2_housing_project_count) AS queue_2,
            (housing_project_counts.queue_3_housing_project_count) AS queue_3,
            (enquiry_counts.escalation_enquiry_count) AS escalation,
            (enquiry_counts.general_enquiry_count) AS general_enquiry,
            (housing_project_counts.guidance_housing_project_count) AS guidance,
            (housing_project_counts.inapplicable_housing_project_count + enquiry_counts.inapplicable_enquiry_count) AS inapplicable,
            (enquiry_counts.status_request_enquiry_count) AS status_request,
            (housing_project_counts.multi_permits_needed) AS multi_permits_needed
        from housing_project_counts, enquiry_counts;
        end; $$`)
      )

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

      // Drop code tables
      .then(() => knex.schema.dropTableIfExists('electrification_project_type_code'))
      .then(() => knex.schema.dropTableIfExists('electrification_project_category_code'))

      // Delete data
      .then(async () => {
        await Promise.all(
          electrificationPermits.map(async (x) => await knex('permit_type').where('name', x.name).del())
        );
      })
      .then(() => knex('draft_code').where('draft_code', 'ELECTRIFICATION_PROJECT').del())
      .then(() => knex('initiative').where('code', 'ELECTRIFICATION').del())
  );
}
