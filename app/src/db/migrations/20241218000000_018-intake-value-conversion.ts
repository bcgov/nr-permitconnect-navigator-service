/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.raw(`update public.contact
        set contact_applicant_relationship = case
          when contact_applicant_relationship = 'Owner' then 'Project owner'
          when contact_applicant_relationship = 'Employee' then 'Project consultant'
          when contact_applicant_relationship = 'Agent' then 'Project consultant'
          when contact_applicant_relationship = 'Consultant' then 'Project consultant'
          else contact_applicant_relationship
        end`)
    )

    .then(() =>
      knex.schema.raw(`update public.submission
        set is_developed_by_company_or_org = case
          when is_developed_by_company_or_org = 'No' then 'Individual'
          else 'Business'
        end`)
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.raw(`update public.submission
        set is_developed_by_company_or_org = case
          when is_developed_by_company_or_org = 'Individual' then 'No'
          else 'Yes'
        end`)
    )

    .then(() =>
      knex.schema.raw(`update public.contact
      set contact_applicant_relationship = case
        when contact_applicant_relationship = 'Project owner' then 'Owner'
        when contact_applicant_relationship = 'Project consultant' then 'Agent'
        else contact_applicant_relationship
      end`)
    );
}
