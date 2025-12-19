/*
 * Two new tables are created:
 *    contact
 *    activity_contact
 *
 * Contact information from submission & enquiry is moved to these tables and then dropped from originals
 */

/* eslint-disable max-len */
import { v4 as uuidv4 } from 'uuid';

import stamps from '../stamps.ts';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()

      // Create public schema tables
      .then(() =>
        knex.schema.createTable('contact', (table) => {
          table.uuid('contact_id').primary();
          table
            .uuid('user_id')
            .nullable()
            .references('user_id')
            .inTable('user')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table.text('first_name');
          table.text('last_name');
          table.text('phone_number');
          table.text('email');
          table.text('contact_preference');
          table.text('contact_applicant_relationship');
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.createTable('activity_contact', (table) => {
          table.primary(['activity_id', 'contact_id']);
          table
            .text('activity_id')
            .notNullable()
            .references('activity_id')
            .inTable('activity')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table
            .uuid('contact_id')
            .notNullable()
            .references('contact_id')
            .inTable('contact')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          stamps(knex, table);
        })
      )

      // Create public schema table triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_contact_trigger
        BEFORE UPDATE ON public."contact"
        FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_activity_contact_trigger
        BEFORE UPDATE ON public."activity_contact"
        FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`)
      )

      // Create audit triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_contact_trigger
          AFTER UPDATE OR DELETE ON public."contact"
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_activity_contact_trigger
          AFTER UPDATE OR DELETE ON public."activity_contact"
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      // Split data
      .then(async () => {
        await knex.raw(`DROP TABLE IF EXISTS temp;
             DELETE FROM public.activity_contact;
             DELETE FROM public.contact;

             CREATE TABLE temp (contact_id uuid, activity_id text, contact_first_name text, contact_last_name text, contact_email text, contact_phone_number text, contact_preference text, contact_applicant_relationship text);`);

        let submissions = await knex
          .select(
            's.activity_id',
            's.contact_first_name',
            's.contact_last_name',
            's.contact_email',
            's.contact_phone_number',
            's.contact_preference',
            's.contact_applicant_relationship'
          )
          .from({ s: 'public.submission' });

        submissions = submissions.map((x) => ({
          contact_id: uuidv4(),
          ...x
        }));

        let enquiries = await knex
          .select(
            'e.activity_id',
            'e.contact_first_name',
            'e.contact_last_name',
            'e.contact_email',
            'e.contact_phone_number',
            'e.contact_preference',
            'e.contact_applicant_relationship'
          )
          .from({ e: 'public.enquiry' });

        enquiries = enquiries.map((x) => ({
          contact_id: uuidv4(),
          ...x
        }));

        if (submissions && submissions.length) await knex('public.temp').insert(submissions);
        if (enquiries && enquiries.length) await knex('public.temp').insert(enquiries);

        await knex.raw(`INSERT INTO public.contact (contact_id, first_name, last_name, email, phone_number, contact_preference, contact_applicant_relationship)
            SELECT contact_id, contact_first_name, contact_last_name, contact_email, contact_phone_number, contact_preference, contact_applicant_relationship
            FROM public.temp;

            INSERT INTO public.activity_contact (activity_id, contact_id)
            SELECT activity_id, contact_id
            FROM public.temp;

            DROP TABLE IF EXISTS temp;`);
      })

      // Drop old columns
      .then(() =>
        knex.schema.raw(`ALTER TABLE public.submission
          DROP COLUMN IF EXISTS contact_name;`)
      )

      .then(() =>
        knex.schema.alterTable('submission', function (table) {
          table.dropColumn('contact_first_name');
          table.dropColumn('contact_last_name');
          table.dropColumn('contact_email');
          table.dropColumn('contact_phone_number');
          table.dropColumn('contact_preference');
          table.dropColumn('contact_applicant_relationship');
        })
      )

      .then(() =>
        knex.schema.alterTable('enquiry', function (table) {
          table.dropColumn('contact_first_name');
          table.dropColumn('contact_last_name');
          table.dropColumn('contact_email');
          table.dropColumn('contact_phone_number');
          table.dropColumn('contact_preference');
          table.dropColumn('contact_applicant_relationship');
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add columns
      .then(() =>
        knex.schema.alterTable('enquiry', function (table) {
          table.text('contact_first_name');
          table.text('contact_last_name');
          table.text('contact_email');
          table.text('contact_phone_number');
          table.text('contact_preference');
          table.text('contact_applicant_relationship');
        })
      )

      .then(() =>
        knex.schema.alterTable('submission', function (table) {
          table.text('contact_first_name');
          table.text('contact_last_name');
          table.text('contact_email');
          table.text('contact_phone_number');
          table.text('contact_preference');
          table.text('contact_applicant_relationship');
        })
      )

      .then(() =>
        knex.schema.raw(`ALTER TABLE public.submission
          ADD COLUMN IF NOT EXISTS contact_name TEXT;`)
      )

      // Retrieve data
      .then(() =>
        knex.schema.raw(`DROP TABLE IF EXISTS temp;

          CREATE TABLE temp (contact_id uuid, activity_id text, contact_first_name text, contact_last_name text, contact_email text, contact_phone_number text, contact_preference text, contact_applicant_relationship text);

          INSERT INTO temp (contact_id, activity_id, contact_first_name, contact_last_name, contact_email, contact_phone_number, contact_preference, contact_applicant_relationship)
          SELECT c.contact_id, ac.activity_id, c.first_name, c.last_name, c.email, c.phone_number, c.contact_preference, c.contact_applicant_relationship
          FROM public.contact c
          JOIN public.activity_contact ac on ac.contact_id = c.contact_id;

          UPDATE public.submission AS s
            set contact_first_name = t.contact_first_name,
            contact_last_name = t.contact_last_name,
            contact_email = t.contact_email,
            contact_phone_number = t.contact_phone_number,
            contact_preference = t.contact_preference,
            contact_applicant_relationship = t.contact_applicant_relationship
          FROM public.temp t
          WHERE s.activity_id = t.activity_id;

          UPDATE public.enquiry AS e
            set contact_first_name = t.contact_first_name,
            contact_last_name = t.contact_last_name,
            contact_email = t.contact_email,
            contact_phone_number = t.contact_phone_number,
            contact_preference = t.contact_preference,
            contact_applicant_relationship = t.contact_applicant_relationship
          FROM public.temp t
          WHERE e.activity_id = t.activity_id;

          DROP TABLE IF EXISTS temp;`)
      )

      // Drop audit triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_activity_contact_trigger ON public."activity_contact"'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_contact_trigger ON public."contact"'))

      // Drop public schema table triggers
      .then(() =>
        knex.schema.raw('DROP TRIGGER IF EXISTS before_update_activity_contact_trigger ON public."activity_contact"')
      )
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_contact_trigger ON public."contact"'))

      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('activity_contact'))
      .then(() => knex.schema.dropTableIfExists('contact'))
  );
}
