import type { Knex } from 'knex';

const permitNames = [
  'Archaeology Alteration Permit',
  'Archaeology Heritage Inspection Permit',
  'Archaeology Heritage Investigation Permit'
];

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Update permit types
      .then(async () => {
        const partialPermit = {
          agency: 'Forests',
          division: 'Provincial Operations'
        };

        await knex('permit_type').whereIn('name', permitNames).update({
          agency: partialPermit.agency,
          division: partialPermit.division
        });
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(async () => {
    // Revert permit types
    const partialPermit = {
      agency: 'Water, Land and Resource Stewardship',
      division: 'Forest Resiliency and Archaeology'
    };

    await knex('permit_type').whereIn('name', permitNames).update({
      agency: partialPermit.agency,
      division: partialPermit.division
    });
  });
}
