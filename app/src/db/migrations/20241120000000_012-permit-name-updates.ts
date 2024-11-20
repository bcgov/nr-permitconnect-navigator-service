/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.raw(`update public.permit_type
      set name = case
        when name = 'Site Alteration Permit' then 'Archaeology Alteration Permit'
        when name = 'Heritage Inspection Permit' then 'Archaeology Heritage Inspection Permit'
        when name = 'Investigation Permit' then 'Archaeology Heritage Investigation Permit'
        when name = 'Contaminated Sites Remediation Permit' then 'Site Remediation Authorization'
        when name = 'Occupant Licence to Cut' then 'Occupant Licence to Cut'
        when name = 'Private Timber Mark' then 'Private Timber Mark'
        when name = 'Commercial General' then 'Commercial Lands Tenure'
        when name = 'Nominal Rent Tenure' then 'Nominal Rent Tenure'
        when name = 'Residential' then 'Residential Lands Tenure'
        when name = 'Roadways - Public' then 'Public Roadways Lands Tenure'
        when name = 'Sponsored Crown Grant' then 'Sponsored Crown Grant'
        when name = 'Utilities' then 'Lands Utility Tenure'
        when name = 'Rural subdivision' then 'Rural Subdivision'
        when name = 'Rezoning' then 'Rezoning'
        when name = 'Municipal subdivision' then 'Municipal Subdivision'
        when name = 'Highway Use Permit' then 'Highway Use Permit'
        when name = 'Other' then 'Other Transportation Permit'
        when name = 'Riparian Area Development Permit' then 'Riparian Area Development Permit'
        when name = 'Change approval for work in and about a stream' then 'Change Approval for Work In and About a Stream'
        when name = 'Notification of authorized changes in and about a stream' then 'Notification for Work In and About a Stream'
        when name = 'Short-term use approval' then 'Short-term Water use approval'
        when name = 'Groundwater Licence - Wells' then 'Groundwater Licence'
        when name = 'Surface Water Licence' then 'Surface Water Licence'
        else name
      end`)
    )

    .then(() => {
      return knex('permit_type').insert([
        {
          agency: 'Water, Land and Resource Stewardship',
          division: 'Water, Fisheries and Coast',
          branch: 'Fisheries, Aquaculture and Wild Salmon',
          business_domain: '',
          type: '',
          name: 'Fish & Wildlife Fish Salvage Permit',
          source_system: '',
          source_system_acronym: ''
        }
      ]);
    });
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.raw(`DELETE FROM public.permit_type
      WHERE name = 'Fish & Wildlife Fish Salvage Permit'`)
    )

    .then(() =>
      knex.schema.raw(`update public.permit_type
      set name = case
        when name = 'Archaeology Alteration Permit' then 'Site Alteration Permit'
        when name = 'Archaeology Heritage Inspection Permit' then 'Heritage Inspection Permit'
        when name = 'Archaeology Heritage Investigation Permit' then 'Investigation Permit'
        when name = 'Site Remediation Authorization' then 'Contaminated Sites Remediation Permit'
        when name = 'Occupant Licence to Cut' then 'Occupant Licence to Cut'
        when name = 'Private Timber Mark' then 'Private Timber Mark'
        when name = 'Commercial Lands Tenure' then 'Commercial General'
        when name = 'Nominal Rent Tenure' then 'Nominal Rent Tenure'
        when name = 'Residential Lands Tenure' then 'Residential'
        when name = 'Public Roadways Lands Tenure' then 'Roadways - Public'
        when name = 'Sponsored Crown Grant' then 'Sponsored Crown Grant'
        when name = 'Lands Utility Tenure' then 'Utilities'
        when name = 'Rural Subdivision' then 'Rural subdivision'
        when name = 'Rezoning' then 'Rezoning'
        when name = 'Municipal Subdivision' then 'Municipal subdivision'
        when name = 'Highway Use Permit' then 'Highway Use Permit'
        when name = 'Other Transportation Permit' then 'Other'
        when name = 'Riparian Area Development Permit' then 'Riparian Area Development Permit'
        when name = 'Change Approval for Work In and About a Stream' then 'Change approval for work in and about a stream'
        when name = 'Notification for Work In and About a Stream' then 'Notification of authorized changes in and about a stream'
        when name = 'Short-term Water use approval' then 'Short-term use approval'
        when name = 'Groundwater Licence' then 'Groundwater Licence - Wells'
        when name = 'Surface Water Licence' then 'Surface Water Licence'
        else name
      end`)
    );
}
