// local testing: npx tsx backfillCompanyIds.ts
// openshift testing: cd to /opt/app-root/src/sbin, run node app/backfillCompanyIds.js
import axios from 'axios';

import prisma from './src/db/dataConnection';
import { getLogger } from './src/utils/log';

const log = getLogger(module.filename);

const ORG_BOOK_API_PATH = 'https://orgbook.gov.bc.ca/api/v4';
const ORG_BOOK_QUERY_PARAMS = {
  limit: 100,
  skip: 0,
  latest: true,
  inactive: false,
  revoked: false
};

async function searchOrgBook(nameSearch: string) {
  const response = await axios.get(`${ORG_BOOK_API_PATH}/search/autocomplete`, {
    params: { q: nameSearch, ...ORG_BOOK_QUERY_PARAMS },
    timeout: 10000
  });
  // Add half a second delay after each API call to avoid rate limiting
  await new Promise((resolve) => setTimeout(resolve, 500));
  return response.data;
}

async function backfillCompanyIds() {
  log.info('\nStarting backfill of company_id_registered for housing_project...\n');

  // Fetch housing projects with company_name_registered but missing company_id_registered
  const projects = await prisma.housing_project.findMany({
    where: {
      companyNameRegistered: { not: null },
      isDevelopedInBc: 'Yes',
      OR: [{ companyIdRegistered: null }, { companyIdRegistered: '' }]
    },
    select: {
      housingProjectId: true,
      companyNameRegistered: true
    }
  });

  log.info(`Found ${projects.length} housing projects to backfill\n`);

  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (const project of projects) {
    try {
      log.info(`Processing: ${project.companyNameRegistered}`);

      const orgBookData = await searchOrgBook(project.companyNameRegistered as string);

      if (orgBookData?.results) {
        const exactMatch = orgBookData.results.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) =>
            result.type === 'name' && result.value.toLowerCase() === project.companyNameRegistered?.toLowerCase()
        );

        if (exactMatch) {
          const companyId = exactMatch.topic_source_id;

          await prisma.housing_project.update({
            where: { housingProjectId: project.housingProjectId },
            data: { companyIdRegistered: companyId }
          });

          log.info(`✓ Updated with ID: ${companyId}\n`);
          updated++;
        } else {
          log.warn('✗ No exact match found\n');
          notFound++;
        }
      } else {
        log.warn('✗ No results from API\n');
        notFound++;
      }
    } catch (error) {
      log.error(`✗ Error processing ${project.companyNameRegistered}:`, error);
      errors++;
    }
  }

  log.info('\n=== Backfill Summary ===');
  log.info(`Total processed: ${projects.length}`);
  log.info(`Successfully updated: ${updated}`);
  log.info(`Not found: ${notFound}`);
  log.info(`Errors: ${errors}\n`);

  await prisma.$disconnect();
}

backfillCompanyIds().catch(async (error) => {
  log.error('Fatal error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
