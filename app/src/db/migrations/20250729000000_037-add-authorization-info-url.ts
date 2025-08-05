/* eslint-disable max-len */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema
      // Alter public schema tables
      .alterTable('permit_type', (table) => {
        table.text('info_url').nullable();
      })

      // Update permit_type with info_url
      .then(() =>
        knex('permit_type').where('name', 'Archaeology Alteration Permit').update({
          info_url: 'https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/archaeology/permits'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Archaeology Heritage Inspection Permit').update({
          info_url: 'https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/archaeology/permits'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Archaeology Heritage Investigation Permit').update({
          info_url: 'https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/archaeology/permits'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Site Remediation Authorization').update({
          info_url: 'https://www2.gov.bc.ca/gov/content/environment/air-land-water/site-remediation'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Occupant Licence to Cut').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/industry/forestry/forest-tenures/timber-harvesting-rights/licence-to-cut/occupant-licence-to-cut'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Private Timber Mark').update({
          info_url: 'https://www2.gov.bc.ca/gov/content/industry/forestry/forest-tenures/private-timber-marks'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Commercial Lands Tenure').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/industry/crown-land-water/crown-land/crown-land-uses/commercial-uses/general-commercial'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Nominal Rent Tenure').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/governments/local-governments/governance-powers/economic-development/crown-land-nominal-rent-tenure-sponsorship'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Residential Lands Tenure').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/industry/crown-land-water/crown-land/crown-land-uses/residential-uses'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Public Roadways Lands Tenure').update({
          info_url: 'https://www2.gov.bc.ca/gov/content/industry/crown-land-water/crown-land/crown-land-uses/roadways'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Sponsored Crown Grant').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/governments/local-governments/governance-powers/economic-development/crown-land-nominal-rent-tenure-sponsorship'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Lands Utility Tenure').update({
          info_url: 'https://www2.gov.bc.ca/gov/content/industry/crown-land-water/crown-land/crown-land-uses/utilities'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Rural Subdivision').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/governments/local-governments/planning-land-use/land-use-regulation/subdividing-land/subdividing'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Highway Use Permit').update({
          info_url: 'https://www2.gov.bc.ca/gov/content/transportation/funding-engagement-permits/permits/access'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Riparian Area Development Permit').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/fish/aquatic-habitat-management/riparian-areas-regulation/qep-resources/preparing-rar-reports'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Change Approval for Work In and About a Stream').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/apply-for-a-change-approval-or-submit-notification-of-instream-work'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Notification for Work In and About a Stream').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/apply-for-a-change-approval-or-submit-notification-of-instream-work'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Short-term Water Use Approval').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/water-use-approval'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Groundwater Licence').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/apply-for-a-water-licence'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Surface Water Licence').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/environment/air-land-water/water/water-licensing-rights/water-licences-approvals/apply-for-a-water-licence'
        })
      )
      .then(() =>
        knex('permit_type').where('name', 'Fish Salvage Permit').update({
          info_url: 'https://portalext.nrs.gov.bc.ca/web/client/-/scientific-fish-collection-permit.html'
        })
      )
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
