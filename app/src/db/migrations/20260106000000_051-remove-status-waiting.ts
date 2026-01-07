/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Remove intake_status & waiting_on from enquiry, housing_project, electrification_project & statistics functions
      .then(() =>
        knex.schema.alterTable('enquiry', function (table) {
          table.dropColumn('intake_status');
          table.dropColumn('waiting_on');
        })
      )
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropColumn('intake_status');
          table.dropColumn('waiting_on');
        })
      )
      .then(() =>
        knex.schema.alterTable('electrification_project', function (table) {
          table.dropColumn('intake_status');
        })
      )
      .then(() =>
        knex.schema
          .raw(`create or replace function public.get_housing_statistics(date_from text, date_to text, month_year text, user_id uuid)
 returns table(total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, supported_bc bigint, supported_indigenous bigint, supported_non_profit bigint, supported_housing_coop bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
 language plpgsql
AS $$
        begin
            return query
            with housing_project_counts as (
              select
                count(*) as housing_project_count,
                (select count(*) from public.housing_project where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as housing_project_count_between,
                (select count(*) from public.housing_project where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as housing_project_count_monthyear,
                (select count(*) from public.housing_project where "assigned_user_id" = user_id) as housing_project_count_assignedto,
                count(*) filter (where hp."application_status" = 'New') as state_new_housing_project_count,
                count(*) filter (where hp."application_status" = 'In Progress') as state_inprogress_housing_project_count,
                count(*) filter (where hp."application_status" = 'Delayed') as state_delayed_housing_project_count,
                count(*) filter (where hp."application_status" = 'Completed') as state_completed_housing_project_count,
                count(*) filter (where hp."financially_supported_bc" = 'Yes') as supported_bc_housing_project_count,
                count(*) filter (where hp."financially_supported_indigenous" = 'Yes') as supported_indigenous_housing_project_count,
                count(*) filter (where hp."financially_supported_non_profit" = 'Yes') as supported_non_profit_housing_project_count,
                count(*) filter (where hp."financially_supported_housing_coop" = 'Yes') as supported_housing_coop_housing_project_count,
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
              where a.deleted_at is null and i.code = 'HOUSING')
        select
            (housing_project_counts.housing_project_count + enquiry_counts.enquiry_count) AS total_submissions,
            (housing_project_counts.housing_project_count_between + enquiry_counts.enquiry_count_between) AS total_submissions_between,
            (housing_project_counts.housing_project_count_monthyear + enquiry_counts.enquiry_count_monthyear) AS total_submissions_monthyear,
            (housing_project_counts.housing_project_count_assignedto + enquiry_counts.enquiry_count_assignedto) AS total_submissions_assignedto,
            (housing_project_counts.state_new_housing_project_count) AS state_new,
            (housing_project_counts.state_inprogress_housing_project_count) AS state_inprogress,
            (housing_project_counts.state_delayed_housing_project_count) AS state_delayed,
            (housing_project_counts.state_completed_housing_project_count) AS state_completed,
            (housing_project_counts.supported_bc_housing_project_count) AS supported_bc,
            (housing_project_counts.supported_indigenous_housing_project_count) AS supported_indigenous,
            (housing_project_counts.supported_non_profit_housing_project_count) AS supported_non_profit,
            (housing_project_counts.supported_housing_coop_housing_project_count) AS supported_housing_coop,
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

      .then(() =>
        knex.schema
          .raw(`create or replace function public.get_electrification_statistics(date_from text, date_to text, month_year text, user_id uuid)
returns table(total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
 language plpgsql
AS $$
        begin
            return query
            with electrification_project_counts as (
              select
                count(*) as electrification_project_count,
                (select count(*) from public.electrification_project where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as electrification_project_count_between,
                (select count(*) from public.electrification_project where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as electrification_project_count_monthyear,
                (select count(*) from public.electrification_project where "assigned_user_id" = user_id) as electrification_project_count_assignedto,
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
              where a.deleted_at is null and i.code = 'ELECTRIFICATION')
        select
            (electrification_project_counts.electrification_project_count + enquiry_counts.enquiry_count) AS total_submissions,
            (electrification_project_counts.electrification_project_count_between + enquiry_counts.enquiry_count_between) AS total_submissions_between,
            (electrification_project_counts.electrification_project_count_monthyear + enquiry_counts.enquiry_count_monthyear) AS total_submissions_monthyear,
            (electrification_project_counts.electrification_project_count_assignedto + enquiry_counts.enquiry_count_assignedto) AS total_submissions_assignedto,
            (electrification_project_counts.state_new_electrification_project_count) AS state_new,
            (electrification_project_counts.state_inprogress_electrification_project_count) AS state_inprogress,
            (electrification_project_counts.state_delayed_electrification_project_count) AS state_delayed,
            (electrification_project_counts.state_completed_electrification_project_count) AS state_completed,
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
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add intake_status & waiting_on columns to enquiry, housing_project, electrification_project & statistics functions
      .then(() =>
        knex.schema
          .raw(`create or replace function public.get_electrification_statistics(date_from text, date_to text, month_year text, user_id uuid)
 returns table(total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
 language plpgsql
AS $$
        begin
            return query
            with electrification_project_counts as (
              select
                count(*) as electrification_project_count,
                (select count(*) from public.electrification_project where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as electrification_project_count_between,
                (select count(*) from public.electrification_project where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as electrification_project_count_monthyear,
                (select count(*) from public.electrification_project where "assigned_user_id" = user_id) as electrification_project_count_assignedto,
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
              where a.deleted_at is null and ep.intake_status <> 'Draft'
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
              where a.deleted_at is null and e.intake_status <> 'Draft' and i.code = 'ELECTRIFICATION')
        select
            (electrification_project_counts.electrification_project_count + enquiry_counts.enquiry_count) AS total_submissions,
            (electrification_project_counts.electrification_project_count_between + enquiry_counts.enquiry_count_between) AS total_submissions_between,
            (electrification_project_counts.electrification_project_count_monthyear + enquiry_counts.enquiry_count_monthyear) AS total_submissions_monthyear,
            (electrification_project_counts.electrification_project_count_assignedto + enquiry_counts.enquiry_count_assignedto) AS total_submissions_assignedto,
            (electrification_project_counts.state_new_electrification_project_count) AS state_new,
            (electrification_project_counts.state_inprogress_electrification_project_count) AS state_inprogress,
            (electrification_project_counts.state_delayed_electrification_project_count) AS state_delayed,
            (electrification_project_counts.state_completed_electrification_project_count) AS state_completed,
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
        knex.schema
          .raw(`create or replace function public.get_housing_statistics(date_from text, date_to text, month_year text, user_id uuid)
returns table(total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, supported_bc bigint, supported_indigenous bigint, supported_non_profit bigint, supported_housing_coop bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
 language plpgsql
AS $$
        begin
            return query
            with housing_project_counts as (
              select
                count(*) as housing_project_count,
                (select count(*) from public.housing_project where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)) as housing_project_count_between,
                (select count(*) from public.housing_project where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")) as housing_project_count_monthyear,
                (select count(*) from public.housing_project where "assigned_user_id" = user_id) as housing_project_count_assignedto,
                count(*) filter (where hp."application_status" = 'New') as state_new_housing_project_count,
                count(*) filter (where hp."application_status" = 'In Progress') as state_inprogress_housing_project_count,
                count(*) filter (where hp."application_status" = 'Delayed') as state_delayed_housing_project_count,
                count(*) filter (where hp."application_status" = 'Completed') as state_completed_housing_project_count,
                count(*) filter (where hp."financially_supported_bc" = 'Yes') as supported_bc_housing_project_count,
                count(*) filter (where hp."financially_supported_indigenous" = 'Yes') as supported_indigenous_housing_project_count,
                count(*) filter (where hp."financially_supported_non_profit" = 'Yes') as supported_non_profit_housing_project_count,
                count(*) filter (where hp."financially_supported_housing_coop" = 'Yes') as supported_housing_coop_housing_project_count,
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
              where a.deleted_at is null and hp.intake_status <> 'Draft'
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
              where a.deleted_at is null and e.intake_status <> 'Draft' and i.code = 'HOUSING')
        select
            (housing_project_counts.housing_project_count + enquiry_counts.enquiry_count) AS total_submissions,
            (housing_project_counts.housing_project_count_between + enquiry_counts.enquiry_count_between) AS total_submissions_between,
            (housing_project_counts.housing_project_count_monthyear + enquiry_counts.enquiry_count_monthyear) AS total_submissions_monthyear,
            (housing_project_counts.housing_project_count_assignedto + enquiry_counts.enquiry_count_assignedto) AS total_submissions_assignedto,
            (housing_project_counts.state_new_housing_project_count) AS state_new,
            (housing_project_counts.state_inprogress_housing_project_count) AS state_inprogress,
            (housing_project_counts.state_delayed_housing_project_count) AS state_delayed,
            (housing_project_counts.state_completed_housing_project_count) AS state_completed,
            (housing_project_counts.supported_bc_housing_project_count) AS supported_bc,
            (housing_project_counts.supported_indigenous_housing_project_count) AS supported_indigenous,
            (housing_project_counts.supported_non_profit_housing_project_count) AS supported_non_profit,
            (housing_project_counts.supported_housing_coop_housing_project_count) AS supported_housing_coop,
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

      .then(() =>
        knex.schema.alterTable('electrification_project', function (table) {
          table.text('intake_status');
        })
      )

      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.text('intake_status');
          table.text('waiting_on');
        })
      )

      .then(() =>
        knex.schema.alterTable('enquiry', function (table) {
          table.text('intake_status');
          table.text('waiting_on');
        })
      )
  );
}
