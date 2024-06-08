/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('submission', function (table) {
        // Add new columns
        table.text('is_developed_by_company_or_org');
        table.text('is_developed_in_bc');
        table.text('multi_family_units');
        table.text('other_units');
        table.text('other_units_description');
        table.text('rental_units');
        table.text('project_location');
        table.text('project_location_description');
        table.text('locality');
        table.text('province');
        table.text('has_applied_provincial_permits');
        table.text('check_provincial_permits');
        table.text('indigenous_description');
        table.text('non_profit_description');
        table.text('housing_coop_description');
        table.text('submission_type');

        // Rename columns
        table.renameColumn('is_rental_unit', 'has_rental_units');

        // Change column types
        table.setNullable('has_rental_units');

        // Drop columns
        table.dropColumn('guidance');
        table.dropColumn('status_request');
        table.dropColumn('inquiry');
        table.dropColumn('emergency_assist');
        table.dropColumn('inapplicable');
      })
    )

    .then(() =>
      knex.schema.raw(`alter table public.submission
        alter column has_rental_units drop default;`)
    )

    .then(() =>
      knex.schema.raw(`alter table public.submission
        alter column financially_supported_bc drop default,
        alter column financially_supported_bc drop not null,
        alter column financially_supported_bc set data type text
        using case
            when financially_supported_bc = true then 'Yes'
            when financially_supported_bc = false then 'No'
        end,
        add constraint submission_financially_supported_bc_check check (
          case
            when intake_status <> 'Draft' then financially_supported_bc in ('Yes', 'No', 'Unsure')
            else true
          end
        );`)
    )

    .then(() =>
      knex.schema.raw(`alter table public.submission
        alter column financially_supported_indigenous drop default,
        alter column financially_supported_indigenous drop not null,
        alter column financially_supported_indigenous set data type text
        using case
            when financially_supported_indigenous = true then 'Yes'
            when financially_supported_indigenous = false then 'No'
        end,
        add constraint submission_financially_supported_indigenous_check check (
          case
            when intake_status <> 'Draft' then financially_supported_indigenous in ('Yes', 'No', 'Unsure')
            else true
          end
        );`)
    )

    .then(() =>
      knex.schema.raw(`alter table public.submission
        alter column financially_supported_non_profit drop default,
        alter column financially_supported_non_profit drop not null,
        alter column financially_supported_non_profit set data type text
        using case
            when financially_supported_non_profit = true then 'Yes'
            when financially_supported_non_profit = false then 'No'
        end,
        add constraint submission_financially_supported_non_profit_check check (
          case
            when intake_status <> 'Draft' then financially_supported_non_profit in ('Yes', 'No', 'Unsure')
            else true
          end
        );`)
    )

    .then(() =>
      knex.schema.raw(`alter table public.submission
        alter column financially_supported_housing_coop drop default,
        alter column financially_supported_housing_coop drop not null,
        alter column financially_supported_housing_coop set data type text
        using case
            when financially_supported_housing_coop = true then 'Yes'
            when financially_supported_housing_coop = false then 'No'
        end,
        add constraint submission_financially_supported_housing_coop_check check (
          case
            when intake_status <> 'Draft' then financially_supported_housing_coop in ('Yes', 'No', 'Unsure')
            else true
          end
        );`)
    )

    .then(() =>
      knex.schema.raw(`drop function public.get_activity_statistics(
        date_from text,
        date_to text,
        month_year text,
        user_id uuid
      )`)
    )

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
    )

    .then(() =>
      knex.schema.alterTable('permit', function (table) {
        table.timestamp('status_last_verified', { useTz: true });
      })
    );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() =>
        knex.schema.alterTable('permit', function (table) {
          table.dropColumn('status_last_verified');
        })
      )

      .then(() =>
        knex.schema.raw(`drop function public.get_activity_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )`)
      )

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
          queue_0 bigint,
          queue_1 bigint,
          queue_2 bigint,
          queue_3 bigint,
          queue_4 bigint,
          queue_5 bigint,
          guidance bigint,
          status_request bigint,
          inquiry bigint,
          emergency_assist bigint,
          inapplicable bigint
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
              count(*) filter (where s."queue_priority" = 0),
              count(*) filter (where s."queue_priority" = 1),
              count(*) filter (where s."queue_priority" = 2),
              count(*) filter (where s."queue_priority" = 3),
              count(*) filter (where s."queue_priority" = 4),
              count(*) filter (where s."queue_priority" = 5),
              count(*) filter (where s."guidance" = true),
              count(*) filter (where s."status_request" = true),
              count(*) filter (where s."inquiry" = true),
              count(*) filter (where s."emergency_assist" = true),
              count(*) filter (where s."inapplicable" = true)
            from public.submission s;
        end; $$`)
      )

      .then(() =>
        knex.schema.raw(`alter table public.submission
        drop constraint submission_financially_supported_housing_coop_check,
        alter column financially_supported_housing_coop set data type boolean
        using case
            when financially_supported_housing_coop = 'Yes' then true
            else false
        end,
        alter column financially_supported_housing_coop set not null,
        alter column financially_supported_housing_coop set default false;`)
      )

      .then(() =>
        knex.schema.raw(`alter table public.submission
        drop constraint submission_financially_supported_non_profit_check,
        alter column financially_supported_non_profit set data type boolean
        using case
            when financially_supported_non_profit = 'Yes' then true
            else false
        end,
        alter column financially_supported_non_profit set not null,
        alter column financially_supported_non_profit set default false;`)
      )

      .then(() =>
        knex.schema.raw(`alter table public.submission
        drop constraint submission_financially_supported_indigenous_check,
        alter column financially_supported_indigenous set data type boolean
        using case
            when financially_supported_indigenous = 'Yes' then true
            else false
        end,
        alter column financially_supported_indigenous set not null,
        alter column financially_supported_indigenous set default false;`)
      )

      .then(() =>
        knex.schema.raw(`alter table public.submission
        drop constraint submission_financially_supported_bc_check,
        alter column financially_supported_bc set data type boolean
        using case
            when financially_supported_bc = 'Yes' then true
            else false
        end,
        alter column financially_supported_bc set not null,
        alter column financially_supported_bc set default false;`)
      )

      .then(() =>
        knex.schema.raw(`alter table public.submission
        alter column has_rental_units set default 'Unsure'::text;`)
      )

      // Have to set nulls to default before dropping nullable
      .then(() =>
        knex.schema.raw(`update public.submission
        set has_rental_units = 'Unsure' where has_rental_units is null;`)
      )

      .then(() =>
        knex.schema.alterTable('submission', function (table) {
          table.boolean('guidance');
          table.boolean('status_request');
          table.boolean('inquiry');
          table.boolean('emergency_assist');
          table.boolean('inapplicable');

          table.dropNullable('has_rental_units');

          table.renameColumn('has_rental_units', 'is_rental_unit');

          table.dropColumn('submission_type');
          table.dropColumn('housing_coop_description');
          table.dropColumn('non_profit_description');
          table.dropColumn('indigenous_description');
          table.dropColumn('check_provincial_permits');
          table.dropColumn('has_applied_provincial_permits');
          table.dropColumn('province');
          table.dropColumn('locality');
          table.dropColumn('project_location_description');
          table.dropColumn('project_location');
          table.dropColumn('rental_units');
          table.dropColumn('other_units_description');
          table.dropColumn('other_units');
          table.dropColumn('multi_family_units');
          table.dropColumn('is_developed_in_bc');
          table.dropColumn('is_developed_by_company_or_org');
        })
      )
  );
}
