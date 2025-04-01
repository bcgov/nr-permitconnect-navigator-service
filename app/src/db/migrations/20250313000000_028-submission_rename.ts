/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() => knex.schema.renameTable('submission', 'housing_project'))

      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.renameColumn('submission_id', 'housing_project_id');
        })
      )

      .then(() =>
        knex.schema.alterTable('enquiry', function (table) {
          table.renameColumn('enquiry_type', 'submission_type');
        })
      )

      .then(() =>
        knex('draft_code').where('draft_code', '=', 'SUBMISSION').update({
          draft_code: 'HOUSING_PROJECT'
        })
      )

      .then(() =>
        knex('yars.resource').where('name', '=', 'SUBMISSION').update({
          name: 'HOUSING_PROJECT'
        })
      )

      .then(async () => {
        await knex('yars.role').where('name', '=', 'SUBMISSION_CREATOR').update({
          name: 'HOUSING_PROJECT_CREATOR',
          description: 'Can create housing_projects'
        });
        await knex('yars.role').where('name', '=', 'SUBMISSION_VIEWER').update({
          name: 'HOUSING_PROJECT_VIEWER',
          description: 'Can view housing_projects'
        });
        await knex('yars.role').where('name', '=', 'SUBMISSION_EDITOR').update({
          name: 'HOUSING_PROJECT_EDITOR',
          description: 'Can edit housing_projects'
        });
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
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
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
            with submission_counts as (
              select
                count(*) as submission_count,
                (select count(*) from public.submission where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as submission_count_between,
                (select count(*) from public.submission where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as submission_count_monthyear,
                (select count(*) from public.submission where "assigned_user_id" = user_id) as submission_count_assignedto,
                count(*) filter (where s."intake_status" = 'Submitted') as intake_submitted_submission_count,
                count(*) filter (where s."intake_status" = 'Assigned') as intake_assigned_submission_count,
                count(*) filter (where s."intake_status" = 'Completed') as intake_completed_submission_count,
                count(*) filter (where s."application_status" = 'New') as state_new_submission_count,
                count(*) filter (where s."application_status" = 'In Progress') as state_inprogress_submission_count,
                count(*) filter (where s."application_status" = 'Delayed') as state_delayed_submission_count,
                count(*) filter (where s."application_status" = 'Completed') as state_completed_submission_count,
                count(*) filter (where s."financially_supported_bc" = 'Yes') as supported_bc_submission_count,
                count(*) filter (where s."financially_supported_indigenous" = 'Yes') as supported_indigenous_submission_count,
                count(*) filter (where s."financially_supported_non_profit" = 'Yes') as supported_non_profit_submission_count,
                count(*) filter (where s."financially_supported_housing_coop" = 'Yes') as supported_housing_coop_submission_count,
                count(*) filter (where s."waiting_on" is not null) as waiting_on_submission_count,
                count(*) filter (where s."queue_priority" = 1) as queue_1_submission_count,
                count(*) filter (where s."queue_priority" = 2) as queue_2_submission_count,
                count(*) filter (where s."queue_priority" = 3) as queue_3_submission_count,
                count(*) filter (where s."submission_type" = 'Guidance') as guidance_submission_count,
                count(*) filter (where s."submission_type" = 'Inapplicable') as inapplicable_submission_count,
                count(distinct s.activity_id) filter (where permit_counts.permit_count > 1) as multi_permits_needed
              from public.submission s
              join public.activity a on s.activity_id = a.activity_id
              left join (
                        select p.activity_id, count(*) as permit_count
                        from public.permit p
                        where p.needed = 'Yes'
                        group by p.activity_id
                        ) permit_counts on permit_counts.activity_id = s.activity_id
              where a.is_deleted = false and s.intake_status <> 'Draft'
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
            (submission_counts.submission_count + enquiry_counts.enquiry_count) AS total_submissions,
            (submission_counts.submission_count_between + enquiry_counts.enquiry_count_between) AS total_submissions_between,
            (submission_counts.submission_count_monthyear + enquiry_counts.enquiry_count_monthyear) AS total_submissions_monthyear,
            (submission_counts.submission_count_assignedto + enquiry_counts.enquiry_count_assignedto) AS total_submissions_assignedto,
            (submission_counts.intake_submitted_submission_count + enquiry_counts.intake_submitted_enquiry_count) AS intake_submitted,
            (submission_counts.intake_assigned_submission_count + enquiry_counts.intake_assigned_enquiry_count) AS intake_assigned,
            (submission_counts.intake_completed_submission_count + enquiry_counts.intake_completed_enquiry_count) AS intake_completed,
            (submission_counts.state_new_submission_count) AS state_new,
            (submission_counts.state_inprogress_submission_count) AS state_inprogress,
            (submission_counts.state_delayed_submission_count) AS state_delayed,
            (submission_counts.state_completed_submission_count) AS state_completed,
            (submission_counts.supported_bc_submission_count) AS supported_bc,
            (submission_counts.supported_indigenous_submission_count) AS supported_indigenous,
            (submission_counts.supported_non_profit_submission_count) AS supported_non_profit,
            (submission_counts.supported_housing_coop_submission_count) AS supported_housing_coop,
            (submission_counts.waiting_on_submission_count + enquiry_counts.waiting_on_enquiry_count) AS waiting_on,
            (submission_counts.queue_1_submission_count) AS queue_1,
            (submission_counts.queue_2_submission_count) AS queue_2,
            (submission_counts.queue_3_submission_count) AS queue_3,
            (enquiry_counts.escalation_enquiry_count) AS escalation,
            (enquiry_counts.general_enquiry_count) AS general_enquiry,
            (submission_counts.guidance_submission_count) AS guidance,
            (submission_counts.inapplicable_submission_count + enquiry_counts.inapplicable_enquiry_count) AS inapplicable,
            (enquiry_counts.status_request_enquiry_count) AS status_request,
            (submission_counts.multi_permits_needed) AS multi_permits_needed
        from submission_counts, enquiry_counts;
        end; $$`)
      )

      .then(async () => {
        await knex('yars.role').where('name', '=', 'HOUSING_PROJECT_CREATOR').update({
          name: 'SUBMISSION_CREATOR',
          description: 'Can create submissions'
        });
        await knex('yars.role').where('name', '=', 'HOUSING_PROJECT_VIEWER').update({
          name: 'SUBMISSION_VIEWER',
          description: 'Can view submissions'
        });
        await knex('yars.role').where('name', '=', 'HOUSING_PROJECT_EDITOR').update({
          name: 'SUBMISSION_EDITOR',
          description: 'Can edit submissions'
        });
      })

      .then(() =>
        knex('yars.resource').where('name', '=', 'HOUSING_PROJECT').update({
          name: 'SUBMISSION'
        })
      )

      .then(() =>
        knex('draft_code').where('draft_code', '=', 'HOUSING_PROJECT').update({
          draft_code: 'SUBMISSION'
        })
      )

      .then(() =>
        knex.schema.alterTable('enquiry', function (table) {
          table.renameColumn('submission_type', 'enquiry_type');
        })
      )

      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.renameColumn('housing_project_id', 'submission_id');
        })
      )

      .then(() => knex.schema.renameTable('housing_project', 'submission'))
  );
}
