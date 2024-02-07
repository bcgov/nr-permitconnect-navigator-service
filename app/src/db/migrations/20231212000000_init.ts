/* eslint-disable max-len */
import { NIL } from 'uuid';

import stamps from '../stamps';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
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
          table.uuid('userId').primary();
          table.uuid('identityId').index();
          table.text('idp').references('idp').inTable('identity_provider').onUpdate('CASCADE').onDelete('CASCADE');
          table.text('username').notNullable().index();
          table.text('email').index();
          table.text('firstName');
          table.text('fullName');
          table.text('lastName');
          table.boolean('active').notNullable().defaultTo(true);
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('submission', (table) => {
          table.uuid('submissionId').primary();
          table.uuid('assignedToUserId').references('userId').inTable('user').onUpdate('CASCADE').onDelete('CASCADE');
          table.text('confirmationId').notNullable();
          table.timestamp('submittedAt', { useTz: true }).notNullable();
          table.text('submittedBy').notNullable();
          table.text('locationPIDs');
          table.text('contactName');
          table.text('contactPhoneNumber');
          table.text('contactEmail');
          table.text('projectName');
          table.text('singleFamilyUnits');
          table.text('streetAddress');
          table.integer('latitude');
          table.integer('longitude');
          table.integer('queuePriority');
          table.text('relatedPermits');
          table.text('astNotes');
          table.boolean('astUpdated');
          table.boolean('addedToATS');
          table.text('atsClientNumber');
          table.boolean('ltsaCompleted');
          table.boolean('bcOnlineCompleted');
          table.boolean('naturalDisaster');
          table.boolean('financiallySupported');
          table.boolean('financiallySupportedBC');
          table.boolean('financiallySupportedIndigenous');
          table.boolean('financiallySupportedNonProfit');
          table.boolean('financiallySupportedHousingCoop');
          table.boolean('aaiUpdated');
          table.text('waitingOn');
          table.timestamp('bringForwardDate', { useTz: true });
          table.text('notes');
          table.text('intakeStatus');
          table.text('applicationStatus');
          table.boolean('guidance').notNullable().defaultTo(false);
          table.boolean('statusRequest').notNullable().defaultTo(false);
          table.boolean('inquiry').notNullable().defaultTo(false);
          table.boolean('emergencyAssist').notNullable().defaultTo(false);
          table.boolean('inapplicable').notNullable().defaultTo(false);
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('document', (table) => {
          table.uuid('documentId').primary();
          table
            .uuid('submissionId')
            .notNullable()
            .references('submissionId')
            .inTable('submission')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table.text('filename').notNullable();
          table.text('mimeType').defaultTo('application/octet-stream').notNullable();
          table.bigInteger('filesize').notNullable();
          stamps(knex, table);
          table.unique(['documentId', 'submissionId']);
        })
      )

      .then(() =>
        knex.schema.createTable('permit_type', (table) => {
          table.specificType('permitTypeId', 'integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY');
          table.text('agency').notNullable();
          table.text('division');
          table.text('branch');
          table.text('businessDomain').notNullable();
          table.text('type').notNullable();
          table.text('family');
          table.text('name').notNullable();
          table.text('nameSubtype');
          table.text('acronym');
          table.boolean('trackedInATS');
          table.text('sourceSystem');
          table.text('sourceSystemAcronym').notNullable();
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('permit', (table) => {
          table.uuid('permitId').primary();
          table
            .integer('permitTypeId')
            .notNullable()
            .references('permitTypeId')
            .inTable('permit_type')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table
            .uuid('submissionId')
            .notNullable()
            .references('submissionId')
            .inTable('submission')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table.text('issuedPermitId');
          table.text('trackingId');
          table.text('authStatus');
          table.text('needed');
          table.text('status');
          table.timestamp('submittedDate', { useTz: true });
          table.timestamp('adjudicationDate', { useTz: true });
          stamps(knex, table);
          table.unique(['permitId', 'permitTypeId', 'submissionId']);
        })
      )

      // Create audit schema and logged_actions table
      .then(() => knex.schema.raw('CREATE SCHEMA IF NOT EXISTS audit'))

      .then(() =>
        knex.schema.withSchema('audit').createTable('logged_actions', (table) => {
          table.specificType('id', 'integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY');
          table.text('schemaName').notNullable().index();
          table.text('tableName').notNullable().index();
          table.text('dbUser').notNullable();
          table.text('updatedByUsername');
          table.timestamp('actionTimestamp', { useTz: true }).defaultTo(knex.fn.now()).index();
          table.text('action').notNullable().index();
          table.json('originalData');
          table.json('newData');
        })
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
              (select count(*) from public.submission where "submittedAt" between cast(date_from as timestamp) and cast(date_to as timestamp)),
              (select count(*) from public.submission where extract(month from cast(month_year as timestamp)) = extract(month from "submittedAt") and extract(year from cast(month_year as timestamp)) = extract(year from "submittedAt")),
              (select count(*) from public.submission where "assignedToUserId" = user_id),
              count(*) filter (where s."intakeStatus" = 'Submitted'),
              count(*) filter (where s."intakeStatus" = 'Assigned'),
              count(*) filter (where s."intakeStatus" = 'Completed'),
              count(*) filter (where s."applicationStatus" = 'New'),
              count(*) filter (where s."applicationStatus" = 'In Progress'),
              count(*) filter (where s."applicationStatus" = 'Delayed'),
              count(*) filter (where s."applicationStatus" = 'Completed'),
              count(*) filter (where s."waitingOn" is not null),
              count(*) filter (where s."queuePriority" = 0),
              count(*) filter (where s."queuePriority" = 1),
              count(*) filter (where s."queuePriority" = 2),
              count(*) filter (where s."queuePriority" = 3),
              count(*) filter (where s."queuePriority" = 4),
              count(*) filter (where s."queuePriority" = 5),
              count(*) filter (where s."guidance" = true),
              count(*) filter (where s."statusRequest" = true),
              count(*) filter (where s."inquiry" = true),
              count(*) filter (where s."emergencyAssist" = true),
              count(*) filter (where s."inapplicable" = true)
            from public.submission s;
        end; $$`)
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
                  insert into audit.logged_actions ("schemaName", "tableName", "dbUser", "updatedByUsername", "actionTimestamp", "action", "originalData", "newData")
                  values (TG_TABLE_SCHEMA::TEXT, TG_TABLE_NAME::TEXT, SESSION_USER::TEXT, NEW."updatedBy", now(), TG_OP::TEXT, v_old_data, v_new_data);
                  RETURN NEW;
              elsif (TG_OP = 'DELETE') then
                  v_old_data := row_to_json(OLD);
                  insert into audit.logged_actions ("schemaName", "tableName", "dbUser", "actionTimestamp", "action", "originalData")
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
          userId: NIL,
          username: user,
          active: true,
          createdBy: NIL
        }));
        return knex('user').insert(items);
      })

      .then(() => {
        const items = [
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Forest Resiliency and Archaeology',
            branch: 'Archaeology',
            businessDomain: 'Archaeology',
            type: 'Alteration',
            name: 'Site Alteration Permit',
            acronym: 'SAP',
            trackedInATS: false,
            sourceSystem: 'Archaeology Permit Tracking System',
            sourceSystemAcronym: 'APTS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Forest Resiliency and Archaeology',
            branch: 'Archaeology',
            businessDomain: 'Archaeology',
            type: 'Inspection',
            name: 'Heritage Inspection Permit',
            acronym: 'HIP',
            trackedInATS: false,
            sourceSystem: 'Archaeology Permit Tracking System',
            sourceSystemAcronym: 'APTS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Forest Resiliency and Archaeology',
            branch: 'Archaeology',
            businessDomain: 'Archaeology',
            type: 'Investigation',
            name: 'Investigation Permit',
            trackedInATS: false,
            sourceSystem: 'Archaeology Permit Tracking System',
            sourceSystemAcronym: 'APTS'
          },
          {
            agency: 'Environment and Climate Change Strategy',
            division: 'Environmental Protection',
            branch: 'Environmental Emergencies and Land Remediation',
            businessDomain: 'Contaminated Sites',
            type: 'Contaminated Sites Remediation',
            name: 'Contaminated Sites Remediation Permit',
            trackedInATS: false,
            sourceSystem: 'Contaminated Sites Application Tracking System',
            sourceSystemAcronym: 'CATS'
          },
          {
            agency: 'Forests',
            division: 'Integrated Resource Operations',
            branch: 'Forest Tenures',
            businessDomain: 'Forestry',
            type: 'Occupant Licence To Cut',
            name: 'Occupant Licence to Cut',
            acronym: 'OLTC',
            sourceSystem: 'Forest Tenure Administration',
            sourceSystemAcronym: 'FTA'
          },
          {
            agency: 'Forests',
            division: 'Integrated Resource Operations',
            branch: 'Forest Tenures',
            businessDomain: 'Forestry',
            type: 'Private Timber Mark',
            name: 'Private Timber Mark',
            acronym: 'PTM',
            sourceSystem: 'Forest Tenure Administration',
            sourceSystemAcronym: 'FTA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            businessDomain: 'Lands',
            type: 'Commercial General',
            family: 'Crown Land Tenure',
            name: 'Commercial General',
            sourceSystem: 'Tantalis',
            sourceSystemAcronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            businessDomain: 'Lands',
            type: 'Nominal Rent Tenure',
            family: 'Crown Land Tenure',
            name: 'Nominal Rent Tenure',
            acronym: 'NRT',
            sourceSystem: 'Tantalis',
            sourceSystemAcronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            businessDomain: 'Lands',
            type: 'Residential',
            family: 'Crown Land Tenure',
            name: 'Residential',
            sourceSystem: 'Tantalis',
            sourceSystemAcronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            businessDomain: 'Lands',
            type: 'Roadways - Public',
            family: 'Crown Land Tenure',
            name: 'Roadways - Public',
            sourceSystem: 'Tantalis',
            sourceSystemAcronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            businessDomain: 'Lands',
            type: 'Sponsored Crown Grant',
            family: 'Crown Land Tenure',
            name: 'Sponsored Crown Grant',
            sourceSystem: 'Tantalis',
            sourceSystemAcronym: 'TANTALIS'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Integrated Resource Operations',
            branch: 'Lands Program',
            businessDomain: 'Lands',
            type: 'Utilities',
            family: 'Crown Land Tenure',
            name: 'Utilities',
            sourceSystem: 'Tantalis',
            sourceSystemAcronym: 'TANTALIS'
          },
          {
            agency: 'Transportation and Infrastructure',
            businessDomain: 'Transportation',
            type: 'Rural Subdivision',
            name: 'Rural subdivision',
            sourceSystemAcronym: 'MOTI'
          },
          {
            agency: 'Transportation and Infrastructure',
            businessDomain: 'Transportation',
            type: 'Rezoning',
            name: 'Rezoning',
            sourceSystemAcronym: 'MOTI'
          },
          {
            agency: 'Transportation and Infrastructure',
            businessDomain: 'Transportation',
            type: 'Municipal Subdivision',
            name: 'Municipal subdivision',
            sourceSystemAcronym: 'MOTI'
          },
          {
            agency: 'Transportation and Infrastructure',
            businessDomain: 'Transportation',
            type: 'Highway Use Permit',
            name: 'Highway Use Permit',
            sourceSystemAcronym: 'MOTI'
          },
          {
            agency: 'Transportation and Infrastructure',
            businessDomain: 'Transportation',
            type: 'Other',
            name: 'Other',
            sourceSystemAcronym: 'MOTI'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Fisheries, Aquaculture and Wild Salmon',
            businessDomain: 'RAPR',
            type: 'New',
            name: 'Riparian Area Development Permit',
            sourceSystem: 'Riparian Areas Regulation Notification System',
            sourceSystemAcronym: 'RARN'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            businessDomain: 'Water',
            type: 'Change Approval for Work in and About a Stream',
            name: 'Change approval for work in and about a stream',
            acronym: 'A-CIAS',
            sourceSystem: 'Water Management Application',
            sourceSystemAcronym: 'WMA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            businessDomain: 'Water',
            type: 'Notification',
            name: 'Notification of authorized changes in and about a stream',
            acronym: 'N-CIAS',
            sourceSystem: 'Water Management Application',
            sourceSystemAcronym: 'WMA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            businessDomain: 'Water',
            type: 'Use Approval',
            name: 'Short-term use approval',
            acronym: 'STU',
            sourceSystem: 'Water Management Application',
            sourceSystemAcronym: 'WMA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            businessDomain: 'Water',
            type: 'New Groundwater Licence',
            family: 'Water Licence',
            name: 'Groundwater Licence - Wells',
            acronym: 'PWD',
            sourceSystem: 'Water Management Application',
            sourceSystemAcronym: 'WMA'
          },
          {
            agency: 'Water, Land and Resource Stewardship',
            division: 'Water, Fisheries and Coast',
            branch: 'Water Management',
            businessDomain: 'Water',
            type: 'Water Licence',
            family: 'Water Licence',
            name: 'Surface Water Licence',
            acronym: 'PD',
            sourceSystem: 'Water Management Application',
            sourceSystemAcronym: 'WMA'
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
      // Drop public schema PCNS tables
      .then(() => knex.schema.dropTableIfExists('permit'))
      .then(() => knex.schema.dropTableIfExists('permit_type'))
      .then(() => knex.schema.dropTableIfExists('document'))
      .then(() => knex.schema.dropTableIfExists('submission'))
      .then(() => knex.schema.dropTableIfExists('user'))
      .then(() => knex.schema.dropTableIfExists('identity_provider'))
  );
}
