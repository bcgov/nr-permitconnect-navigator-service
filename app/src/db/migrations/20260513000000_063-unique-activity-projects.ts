import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    // Create public schema tables
    knex.schema

      // Add foreign key constraints to existing columns
      .then(() =>
        knex.schema.raw(`
            ALTER TABLE public.housing_project
            ADD CONSTRAINT housing_project_activity_id_unique UNIQUE (activity_id);
          `)
      )
      .then(() =>
        knex.schema.raw(`
            ALTER TABLE public.general_project
            ADD CONSTRAINT general_project_activity_id_unique UNIQUE (activity_id);
          `)
      )
      .then(() =>
        knex.schema.raw(`
            ALTER TABLE public.electrification_project
            ADD CONSTRAINT electrification_project_activity_id_unique UNIQUE (activity_id);
          `)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop foreign key constraints from permit table
      .then(() =>
        knex.schema.raw(`
            ALTER TABLE public.electrification_project
            DROP CONSTRAINT IF EXISTS electrification_project_activity_id_unique;
        `)
      )
      .then(() =>
        knex.schema.raw(`
            ALTER TABLE public.general_project
            DROP CONSTRAINT IF EXISTS general_project_activity_id_unique;
        `)
      )
      .then(() =>
        knex.schema.raw(`
            ALTER TABLE public.housing_project
            DROP CONSTRAINT IF EXISTS housing_project_activity_id_unique;
        `)
      )
  );
}
