import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  Promise.resolve()
    // Add is_deleted column to activity table
    .then(() =>
      knex.schema.alterTable('activity', function (table) {
        table.boolean('is_deleted').notNullable().defaultTo(false);
      })
    )
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
      select
        count(*),
        (select count(*) from public.submission where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)),
        (select count(*) from public.submission where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")),
        (select count(*) from public.submission where "assigned_user_id" = user_id),
        count(*) filter (where s."intake_status" = 'Submitted'),
        count(*) filter (where s."intake_status" = 'Assigned'),
        count(*) filter (where s."intake_status" = 'Completed'),
        count(*) filter (where s."application_status" = 'New'),
        count(*) filter (where s."application_status" = 'In Progress'),
        count(*) filter (where s."application_status" = 'Delayed'),
        count(*) filter (where s."application_status" = 'Completed'),
        count(*) filter (where s."waiting_on" is not null),
        count(*) filter (where s."queue_priority" = 1),
        count(*) filter (where s."queue_priority" = 2),
        count(*) filter (where s."queue_priority" = 3),
        count(*) filter (where s."submission_type" = 'Escalation'),
        count(*) filter (where s."submission_type" = 'General enquiry'),
        count(*) filter (where s."submission_type" = 'Guidance'),
        count(*) filter (where s."submission_type" = 'Inapplicable'),
        count(*) filter (where s."submission_type" = 'Status request')
      from public.submission s
      join public.activity a on s.activity_id = a.activity_id
      where a.is_deleted = false;
  end; $$`)
    );
}

export async function down(knex: Knex): Promise<void> {
  Promise.resolve()
    // Drop is_deleted column from activity table
    .then(() =>
      knex.schema.alterTable('activity', function (table) {
        table.dropColumn('is_deleted');
      })
    )
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
          select
            count(*),
            (select count(*) from public.submission where "submitted_at" between cast(date_from as timestamp) and cast(date_to as timestamp)),
            (select count(*) from public.submission where extract(month from cast(month_year as timestamp)) = extract(month from "submitted_at") and extract(year from cast(month_year as timestamp)) = extract(year from "submitted_at")),
            (select count(*) from public.submission where "assigned_user_id" = user_id),
            count(*) filter (where s."intake_status" = 'Submitted'),
            count(*) filter (where s."intake_status" = 'Assigned'),
            count(*) filter (where s."intake_status" = 'Completed'),
            count(*) filter (where s."application_status" = 'New'),
            count(*) filter (where s."application_status" = 'In Progress'),
            count(*) filter (where s."application_status" = 'Delayed'),
            count(*) filter (where s."application_status" = 'Completed'),
            count(*) filter (where s."waiting_on" is not null),
            count(*) filter (where s."queue_priority" = 1),
            count(*) filter (where s."queue_priority" = 2),
            count(*) filter (where s."queue_priority" = 3),
            count(*) filter (where s."submission_type" = 'Escalation'),
            count(*) filter (where s."submission_type" = 'General enquiry'),
            count(*) filter (where s."submission_type" = 'Guidance'),
            count(*) filter (where s."submission_type" = 'Inapplicable'),
            count(*) filter (where s."submission_type" = 'Status request')
          from public.submission s;
      end; $$`)
    );
}
