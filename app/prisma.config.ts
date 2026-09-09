try {
  process.loadEnvFile();
} catch {
  // no .env file (e.g. CI) — DATABASE_URL already in process.env
}

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'src/db/prisma/schema.prisma',
  // no `migrations` block — Knex owns migrations, not `prisma migrate`
  datasource: {
    url: env('DATABASE_URL')
  }
});
