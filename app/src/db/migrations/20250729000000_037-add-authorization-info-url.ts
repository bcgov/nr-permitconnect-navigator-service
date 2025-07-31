/* eslint-disable max-len */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    // Create public schema tables
    knex.schema
      // Alter public schema tables
      .alterTable('permit_type', (table) => {
        table.text('info_url').nullable();
      })

      // Update permit_type with info_url
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/archaeology/permits'
         WHERE name = 'Archaeology Alteration Permit';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/archaeology/permits'
         WHERE name = 'Archaeology Heritage Inspection Permit';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/archaeology/permits'
         WHERE name = 'Archaeology Heritage Investigation Permit';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/environment/air-land-water/site-remediation'
         WHERE name = 'Site Remediation Authorization';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/industry/forestry/forest-tenures/timber-harvesting-rights/licence-to-cut/occupant-licence-to-cut'
         WHERE name = 'Occupant Licence to Cut';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/industry/forestry/forest-tenures/private-timber-marks'
         WHERE name = 'Private Timber Mark';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/industry/crown-land-water/crown-land/crown-land-uses/commercial-uses/general-commercial'
         WHERE name = 'Commercial Lands Tenure';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/governments/local-governments/governance-powers/economic-development/crown-land-nominal-rent-tenure-sponsorship'
         WHERE name = 'Nominal Rent Tenure';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/industry/crown-land-water/crown-land/crown-land-uses/residential-uses '
         WHERE name = 'Residential Lands Tenure';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/industry/crown-land-water/crown-land/crown-land-uses/roadways'
         WHERE name = 'Public Roadways Lands Tenure';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/governments/local-governments/governance-powers/economic-development/crown-land-nominal-rent-tenure-sponsorship'
         WHERE name = 'Sponsored Crown Grant';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/industry/crown-land-water/crown-land/crown-land-uses/utilities'
         WHERE name = 'Lands Utility Tenure';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/governments/local-governments/planning-land-use/land-use-regulation/subdividing-land/subdividing'
         WHERE name = 'Rural Subdivision';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/transportation/funding-engagement-permits/permits/access'
         WHERE name = 'Highway Use Permit';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/fish/aquatic-habitat-management/riparian-areas-regulation/qep-resources/preparing-rar-reports'
         WHERE name = 'Riparian Area Development Permit';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/apply-for-a-change-approval-or-submit-notification-of-instream-work'
         WHERE name = 'Change Approval for Work In and About a Stream';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/apply-for-a-change-approval-or-submit-notification-of-instream-work'
         WHERE name = 'Notification for Work In and About a Stream';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/water-use-approval'
         WHERE name = 'Short-term Water Use Approval';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/apply-for-a-water-licence'
         WHERE name = 'Groundwater Licence';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/apply-for-a-water-licence'
         WHERE name = 'Surface Water Licence';`);
      })
      .then(async () => {
        await knex.raw(`UPDATE public.permit_type SET info_url =
         'https://portalext.nrs.gov.bc.ca/web/client/-/scientific-fish-collection-permit.html'
         WHERE name = 'Fish Salvage Permit';`);
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop column
      .then(() =>
        knex.schema.alterTable('permit_type', function (table) {
          table.dropColumn('info_url');
        })
      )
  );
}
