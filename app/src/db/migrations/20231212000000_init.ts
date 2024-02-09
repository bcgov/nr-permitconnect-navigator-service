/* eslint-disable max-len */
import { NIL } from 'uuid';

import stamps from '../stamps';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Create public schema triggers
      .then(() =>
        knex.schema.raw(`create or replace function set_updated_at()
          returns trigger
          language plpgsql
          as $$
          begin
            new."updated_at" = now();
            return new;
          end;
          $$`)
      )

      // Create public schema tables
      .then(() =>
        knex.schema.createTable('identity_provider', (table) => {
          table.text('idp').primary();
          table.boolean('active').notNullable().defaultTo(true);
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('user', (table) => {
          table.uuid('user_id').primary();
          table.uuid('identity_id').index();
          table.text('idp').references('idp').inTable('identity_provider').onUpdate('CASCADE').onDelete('CASCADE');
          table.text('username').notNullable().index();
          table.text('email').index();
          table.text('first_name');
          table.text('full_name');
          table.text('last_name');
          table.boolean('active').notNullable().defaultTo(true);
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('initiative', (table) => {
          table.uuid('initiative_id').primary();
          table.text('type').notNullable();
          table.text('name').notNullable();
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('activity', (table) => {
          table.uuid('activity_id').primary();
          table
            .uuid('initiative_id')
            .references('initiative_id')
            .inTable('initiative')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('submission', (table) => {
          table.uuid('submission_id').primary();
          table.text('activity_id').notNullable();
          table.uuid('assigned_user_id').references('user_id').inTable('user').onUpdate('CASCADE').onDelete('CASCADE');
          table.timestamp('submitted_at', { useTz: true }).notNullable();
          table.text('submitted_by').notNullable();
          table.text('location_pids');
          table.text('company_name_registered');
          table.text('contact_name');
          table.text('contact_phone_number');
          table.text('contact_email');
          table.text('project_name');
          table.text('single_family_units');
          table.text('street_address');
          table.integer('latitude');
          table.integer('longitude');
          table.integer('queue_priority');
          table.text('related_permits');
          table.text('ast_notes');
          table.boolean('ast_updated').notNullable().defaultTo(false);
          table.boolean('added_to_ats').notNullable().defaultTo(false);
          table.text('ats_client_number');
          table.boolean('ltsa_completed').notNullable().defaultTo(false);
          table.boolean('bc_online_completed').notNullable().defaultTo(false);
          table.boolean('natural_disaster').notNullable().defaultTo(false);
          table.boolean('financially_supported').notNullable().defaultTo(false);
          table.boolean('financially_supported_bc').notNullable().defaultTo(false);
          table.boolean('financially_supported_indigenous').notNullable().defaultTo(false);
          table.boolean('financially_supported_non_profit').notNullable().defaultTo(false);
          table.boolean('financially_supported_housing_coop').notNullable().defaultTo(false);
          table.boolean('aai_updated').notNullable().defaultTo(false);
          table.text('waiting_on');
          table.timestamp('bring_forward_date', { useTz: true });
          table.text('notes');
          table.text('intake_status');
          table.text('application_status');
          table.boolean('guidance').notNullable().defaultTo(false);
          table.boolean('status_request').notNullable().defaultTo(false);
          table.boolean('inquiry').notNullable().defaultTo(false);
          table.boolean('emergency_assist').notNullable().defaultTo(false);
          table.boolean('inapplicable').notNullable().defaultTo(false);
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('document', (table) => {
          table.uuid('document_id').primary();
          table
            .uuid('submission_id')
            .notNullable()
            .references('submission_id')
            .inTable('submission')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table.text('filename').notNullable();
          table.text('mime_type').defaultTo('application/octet-stream').notNullable();
          table.bigInteger('filesize').notNullable();
          stamps(knex, table);
          table.unique(['document_id', 'submission_id']);
        })
      )

      .then(() =>
        knex.schema.createTable('permit_type', (table) => {
          table.specificType('permit_type_id', 'integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY');
          table.text('agency').notNullable();
          table.text('division');
          table.text('branch');
          table.text('business_domain').notNullable();
          table.text('type').notNullable();
          table.text('family');
          table.text('name').notNullable();
          table.text('name_subtype');
          table.text('acronym');
          table.boolean('tracked_in_ats').notNullable().defaultTo(false);
          table.text('source_system');
          table.text('source_system_acronym').notNullable();
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('permit', (table) => {
          table.uuid('permit_id').primary();
          table
            .integer('permit_type_id')
            .notNullable()
            .references('permit_type_id')
            .inTable('permit_type')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table
            .uuid('submission_id')
            .notNullable()
            .references('submission_id')
            .inTable('submission')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table.text('issued_permit_id');
          table.text('tracking_id');
          table.text('auth_status');
          table.text('needed');
          table.text('status');
          table.timestamp('submitted_date', { useTz: true });
          table.timestamp('adjudication_date', { useTz: true });
          stamps(knex, table);
          table.unique(['permit_id', 'permit_type_id', 'submission_id']);
        })
      )

      // Create public schema table triggers
      .then(() =>
        knex.schema.raw(`create trigger before_update_identity_provider_trigger
        before update on public.identity_provider
        for each row execute procedure public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`create trigger before_update_user_trigger
        before update on "user"
        for each row execute procedure public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`create trigger before_update_submission_trigger
        before update on public.submission
        for each row execute procedure public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`create trigger before_update_document_trigger
        before update on public.document
        for each row execute procedure public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`create trigger before_update_permit_type_trigger
          before update on public.permit_type
          for each row execute procedure public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`create trigger before_insert_permit_trigger
          before insert on public.permit
          for each row execute procedure public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`create trigger before_update_permit_trigger
          before update on public.permit
          for each row execute procedure public.set_updated_at();`)
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

      // Create audit schema and logged_actions table
      .then(() => knex.schema.raw('CREATE SCHEMA IF NOT EXISTS audit'))

      .then(() =>
        knex.schema.withSchema('audit').createTable('logged_actions', (table) => {
          table.specificType('id', 'integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY');
          table.text('schema_name').notNullable().index();
          table.text('table_name').notNullable().index();
          table.text('db_user').notNullable();
          table.text('updated_by_username');
          table.timestamp('action_timestamp', { useTz: true }).defaultTo(knex.fn.now()).index();
          table.text('action').notNullable().index();
          table.json('original_data');
          table.json('new_data');
        })
      )

      .then(() =>
        knex.schema.raw(`CREATE OR REPLACE FUNCTION audit.if_modified_func() RETURNS trigger AS $body$
          DECLARE
              v_old_data json;
              v_new_data json;

          BEGIN
              if (TG_OP = 'UPDATE') then
                  v_old_data := row_to_json(OLD);
                  v_new_data := row_to_json(NEW);
                  insert into audit.logged_actions ("schema_name", "table_name", "db_user", "updated_by_username", "action_timestamp", "action", "original_data", "new_data")
                  values (TG_TABLE_SCHEMA::TEXT, TG_TABLE_NAME::TEXT, SESSION_USER::TEXT, NEW."updated_by", now(), TG_OP::TEXT, v_old_data, v_new_data);
                  RETURN NEW;
              elsif (TG_OP = 'DELETE') then
                  v_old_data := row_to_json(OLD);
                  insert into audit.logged_actions ("schema_name", "table_name", "db_user", "action_timestamp", "action", "original_data")
                  values (TG_TABLE_SCHEMA::TEXT, TG_TABLE_NAME::TEXT, SESSION_USER::TEXT, now(), TG_OP::TEXT, v_old_data);
                  RETURN OLD;
              else
                  RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - Other action occurred: %, at %', TG_OP, now();
                  RETURN NULL;
              end if;

          EXCEPTION
              WHEN data_exception THEN
                  RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - UDF ERROR [DATA EXCEPTION] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
                  RETURN NULL;
              WHEN unique_violation THEN
                  RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - UDF ERROR [UNIQUE] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
                  RETURN NULL;
              WHEN others THEN
                  RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - UDF ERROR [OTHER] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
                  RETURN NULL;

          END;
          $body$
          LANGUAGE plpgsql
          SECURITY DEFINER
          SET search_path = pg_catalog, audit;`)
      )

      // Create audit triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_identity_provider_trigger
          AFTER UPDATE OR DELETE ON identity_provider
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_user_trigger
          AFTER UPDATE OR DELETE ON "user"
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_submission_trigger
          AFTER UPDATE OR DELETE ON submission
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_document_trigger
          AFTER UPDATE OR DELETE ON document
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_permit_type_trigger
          AFTER UPDATE OR DELETE ON permit_type
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_permit_trigger
          AFTER UPDATE OR DELETE ON permit
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      // Populate Baseline Data
      .then(() => {
        const users = ['system'];
        const items = users.map((user) => ({
          user_id: NIL,
          username: user,
          active: true,
          created_by: NIL
        }));
        return knex('user').insert(items);
      })

      .then(() => {
        const items = [
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Forest Resiliency and Archaeology',
            branch: 'Archaeology',
            business_domain: 'Archaeology',
            type: 'Alteration',
            name: 'Site Alteration Permit',
            acronym: 'SAP',
            tracked_in_ats: false,
            source_system: 'Archaeology Permit Tracking System',
            source_system_acronym: 'APTS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Forest Resiliency and Archaeology',
            branch: 'Archaeology',
            business_domain: 'Archaeology',
            type: 'Inspection',
            name: 'Heritage Inspection Permit',
            acronym: 'HIP',
            tracked_in_ats: false,
            source_system: 'Archaeology Permit Tracking System',
            source_system_acronym: 'APTS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Forest Resiliency and Archaeology',
            branch: 'Archaeology',
            business_domain: 'Archaeology',
            type: 'Investigation',
            name: 'Investigation Permit',
            tracked_in_ats: false,
            source_system: 'Archaeology Permit Tracking System',
            source_system_acronym: 'APTS'
          },
          {
            agency: 'Environment and Climate Change Strategy',
            division: 'Environmental Protection',
            branch: 'Environmental Emergencies and Land Remediation',
            business_domain: 'Contaminated Sites',
            type: 'Contaminated Sites Remediation',
            name: 'Contaminated Sites Remediation Permit',
            tracked_in_ats: false,
            source_system: 'Contaminated Sites Application Tracking System',
            source_system_acronym: 'CATS'
          },
          {
            agency: 'Forests',
            division: 'Integrated Resource Operations',
            branch: 'Forest Tenures',
            business_domain: 'Forestry',
            type: 'Occupant Licence To Cut',
            name: 'Occupant Licence to Cut',
            acronym: 'OLTC',
            source_system: 'Forest Tenure Administration',
            source_system_acronym: 'FTA'
          },
          {
            agency: 'Forests',
            division: 'Integrated Resource Operations',
            branch: 'Forest Tenures',
            business_domain: 'Forestry',
            type: 'Private Timber Mark',
            name: 'Private Timber Mark',
            acronym: 'PTM',
            source_system: 'Forest Tenure Administration',
            source_system_acronym: 'FTA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            business_domain: 'Lands',
            type: 'Commercial General',
            family: 'Crown Land Tenure',
            name: 'Commercial General',
            source_system: 'Tantalis',
            source_system_acronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            business_domain: 'Lands',
            type: 'Nominal Rent Tenure',
            family: 'Crown Land Tenure',
            name: 'Nominal Rent Tenure',
            acronym: 'NRT',
            source_system: 'Tantalis',
            source_system_acronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            business_domain: 'Lands',
            type: 'Residential',
            family: 'Crown Land Tenure',
            name: 'Residential',
            source_system: 'Tantalis',
            source_system_acronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            business_domain: 'Lands',
            type: 'Roadways - Public',
            family: 'Crown Land Tenure',
            name: 'Roadways - Public',
            source_system: 'Tantalis',
            source_system_acronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            business_domain: 'Lands',
            type: 'Sponsored Crown Grant',
            family: 'Crown Land Tenure',
            name: 'Sponsored Crown Grant',
            source_system: 'Tantalis',
            source_system_acronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            business_domain: 'Lands',
            type: 'Utilities',
            family: 'Crown Land Tenure',
            name: 'Utilities',
            source_system: 'Tantalis',
            source_system_acronym: 'TANTALIS'
          },
          {
            agency: 'Transportation and Infrastructure',
            business_domain: 'Transportation',
            type: 'Rural Subdivision',
            name: 'Rural subdivision',
            source_system_acronym: 'MOTI'
          },
          {
            agency: 'Transportation and Infrastructure',
            business_domain: 'Transportation',
            type: 'Rezoning',
            name: 'Rezoning',
            source_system_acronym: 'MOTI'
          },
          {
            agency: 'Transportation and Infrastructure',
            business_domain: 'Transportation',
            type: 'Municipal Subdivision',
            name: 'Municipal subdivision',
            source_system_acronym: 'MOTI'
          },
          {
            agency: 'Transportation and Infrastructure',
            business_domain: 'Transportation',
            type: 'Highway Use Permit',
            name: 'Highway Use Permit',
            source_system_acronym: 'MOTI'
          },
          {
            agency: 'Transportation and Infrastructure',
            business_domain: 'Transportation',
            type: 'Other',
            name: 'Other',
            source_system_acronym: 'MOTI'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Fisheries, Aquaculture and Wild Salmon',
            business_domain: 'RAPR',
            type: 'New',
            name: 'Riparian Area Development Permit',
            source_system: 'Riparian Areas Regulation Notification System',
            source_system_acronym: 'RARN'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            business_domain: 'Water',
            type: 'Change Approval for Work in and About a Stream',
            name: 'Change approval for work in and about a stream',
            acronym: 'A-CIAS',
            source_system: 'Water Management Application',
            source_system_acronym: 'WMA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            business_domain: 'Water',
            type: 'Notification',
            name: 'Notification of authorized changes in and about a stream',
            acronym: 'N-CIAS',
            source_system: 'Water Management Application',
            source_system_acronym: 'WMA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            business_domain: 'Water',
            type: 'Use Approval',
            name: 'Short-term use approval',
            acronym: 'STU',
            source_system: 'Water Management Application',
            source_system_acronym: 'WMA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            business_domain: 'Water',
            type: 'New Groundwater Licence',
            family: 'Water Licence',
            name: 'Groundwater Licence - Wells',
            acronym: 'PWD',
            source_system: 'Water Management Application',
            source_system_acronym: 'WMA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            business_domain: 'Water',
            type: 'Water Licence',
            family: 'Water Licence',
            name: 'Surface Water Licence',
            acronym: 'PD',
            source_system: 'Water Management Application',
            source_system_acronym: 'WMA'
          }
        ];

        return knex('permit_type').insert(items);
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop audit triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_permit_trigger ON permit'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_permit_type_trigger ON permit_type'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_document_trigger ON document'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_submission_trigger ON submission'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_user_trigger ON "user"'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_identity_provider_trigger ON identity_provider'))
      // Drop audit schema and logged_actions table
      .then(() => knex.schema.raw('DROP FUNCTION IF EXISTS audit.if_modified_func'))
      .then(() => knex.schema.withSchema('audit').dropTableIfExists('logged_actions'))
      .then(() => knex.schema.dropSchemaIfExists('audit'))
      // Drop public schema functions
      .then(() => knex.schema.raw('DROP FUNCTION IF EXISTS public.get_activity_statistics'))
      // Drop public schema table triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_permit_trigger ON permit'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_insert_permit_trigger ON permit'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_permit_type_trigger ON permit_type'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_document_trigger ON document'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_submission_trigger ON submission'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_user_trigger ON "user"'))
      .then(() =>
        knex.schema.raw('DROP TRIGGER IF EXISTS before_update_identity_provider_trigger ON identity_provider')
      )
      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('permit'))
      .then(() => knex.schema.dropTableIfExists('permit_type'))
      .then(() => knex.schema.dropTableIfExists('document'))
      .then(() => knex.schema.dropTableIfExists('submission'))
      .then(() => knex.schema.dropTableIfExists('activity'))
      .then(() => knex.schema.dropTableIfExists('initiative'))
      .then(() => knex.schema.dropTableIfExists('user'))
      .then(() => knex.schema.dropTableIfExists('identity_provider'))
      // Drop public schema triggers
      .then(() => knex.schema.raw('DROP FUNCTION IF EXISTS public.set_updated_at'))
  );
}
