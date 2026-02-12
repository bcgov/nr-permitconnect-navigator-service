/* eslint-disable max-len */
import { v4 as uuidv4 } from 'uuid';

import stamps from '../stamps.ts';
import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application.ts';
import {
  createAuditLogTrigger,
  createUpdatedAtTrigger,
  dropAuditLogTrigger,
  dropUpdatedAtTrigger
} from '../utils/utils.ts';
import {
  addAttributeGroup,
  addGroupRoles,
  addGroups,
  addPolicies,
  addPolicyAttributes,
  addResources,
  addRolePolicies,
  addRoles,
  deleteAttributeGroup,
  deleteGroupRoles,
  deleteGroups,
  deletePolicies,
  deleteResources,
  deleteRolePolicies,
  deleteRoles
} from '../utils/yars.ts';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() => {
        return knex('initiative').insert([
          {
            initiative_id: uuidv4(),
            code: Initiative.GENERAL,
            label: 'Generic'
          }
        ]);
      })

      .then(() => {
        return knex('draft_code').insert([
          {
            draft_code: Resource.GENERAL_PROJECT
          }
        ]);
      })

      // Create public schema tables
      .then(() =>
        knex.schema.createTable('general_project', (table) => {
          table.uuid('general_project_id').primary();
          table
            .text('activity_id')
            .notNullable()
            .references('activity_id')
            .inTable('activity')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table.uuid('assigned_user_id').references('user_id').inTable('user').onUpdate('CASCADE').onDelete('CASCADE');
          table.timestamp('submitted_at', { useTz: true }).notNullable();
          table.text('location_pids');
          table.text('company_name_registered');
          table.text('project_name');
          table.text('street_address');
          table.decimal('latitude', 8, 6);
          table.decimal('longitude', 9, 6);
          table.integer('queue_priority');
          table.text('related_permits');
          table.text('ast_notes');
          table.boolean('ast_updated').notNullable().defaultTo(false);
          table.boolean('added_to_ats').notNullable().defaultTo(false);
          table.integer('ats_client_id');
          table.boolean('ltsa_completed').notNullable().defaultTo(false);
          table.boolean('bc_online_completed').notNullable().defaultTo(false);
          table.boolean('natural_disaster').notNullable().defaultTo(false);
          table.boolean('aai_updated').notNullable().defaultTo(false);
          table.text('application_status');
          table.text('project_description');
          table.text('project_location');
          table.text('project_location_description');
          table.text('locality');
          table.text('province');
          table.text('has_applied_provincial_permits');
          table.text('check_provincial_permits');
          table.text('submission_type');
          table.boolean('consent_to_feedback').notNullable().defaultTo(false);
          table.json('geo_json');
          table.text('geomark_url');
          table.integer('ats_enquiry_id');
          table.text('company_id_registered');
          stamps(knex, table);
        })
      )
      // Create before update triggers
      .then(async () => await createUpdatedAtTrigger(knex, 'public', 'general_project'))

      // Create audit triggers
      .then(async () => await createAuditLogTrigger(knex, 'public', 'general_project'))

      // Add all permit types to xref table for general initiative
      .then(async () => {
        const general = await knex
          .select('initiative_id')
          .from('initiative')
          .where({
            code: Initiative.GENERAL
          })
          .first<{ initiative_id: string }>();

        const general_permit_ids: { permit_type_id: string }[] = await knex
          .select('permit_type_id')
          .from('permit_type');

        const items = general_permit_ids.map((x) => ({
          permit_type_id: x.permit_type_id,
          initiative_id: general.initiative_id
        }));

        return knex('permit_type_initiative_xref').insert(items);
      })

      // YARS
      // Insert the GENERAL_PROJECT resource
      .then(async () => {
        return await addResources(knex, [Resource.GENERAL_PROJECT]);
      })

      // Add new groups for general initiative
      .then(async () => {
        return await addGroups(knex, Initiative.GENERAL, [
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
        ]);
      })

      // Add policies
      .then(async () => {
        return await addPolicies(
          knex,
          [Resource.GENERAL_PROJECT],
          [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]
        );
      })

      // Add roles
      .then(async () => {
        return await addRoles(
          knex,
          [Resource.GENERAL_PROJECT],
          [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]
        );
      })

      // Add role to policy mappings
      .then(async () => {
        return await addRolePolicies(
          knex,
          [Resource.GENERAL_PROJECT],
          [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]
        );
      })

      // Add group to role mappings for GENERAL_PROJECT
      .then(async () => {
        // Note: Only UPDATE or DELETE is required to be given EDITOR role, don't include both
        // prettier-ignore
        {
          // Add all navigator role mappings
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR, Resource.DOCUMENT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR, Resource.GENERAL_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR, Resource.ENQUIRY, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR, Resource.NOTE, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR, Resource.PERMIT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR, Resource.ROADMAP, [Action.CREATE, Action.READ, Action.UPDATE]);

          // Add all navigator read only role mappings
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR_READ_ONLY, Resource.DOCUMENT, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR_READ_ONLY, Resource.GENERAL_PROJECT, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR_READ_ONLY, Resource.ENQUIRY, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR_READ_ONLY, Resource.NOTE, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR_READ_ONLY, Resource.PERMIT, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.NAVIGATOR_READ_ONLY, Resource.ROADMAP, [Action.READ]);

          // Add all supervisor role mappings
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.SUPERVISOR, Resource.ACCESS_REQUEST, [Action.CREATE, Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.SUPERVISOR, Resource.DOCUMENT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.SUPERVISOR, Resource.GENERAL_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.SUPERVISOR, Resource.ENQUIRY, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.SUPERVISOR, Resource.NOTE, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.SUPERVISOR, Resource.PERMIT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.SUPERVISOR, Resource.ROADMAP, [Action.CREATE, Action.READ, Action.UPDATE]);

          // Add all admin role mappings
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.ADMIN, Resource.ACCESS_REQUEST, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.ADMIN, Resource.DOCUMENT, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.ADMIN, Resource.GENERAL_PROJECT, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.ADMIN, Resource.ENQUIRY, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.ADMIN, Resource.NOTE, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.ADMIN, Resource.PERMIT, [Action.READ]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.ADMIN, Resource.ROADMAP, [Action.READ]);

          // Add all proponent role mappings
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.PROPONENT, Resource.DOCUMENT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.PROPONENT, Resource.GENERAL_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.PROPONENT, Resource.ENQUIRY, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.PROPONENT, Resource.NOTE, [Action.CREATE, Action.READ, Action.UPDATE]);
          await addGroupRoles(knex, Initiative.GENERAL, GroupName.PROPONENT, Resource.PERMIT, [Action.CREATE, Action.READ, Action.UPDATE]);
        }
      })

      // Attach scope attributes to all NON CREATE GENERAL_PROJECT policies
      .then(async () => {
        return await addPolicyAttributes(
          knex,
          Resource.GENERAL_PROJECT,
          [Action.READ, Action.UPDATE, Action.DELETE],
          ['scope:all', 'scope:self']
        );
      })

      // Attach scopes to GENERAL groups
      .then(async () => {
        await addAttributeGroup(knex, Initiative.GENERAL, GroupName.NAVIGATOR, 'scope:all');
        await addAttributeGroup(knex, Initiative.GENERAL, GroupName.NAVIGATOR_READ_ONLY, 'scope:all');
        await addAttributeGroup(knex, Initiative.GENERAL, GroupName.SUPERVISOR, 'scope:all');
        await addAttributeGroup(knex, Initiative.GENERAL, GroupName.ADMIN, 'scope:all');
        await addAttributeGroup(knex, Initiative.GENERAL, GroupName.PROPONENT, 'scope:self');
      })

      // Create public schema functions
      .then(() =>
        knex.schema
          .raw(`create or replace function public.get_general_statistics(date_from text, date_to text, month_year text, user_id uuid)
returns table(total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
 language plpgsql
AS $$
        begin
            return query
            with general_project_counts as (
              select
                count(*) as general_project_count,
                (select count(*) from public.general_project where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as general_project_count_between,
                (select count(*) from public.general_project where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as general_project_count_monthyear,
                (select count(*) from public.general_project where "assigned_user_id" = user_id) as general_project_count_assignedto,
                count(*) filter (where ep."application_status" = 'New') as state_new_general_project_count,
                count(*) filter (where ep."application_status" = 'In Progress') as state_inprogress_general_project_count,
                count(*) filter (where ep."application_status" = 'Delayed') as state_delayed_general_project_count,
                count(*) filter (where ep."application_status" = 'Completed') as state_completed_general_project_count,
                count(*) filter (where ep."queue_priority" = 1) as queue_1_general_project_count,
                count(*) filter (where ep."queue_priority" = 2) as queue_2_general_project_count,
                count(*) filter (where ep."queue_priority" = 3) as queue_3_general_project_count,
                count(*) filter (where ep."submission_type" = 'Guidance') as guidance_general_project_count,
                count(*) filter (where ep."submission_type" = 'Inapplicable') as inapplicable_general_project_count,
                count(distinct ep.activity_id) filter (where permit_counts.permit_count > 1) as multi_permits_needed
              from public.general_project ep
              join public.activity a on ep.activity_id = a.activity_id
              left join (
                        select p.activity_id, count(*) as permit_count
                        from public.permit p
                        where p.needed = 'Yes'
                        group by p.activity_id
                        ) permit_counts on permit_counts.activity_id = ep.activity_id
              where a.deleted_at is null
              ),
              enquiry_counts as (
                select
                count(*) as enquiry_count,
                (select count(*) from public.enquiry where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as enquiry_count_between,
                (select count(*) from public.enquiry where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as enquiry_count_monthyear,
                (select count(*) from public.enquiry where "assigned_user_id" = user_id) as enquiry_count_assignedto,
                count(*) filter (where e."submission_type" = 'Escalation') escalation_enquiry_count,
                count(*) filter (where e."submission_type" = 'General enquiry') general_enquiry_count,
                count(*) filter (where e."submission_type" = 'Inapplicable') as inapplicable_enquiry_count,
                count(*) filter (where e."submission_type" = 'Status request') as status_request_enquiry_count
              from public.enquiry e
              join public.activity a on e.activity_id = a.activity_id
              join public.initiative i on a.initiative_id = i.initiative_id
              where a.deleted_at is null and i.code = 'general')
        select
            (general_project_counts.general_project_count + enquiry_counts.enquiry_count) AS total_submissions,
            (general_project_counts.general_project_count_between + enquiry_counts.enquiry_count_between) AS total_submissions_between,
            (general_project_counts.general_project_count_monthyear + enquiry_counts.enquiry_count_monthyear) AS total_submissions_monthyear,
            (general_project_counts.general_project_count_assignedto + enquiry_counts.enquiry_count_assignedto) AS total_submissions_assignedto,
            (general_project_counts.state_new_general_project_count) AS state_new,
            (general_project_counts.state_inprogress_general_project_count) AS state_inprogress,
            (general_project_counts.state_delayed_general_project_count) AS state_delayed,
            (general_project_counts.state_completed_general_project_count) AS state_completed,
            (general_project_counts.queue_1_general_project_count) AS queue_1,
            (general_project_counts.queue_2_general_project_count) AS queue_2,
            (general_project_counts.queue_3_general_project_count) AS queue_3,
            (enquiry_counts.escalation_enquiry_count) AS escalation,
            (enquiry_counts.general_enquiry_count) AS general_enquiry,
            (general_project_counts.guidance_general_project_count) AS guidance,
            (general_project_counts.inapplicable_general_project_count + enquiry_counts.inapplicable_enquiry_count) AS inapplicable,
            (enquiry_counts.status_request_enquiry_count) AS status_request,
            (general_project_counts.multi_permits_needed) AS multi_permits_needed
        from general_project_counts, enquiry_counts;
        end; $$`)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() =>
        knex.schema.raw(`drop function public.get_general_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )`)
      )

      // Remove YARS
      // Remove attribute group mappings
      .then(async () => {
        await deleteAttributeGroup(knex, Initiative.GENERAL, GroupName.NAVIGATOR, 'scope:all');
        await deleteAttributeGroup(knex, Initiative.GENERAL, GroupName.NAVIGATOR_READ_ONLY, 'scope:all');
        await deleteAttributeGroup(knex, Initiative.GENERAL, GroupName.SUPERVISOR, 'scope:all');
        await deleteAttributeGroup(knex, Initiative.GENERAL, GroupName.ADMIN, 'scope:all');
        await deleteAttributeGroup(knex, Initiative.GENERAL, GroupName.PROPONENT, 'scope:self');
      })

      // NOTE!
      // Skip deleting policy attributes
      // Will be cleaned up when the policies themselves are deleted
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .then(() => {})

      // Remove group to role mappings for GENERAL_PROJECT
      .then(async () => {
        await deleteGroupRoles(knex, Resource.GENERAL_PROJECT, [
          Action.CREATE,
          Action.READ,
          Action.UPDATE,
          Action.DELETE
        ]);
      })

      // Remove role to policy mappings for GENERAL_PROJECT
      .then(async () => {
        await deleteRolePolicies(knex, Resource.GENERAL_PROJECT, [
          Action.CREATE,
          Action.READ,
          Action.UPDATE,
          Action.DELETE
        ]);
      })

      // Remove the GENERAL_PROJECT roles
      .then(async () => {
        await deleteRoles(knex, Resource.GENERAL_PROJECT, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]);
      })

      // Remove the GENERAL_PROJECT policies
      .then(async () => {
        await deletePolicies(knex, [Resource.GENERAL_PROJECT]);
      })

      // Remove the GENERAL initiative groups
      .then(async () => {
        await deleteGroups(knex, Initiative.GENERAL, [
          GroupName.ADMIN,
          GroupName.NAVIGATOR,
          GroupName.NAVIGATOR_READ_ONLY,
          GroupName.PROPONENT,
          GroupName.SUPERVISOR
        ]);
      })

      // Remove the GENERAL_PROJECT resource
      .then(async () => {
        await deleteResources(knex, [Resource.GENERAL_PROJECT]);
      })

      // Drop audit triggers
      .then(async () => await dropAuditLogTrigger(knex, 'public', 'general_project'))

      // Drop public schema table triggers
      .then(async () => await dropUpdatedAtTrigger(knex, 'public', 'general_project'))

      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('general_project'))

      // Delete data
      .then(async () => {
        const general = await knex
          .select('initiative_id')
          .from('initiative')
          .where({
            code: Initiative.GENERAL
          })
          .first<{ initiative_id: string }>();

        knex('permit_type_initiative_xref').where('initiative_id', general).del();
      })
      .then(() => knex('draft_code').where('draft_code', Resource.GENERAL_PROJECT).del())
      .then(() => knex('initiative').where('code', Initiative.GENERAL).del())
  );
}
