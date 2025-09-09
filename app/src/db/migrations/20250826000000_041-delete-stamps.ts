/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add delete stamps
      .then(() =>
        knex.schema.hasColumn('access_request', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('access_request', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('activity', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('activity', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('activity_contact', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('activity_contact', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('contact', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('contact', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('document', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('document', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('draft', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('draft', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('draft_code', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('draft_code', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('electrification_project', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('electrification_project', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('electrification_project_category_code', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('electrification_project_category_code', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('electrification_project_type_code', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('electrification_project_type_code', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('email_log', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('email_log', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('enquiry', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('enquiry', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('housing_project', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('housing_project', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('identity_provider', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('identity_provider', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('initiative', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('initiative', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('note', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('note', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('note_history', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('note_history', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('permit', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('permit', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('permit_note', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('permit_note', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('permit_tracking', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('permit_tracking', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('permit_type', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('permit_type', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('permit_type_initiative_xref', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('permit_type_initiative_xref', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('source_system_code', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('source_system_code', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('source_system_kind', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('source_system_kind', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema.hasColumn('user', 'deleted_at').then(function (exists) {
          if (!exists) {
            return knex.schema.alterTable('user', function (table) {
              table.text('deleted_by');
              table.timestamp('deleted_at', { useTz: true });
            });
          }
        })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('action', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.action', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('attribute', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.attribute', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('attribute_group', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.attribute_group', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('group', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.group', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('group_role', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.group_role', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('policy', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.policy', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('policy_attribute', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.policy_attribute', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('resource', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.resource', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('role', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.role', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('role_policy', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.role_policy', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      .then(() =>
        knex.schema
          .withSchema('yars')
          .hasColumn('subject_group', 'deleted_at')
          .then(function (exists) {
            if (!exists) {
              return knex.schema.alterTable('yars.subject_group', function (table) {
                table.text('deleted_by');
                table.timestamp('deleted_at', { useTz: true });
              });
            }
          })
      )

      // Set delete stamps to last updated for tables that had an is_deleted flag
      .then(() =>
        knex.schema.raw(`update public.activity
          set deleted_by = updated_by, deleted_at = updated_at
          where is_deleted = true;`)
      )

      .then(() =>
        knex.schema.raw(`update public.note_history
          set deleted_by = updated_by, deleted_at = updated_at
          where is_deleted = true;`)
      )

      .then(() =>
        knex.schema.raw(`update public.permit_note
          set deleted_by = updated_by, deleted_at = updated_at
          where is_deleted = true;`)
      )

      // Set delete stamps for tables that were deleted by association to an activity
      .then(() =>
        knex.schema.raw(`update public.enquiry as e
          set deleted_by = a.updated_by, deleted_at = a.updated_at
          from public.activity as a
          where e.activity_id = a.activity_id and a.is_deleted = true;`)
      )

      .then(() =>
        knex.schema.raw(`update public.electrification_project as ep
          set deleted_by = a.updated_by, deleted_at = a.updated_at
          from public.activity as a
          where ep.activity_id = a.activity_id and a.is_deleted = true;`)
      )

      .then(() =>
        knex.schema.raw(`update public.housing_project as hp
          set deleted_by = a.updated_by, deleted_at = a.updated_at
          from public.activity as a
          where hp.activity_id = a.activity_id and a.is_deleted = true;`)
      )

      // Drop is_deleted
      .then(() =>
        knex.schema.alterTable('activity', function (table) {
          table.dropColumn('is_deleted');
        })
      )

      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.dropColumn('is_deleted');
        })
      )

      .then(() =>
        knex.schema.alterTable('permit_note', function (table) {
          table.dropColumn('is_deleted');
        })
      )

      // Drop public schema functions
      .then(() =>
        knex.schema.raw(`drop function public.get_electrification_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )`)
      )

      .then(() =>
        knex.schema.raw(`drop function public.get_housing_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )`)
      )

      .then(() =>
        knex.schema.raw(`create or replace function public.get_electrification_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )
        returns table (total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
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

      // Create public schema functions
      .then(() =>
        knex.schema.raw(`create or replace function public.get_housing_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )
        returns table (total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, supported_bc bigint, supported_indigenous bigint, supported_non_profit bigint, supported_housing_coop bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
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
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop public schema functions
      .then(() =>
        knex.schema.raw(`drop function public.get_electrification_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )`)
      )

      .then(() =>
        knex.schema.raw(`drop function public.get_housing_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )`)
      )

      .then(() =>
        knex.schema.raw(`create or replace function public.get_electrification_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )
        returns table (total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
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

      // Create public schema functions
      .then(() =>
        knex.schema.raw(`create or replace function public.get_housing_statistics(
          date_from text,
          date_to text,
          month_year text,
          user_id uuid
        )
        returns table (total_submissions bigint, total_submissions_between bigint, total_submissions_monthyear bigint, total_submissions_assignedto bigint, state_new bigint, state_inprogress bigint, state_delayed bigint, state_completed bigint, supported_bc bigint, supported_indigenous bigint, supported_non_profit bigint, supported_housing_coop bigint, queue_1 bigint, queue_2 bigint, queue_3 bigint, escalation bigint, general_enquiry bigint, guidance bigint, inapplicable bigint, status_request bigint, multi_permits_needed bigint)
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
              where a.is_deleted = false and hp.intake_status <> 'Draft'
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
              where a.is_deleted = false and e.intake_status <> 'Draft' and i.code = 'HOUSING')
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

      // Add is_deleted back
      .then(() =>
        knex.schema.alterTable('permit_note', function (table) {
          table.boolean('is_deleted').notNullable().defaultTo(false);
        })
      )

      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.boolean('is_deleted').notNullable().defaultTo(false);
        })
      )

      .then(() =>
        knex.schema.alterTable('activity', function (table) {
          table.boolean('is_deleted').notNullable().defaultTo(false);
        })
      )

      // Set is_deleted flag if delete stamps filled
      .then(() =>
        knex.schema.raw(`update public.permit_note
          set is_deleted = true
          where deleted_at is not null;`)
      )

      .then(() =>
        knex.schema.raw(`update public.note_history
          set is_deleted = true
          where deleted_at is not null;`)
      )

      .then(() =>
        knex.schema.raw(`update public.activity
          set is_deleted = true
          where deleted_at is not null;`)
      )

      // Drop delete stamps
      .then(() =>
        knex.schema.alterTable('yars.subject_group', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.role_policy', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.role', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.resource', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.policy_attribute', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.policy', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.group_role', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.group', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.attribute_group', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.attribute', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('yars.action', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('user', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('source_system_kind', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('source_system_code', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('permit_type_initiative_xref', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('permit_type', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('permit_tracking', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('permit_note', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('permit', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('note', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('initiative', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('identity_provider', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('enquiry', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('email_log', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('electrification_project_type_code', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('electrification_project_category_code', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('electrification_project', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('draft_code', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('draft', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('document', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('contact', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('activity_contact', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('activity', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )

      .then(() =>
        knex.schema.alterTable('access_request', function (table) {
          table.dropColumn('deleted_at');
          table.dropColumn('deleted_by');
        })
      )
  );
}
