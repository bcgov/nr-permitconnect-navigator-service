import { Knex } from 'knex';

import { SYSTEM_ID } from '../../../utils/constants/application.ts';

/**
 * Add standard timestamp and user tracking columns to a table
 * @param knex Knex instance
 * @param table Table builder
 */
export function addAuditStamps(knex: Knex, table: Knex.CreateTableBuilder) {
  table.text('created_by').defaultTo(SYSTEM_ID);
  table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  table.text('updated_by');
  table.timestamp('updated_at', { useTz: true });
  table.text('deleted_by');
  table.timestamp('deleted_at', { useTz: true });
}

/**
 * Create Audit Log Trigger for a given table
 * @param knex Knex instance
 * @param schema Schema
 * @param table Table
 */
export async function createAuditLogTrigger(knex: Knex, schema: string, table: string): Promise<void> {
  await knex.schema.raw(`CREATE TRIGGER audit_${table}_trigger
    AFTER UPDATE OR DELETE ON ${schema}.${table}
    FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`);
}

/**
 * Create an updated at trigger for a given table
 * @param knex Knex instance
 * @param schema Schema
 * @param table Table
 */
export async function createUpdatedAtTrigger(knex: Knex, schema: string, table: string): Promise<void> {
  await knex.schema.raw(`CREATE TRIGGER before_update_${table}_trigger
    BEFORE UPDATE ON ${schema}.${table}
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`);
}

/**
 * Drop Audit Log Trigger for a given table
 * @param knex Knex instance
 * @param schema Schema
 * @param table Table
 * @returns Query Builder Promise
 */
export async function dropAuditLogTrigger(knex: Knex, schema: string, table: string): Promise<void> {
  await knex.schema.raw(`DROP TRIGGER IF EXISTS audit_${table}_trigger ON ${schema}.${table}`);
}

/**
 * Drop an updated at trigger for a given table
 * @param knex Knex instance
 * @param schema Schema
 * @param table Table
 * @returns Query Builder Result
 */
export async function dropUpdatedAtTrigger(knex: Knex, schema: string, table: string): Promise<void> {
  await knex.schema.raw(`DROP TRIGGER IF EXISTS before_update_${table}_trigger ON ${schema}.${table}`);
}
