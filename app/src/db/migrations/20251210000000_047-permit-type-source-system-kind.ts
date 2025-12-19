import stamps from '../stamps.ts';

import type { Knex } from 'knex';

const permitTypeSystemsKinds = [
  {
    permitTypeName: [
      'Archaeology Alteration Permit',
      'Archaeology Heritage Inspection Permit',
      'Archaeology Heritage Investigation Permit'
    ],
    systemsKinds: [{ sourceSystem: 'ITSM-5285', sourceSystemKind: ['Application Number', 'Permit Number'] }]
  },
  {
    permitTypeName: ['Park Use Permit - Land Use Occupancy'],
    systemsKinds: [{ sourceSystem: 'ITSM-5939', sourceSystemKind: ['Authorization Number'] }]
  },
  {
    permitTypeName: ['Section 16 Authorization for use of a site or trail for industrial purpose'],
    systemsKinds: [{ sourceSystem: 'ITSM-6117', sourceSystemKind: ['Tracking Number'] }]
  },
  {
    permitTypeName: ['Site Remediation Authorization'],
    systemsKinds: [
      { sourceSystem: 'ITSM-5364', sourceSystemKind: ['Application ID'] },
      { sourceSystem: 'ITSM-6030', sourceSystemKind: ['Site ID'] }
    ]
  },
  {
    permitTypeName: ['Waste Discharge Permit'],
    systemsKinds: [{ sourceSystem: 'ITSM-5528', sourceSystemKind: ['Authorization Number', 'Tracking Number'] }]
  },
  {
    permitTypeName: ['Fish Salvage Permit', 'General Wildlife Permit', 'Scientific Fish Collection Permit'],
    systemsKinds: [
      { sourceSystem: 'ITSM-5527', sourceSystemKind: ['Tracking Number'] },
      { sourceSystem: 'ITSM-6117', sourceSystemKind: ['Tracking Number'] }
    ]
  },
  {
    permitTypeName: ['Forest Road Use Permit', 'Forest Service Road Road Use Permit'],
    systemsKinds: [{ sourceSystem: 'ITSM-6004', sourceSystemKind: ['Forest File ID'] }]
  },
  {
    permitTypeName: ['Occupant Licence to Cut', 'Private Timber Mark', 'Special Use Permit', 'Works Permit'],
    systemsKinds: [{ sourceSystem: 'ITSM-5644', sourceSystemKind: ['Forest File ID'] }]
  },
  {
    permitTypeName: [
      'Commercial Lands Tenure',
      'Industrial General Tenure',
      'Lands Utility Tenure',
      'Nominal Rent Tenure',
      'Public Roadways Lands Tenure',
      'Residential Lands Tenure',
      'Sponsored Crown Grant',
      'Statutory Right of Way',
      'Wind Power Investigative Licence',
      'Wind Power Multi-Tenure Instrument'
    ],
    systemsKinds: [
      { sourceSystem: 'ITSM-6117', sourceSystemKind: ['Tracking Number'] },
      { sourceSystem: 'ITSM-5314', sourceSystemKind: ['Project Number', 'Authorization ID'] },
      { sourceSystem: 'ITSM-6072', sourceSystemKind: ['Business Area File Number', 'Disposition Transaction ID'] }
    ]
  },
  {
    permitTypeName: ['Aggregates and Quarry Materials Tenure', 'Notice of Work'],
    systemsKinds: [{ sourceSystem: 'ITSM-5816', sourceSystemKind: ['Tracking Number'] }]
  },
  {
    permitTypeName: ['Riparian Area Development Permit'],
    systemsKinds: [{ sourceSystem: 'ITSM-5963', sourceSystemKind: ['Assessment ID', 'Site ID', 'Application ID'] }]
  },
  {
    permitTypeName: [
      'Highway Use Permit',
      'Municipal Subdivision',
      'Other Transportation Permit',
      'Rezoning',
      'Rural Subdivision'
    ],
    systemsKinds: [{ sourceSystem: 'ITSM-60081', sourceSystemKind: ['File Number'] }]
  },
  {
    permitTypeName: [
      'Change Approval for Work In and About a Stream',
      'Groundwater Licence',
      'Notification for Work In and About a Stream',
      'Short-term Water Use Approval',
      'Surface Water Licence'
    ],
    systemsKinds: [
      { sourceSystem: 'ITSM-6117', sourceSystemKind: ['Tracking Number'] },
      { sourceSystem: 'ITSM-5314', sourceSystemKind: ['Project Number', 'Authorization ID'] },
      { sourceSystem: 'ITSM-6197', sourceSystemKind: ['File Number', 'Job Number'] }
    ]
  }
];

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Update source_system for Transportation permit types
      .then(() =>
        knex('permit_type').where('business_domain', 'Transportation').update({ source_system: 'ITSM-60081' })
      )

      // Add new source_system_kind rows
      .then(() =>
        knex('source_system_kind').insert({
          description: 'Assessment ID',
          source_system: 'ITSM-5963'
        })
      )
      .then(() =>
        knex('source_system_kind').insert({
          description: 'Site ID',
          source_system: 'ITSM-5963'
        })
      )
      .then(() =>
        knex('source_system_kind').insert({
          description: 'Application ID',
          source_system: 'ITSM-5963'
        })
      )

      // Create permit_type_source_system_kind_xref table
      .then(() =>
        knex.schema.createTable('permit_type_source_system_kind_xref', (table) => {
          table.primary(['permit_type_id', 'source_system_kind_id']);
          table
            .integer('permit_type_id')
            .notNullable()
            .references('permit_type_id')
            .inTable('permit_type')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table
            .integer('source_system_kind_id')
            .notNullable()
            .references('source_system_kind_id')
            .inTable('source_system_kind')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');

          stamps(knex, table);
        })
      )

      // Populate permit_type_source_system_kind_xref table
      .then(async () => {
        for (const ptsk of permitTypeSystemsKinds) {
          const permitTypes = await knex
            .select('permit_type_id')
            .from('permit_type')
            .whereIn('name', ptsk.permitTypeName);

          for (const sk of ptsk.systemsKinds) {
            const sourceSystemKinds = await knex
              .select('source_system_kind_id')
              .from('source_system_kind')
              .whereIn('description', sk.sourceSystemKind)
              .andWhere('source_system', sk.sourceSystem);

            const items = [];
            for (const pt of permitTypes) {
              for (const ssk of sourceSystemKinds) {
                items.push({
                  permit_type_id: pt.permit_type_id,
                  source_system_kind_id: ssk.source_system_kind_id
                });
              }
            }
            // Insert into permit_type_source_system_kind_xref table
            if (items.length > 0) {
              await knex('permit_type_source_system_kind_xref').insert(items);
            }
          }
        }
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Clear source_system for Transportation permit types
      .then(() => knex('permit_type').where('business_domain', 'Transportation').update({ source_system: null }))

      // Remove new source_system_kind rows
      .then(() =>
        knex('source_system_kind')
          .where({
            description: 'Application ID',
            source_system: 'ITSM-5963'
          })
          .del()
      )
      .then(() =>
        knex('source_system_kind')
          .where({
            description: 'Site ID',
            source_system: 'ITSM-5963'
          })
          .del()
      )
      .then(() =>
        knex('source_system_kind')
          .where({
            description: 'Assessment ID',
            source_system: 'ITSM-5963'
          })
          .del()
      )

      // Drop permit_type_source_system_kind_xref table
      .then(() => knex.schema.dropTableIfExists('permit_type_source_system_kind_xref'))
  );
}
