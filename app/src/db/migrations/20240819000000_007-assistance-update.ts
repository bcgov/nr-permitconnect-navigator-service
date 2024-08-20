/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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
      returns table (
        total_submissions bigint,
        total_submissions_between bigint,
        total_submissions_monthyear bigint,
        total_submissions_assignedto bigint,
        intake_submitted bigint,
        intake_assigned bigint,
        intake_completed bigint,
        state_new bigint,
        state_inprogress bigint,
        state_delayed bigint,
        state_completed bigint,
        supported_bc bigint,
        supported_indigenous bigint,
        supported_non_profit bigint,
        supported_housing_coop bigint,
        waiting_on bigint,
        queue_1 bigint,
        queue_2 bigint,
        queue_3 bigint,
        assistance bigint,
        escalation bigint,
        general_enquiry bigint,
        guidance bigint,
        inapplicable bigint,
        status_request bigint
      )
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
              count(*) filter (where s."submission_type" = 'Inapplicable') as inapplicable_submission_count
            from public.submission s
            join public.activity a on s.activity_id = a.activity_id
            where a.is_deleted = false
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
              count(*) filter (where e."enquiry_type" = 'Assistance') assistance_enquiry_count,
              count(*) filter (where e."enquiry_type" = 'Escalation') escalation_enquiry_count,
              count(*) filter (where e."enquiry_type" = 'General enquiry') general_enquiry_count,
              count(*) filter (where e."enquiry_type" = 'Inapplicable') as inapplicable_enquiry_count,
              count(*) filter (where e."enquiry_type" = 'Status request') as status_request_enquiry_count
            from public.enquiry e
            join public.activity a on e.activity_id = a.activity_id
            where a.is_deleted = false)
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
          (enquiry_counts.assistance_enquiry_count) AS assistance,
          (enquiry_counts.escalation_enquiry_count) AS escalation,
          (enquiry_counts.general_enquiry_count) AS general_enquiry,
          (submission_counts.guidance_submission_count) AS guidance,
          (submission_counts.inapplicable_submission_count + enquiry_counts.inapplicable_enquiry_count) AS inapplicable,
          (enquiry_counts.status_request_enquiry_count) AS status_request
      from submission_counts, enquiry_counts;
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
      returns table (
        total_submissions bigint,
        total_submissions_between bigint,
        total_submissions_monthyear bigint,
        total_submissions_assignedto bigint,
        intake_submitted bigint,
        intake_assigned bigint,
        intake_completed bigint,
        state_new bigint,
        state_inprogress bigint,
        state_delayed bigint,
        state_completed bigint,
        supported_bc bigint,
        supported_indigenous bigint,
        supported_non_profit bigint,
        supported_housing_coop bigint,
        waiting_on bigint,
        queue_1 bigint,
        queue_2 bigint,
        queue_3 bigint,
        escalation bigint,
        general_enquiry bigint,
        guidance bigint,
        inapplicable bigint,
        status_request bigint
      )
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
              count(*) filter (where s."submission_type" = 'Inapplicable') as inapplicable_submission_count
            from public.submission s
            join public.activity a on s.activity_id = a.activity_id
            where a.is_deleted = false
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
              count(*) filter (where e."enquiry_type" = 'Escalation') escalation_enquiry_count,
              count(*) filter (where e."enquiry_type" = 'General enquiry') general_enquiry_count,
              count(*) filter (where e."enquiry_type" = 'Inapplicable') as inapplicable_enquiry_count,
              count(*) filter (where e."enquiry_type" = 'Status request') as status_request_enquiry_count
            from public.enquiry e
            join public.activity a on e.activity_id = a.activity_id
            where a.is_deleted = false)
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
          (enquiry_counts.status_request_enquiry_count) AS status_request
      from submission_counts, enquiry_counts;
      end; $$`)
      )
  );
}
