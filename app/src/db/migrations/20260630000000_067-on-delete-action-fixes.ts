import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() =>
        knex.schema.alterTable('access_request', function (table) {
          table.dropForeign('user_id', 'access_request_user_id_foreign');
          table
            .foreign('user_id', 'access_request_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('activity', function (table) {
          table.dropForeign('initiative_id', 'activity_initiative_id_foreign');
          table
            .foreign('initiative_id', 'activity_initiative_id_foreign')
            .references('initiative_id')
            .inTable('initiative')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        })
      )
      .then(() =>
        knex.schema.alterTable('document', function (table) {
          table.dropForeign('activity_id', 'document_activity_id_foreign');
          table.setNullable('activity_id');
          table
            .foreign('activity_id', 'document_activity_id_foreign')
            .references('activity_id')
            .inTable('activity')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
      .then(() =>
        knex.schema.alterTable('enquiry', function (table) {
          table.dropForeign('assigned_user_id', 'enquiry_assigned_user_id_foreign');
          table
            .foreign('assigned_user_id', 'enquiry_assigned_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
      .then(() =>
        knex.schema.alterTable('permit', function (table) {
          table.dropForeign('on_hold_code', 'permit_on_hold_code_foreign');
          table
            .foreign('on_hold_code', 'permit_on_hold_code_foreign')
            .references('code')
            .inTable('pies_on_hold_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');

          table.dropForeign('permit_type_id', 'permit_permit_type_id_foreign');
          table
            .foreign('permit_type_id', 'permit_permit_type_id_foreign')
            .references('permit_type_id')
            .inTable('permit_type')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');

          table.dropForeign('stage', 'permit_stage_fkey');
          table
            .foreign('stage', 'permit_stage_fkey')
            .references('code')
            .inTable('permit_stage_code')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');

          table.dropForeign('state', 'permit_state_fkey');
          table
            .foreign('state', 'permit_state_fkey')
            .references('code')
            .inTable('permit_state_code')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        })
      )
      .then(() =>
        knex.schema.alterTable('permit_type', function (table) {
          table.dropForeign('source_system', 'permit_type_source_system_foreign');
          table
            .foreign('source_system', 'permit_type_source_system_foreign')
            .references('code')
            .inTable('source_system_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
      .then(() =>
        knex.schema.alterTable('user', function (table) {
          table.dropForeign('idp', 'user_idp_foreign');
          table
            .foreign('idp', 'user_idp_foreign')
            .references('idp')
            .inTable('identity_provider')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        })
      )
      // Table was renamed from `submission` (migration 030) but the constraints were not renamed
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropPrimary('submission_pkey');
          table.primary(['housing_project_id'], { constraintName: 'housing_project_pkey' });
        })
      )
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropForeign('assigned_user_id', 'submission_assigned_user_id_foreign');
          table
            .foreign('assigned_user_id', 'housing_project_assigned_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropForeign('activity_id', 'submission_activity_id_foreign');
          table
            .foreign('activity_id', 'housing_project_activity_id_foreign')
            .references('activity_id')
            .inTable('activity')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('electrification_project', function (table) {
          table.dropForeign('assigned_user_id', 'electrification_project_assigned_user_id_foreign');
          table
            .foreign('assigned_user_id', 'electrification_project_assigned_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');

          table.dropForeign('project_category', 'electrification_project_project_category_foreign');
          table
            .foreign('project_category', 'electrification_project_project_category_foreign')
            .references('code')
            .inTable('electrification_project_category_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');

          table.dropForeign('project_type', 'electrification_project_project_type_foreign');
          table
            .foreign('project_type', 'electrification_project_project_type_foreign')
            .references('code')
            .inTable('electrification_project_type_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
      .then(() =>
        knex.schema.alterTable('permit_tracking', function (table) {
          table.dropForeign('source_system_kind_id', 'permit_tracking_source_system_kind_id_foreign');
          table
            .foreign('source_system_kind_id', 'permit_tracking_source_system_kind_id_foreign')
            .references('source_system_kind_id')
            .inTable('source_system_kind')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
      .then(() =>
        knex.schema.alterTable('source_system_kind', function (table) {
          table.dropForeign('source_system', 'source_system_kind_source_system_foreign');
          table
            .foreign('source_system', 'source_system_kind_source_system_foreign')
            .references('code')
            .inTable('source_system_code')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        })
      )
      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.dropForeign('escalation_type', 'note_history_escalation_type_foreign');
          table
            .foreign('escalation_type', 'note_history_escalation_type_foreign')
            .references('code')
            .inTable('escalation_type_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
      .then(() =>
        knex.schema.alterTable('general_project', function (table) {
          table.dropForeign('assigned_user_id', 'general_project_assigned_user_id_foreign');
          table
            .foreign('assigned_user_id', 'general_project_assigned_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');

          table.dropForeign('business_area', 'general_project_business_area_foreign');
          table
            .foreign('business_area', 'general_project_business_area_foreign')
            .references('code')
            .inTable('business_area_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() =>
        knex.schema.alterTable('access_request', function (table) {
          table.dropForeign('user_id', 'access_request_user_id_foreign');
          table
            .foreign('user_id', 'access_request_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onDelete('NO ACTION');
        })
      )
      .then(() =>
        knex.schema.alterTable('activity', function (table) {
          table.dropForeign('initiative_id', 'activity_initiative_id_foreign');
          table
            .foreign('initiative_id', 'activity_initiative_id_foreign')
            .references('initiative_id')
            .inTable('initiative')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('document', function (table) {
          table.dropForeign('activity_id', 'document_activity_id_foreign');
          table.dropNullable('activity_id');
          table
            .foreign('activity_id', 'document_activity_id_foreign')
            .references('activity_id')
            .inTable('activity')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('enquiry', function (table) {
          table.dropForeign('assigned_user_id', 'enquiry_assigned_user_id_foreign');
          table
            .foreign('assigned_user_id', 'enquiry_assigned_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('permit', function (table) {
          table.dropForeign('on_hold_code', 'permit_on_hold_code_foreign');
          table
            .foreign('on_hold_code', 'permit_on_hold_code_foreign')
            .references('code')
            .inTable('pies_on_hold_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');

          table.dropForeign('permit_type_id', 'permit_permit_type_id_foreign');
          table
            .foreign('permit_type_id', 'permit_permit_type_id_foreign')
            .references('permit_type_id')
            .inTable('permit_type')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');

          table.dropForeign('stage', 'permit_stage_fkey');
          table
            .foreign('stage', 'permit_stage_fkey')
            .references('code')
            .inTable('permit_stage_code')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');

          table.dropForeign('state', 'permit_state_fkey');
          table
            .foreign('state', 'permit_state_fkey')
            .references('code')
            .inTable('permit_state_code')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        })
      )
      .then(() =>
        knex.schema.alterTable('permit_type', function (table) {
          table.dropForeign('source_system', 'permit_type_source_system_foreign');
          table
            .foreign('source_system', 'permit_type_source_system_foreign')
            .references('code')
            .inTable('source_system_code')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('user', function (table) {
          table.dropForeign('idp', 'user_idp_foreign');
          table
            .foreign('idp', 'user_idp_foreign')
            .references('idp')
            .inTable('identity_provider')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      // Setting constraints back to old submission table names
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropPrimary('housing_project_pkey');
          table.primary(['housing_project_id'], { constraintName: 'submission_pkey' });
        })
      )
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropForeign('assigned_user_id', 'housing_project_assigned_user_id_foreign');
          table
            .foreign('assigned_user_id', 'submission_assigned_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropForeign('activity_id', 'housing_project_activity_id_foreign');
          table
            .foreign('activity_id', 'submission_activity_id_foreign')
            .references('activity_id')
            .inTable('activity')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('electrification_project', function (table) {
          table.dropForeign('assigned_user_id', 'electrification_project_assigned_user_id_foreign');
          table
            .foreign('assigned_user_id', 'electrification_project_assigned_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');

          table.dropForeign('project_category', 'electrification_project_project_category_foreign');
          table
            .foreign('project_category', 'electrification_project_project_category_foreign')
            .references('code')
            .inTable('electrification_project_category_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');

          table.dropForeign('project_type', 'electrification_project_project_type_foreign');
          table
            .foreign('project_type', 'electrification_project_project_type_foreign')
            .references('code')
            .inTable('electrification_project_type_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
      .then(() =>
        knex.schema.alterTable('permit_tracking', function (table) {
          table.dropForeign('source_system_kind_id', 'permit_tracking_source_system_kind_id_foreign');
          table
            .foreign('source_system_kind_id', 'permit_tracking_source_system_kind_id_foreign')
            .references('source_system_kind_id')
            .inTable('source_system_kind')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('source_system_kind', function (table) {
          table.dropForeign('source_system', 'source_system_kind_source_system_foreign');
          table
            .foreign('source_system', 'source_system_kind_source_system_foreign')
            .references('code')
            .inTable('source_system_code')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        })
      )
      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.dropForeign('escalation_type', 'note_history_escalation_type_foreign');
          table
            .foreign('escalation_type', 'note_history_escalation_type_foreign')
            .references('code')
            .inTable('escalation_type_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
      .then(() =>
        knex.schema.alterTable('general_project', function (table) {
          table.dropForeign('assigned_user_id', 'general_project_assigned_user_id_foreign');
          table
            .foreign('assigned_user_id', 'general_project_assigned_user_id_foreign')
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');

          table.dropForeign('business_area', 'general_project_business_area_foreign');
          table
            .foreign('business_area', 'general_project_business_area_foreign')
            .references('code')
            .inTable('business_area_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )
  );
}
