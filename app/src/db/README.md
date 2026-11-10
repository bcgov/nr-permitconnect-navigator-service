# NR PermitConnect Navigator Service Database

## Directory Structure

```txt
db/                       - Database Root
├── codes/                - Contains codes cache, enums (and generator file), tables, types, and validators
├── extensions/           - Defines Prisma extensions
├── manual-migrations/    - Knex database manual migrations files
├── migrations/           - Knex database migrations files
├── prisma/               - Location of the Prisma schema and views
├── seeds/                - Knex database seeds files
└── utils/                - Utility functions and Transaction Wrapper
    └── migrations/       - Yars and helper functions for Knex migrations
database.ts               - Defines the Prisma database and database health checks
```

## Database Operations

Deployed environments use standalone Crunchy PostgreSQL Operator (PGO)
infrastructure. Backups and recovery are managed with pgBackRest.

- [Architecture](https://github.com/bcgov/nr-permitconnect-navigator-service/wiki/Database-Architecture)
- [Deployment](https://github.com/bcgov/nr-permitconnect-navigator-service/wiki/Database-Deployment)
- [Connections, credentials, and migrations](https://github.com/bcgov/nr-permitconnect-navigator-service/wiki/Database-Operations)
- [Backup and restore](https://github.com/bcgov/nr-permitconnect-navigator-service/wiki/Database-Backup-and-Restore)

## Database Recovery

Follow the outlined [restore procedures](https://github.com/bcgov/nr-permitconnect-navigator-service/wiki/Database-Backup-and-Restore#restore-procedures).

## Local Development

Run these commands from `app/` with your local database configured.

- `npm run prisma:migrate` applies pending Knex migrations from `src/db/migrations`.
- `npm run prisma:sync` pulls the current database schema into the Prisma schema and regenerates the Prisma client.

> [!IMPORTANT]
> Knex reads `server.db.*` (or `SERVER_DB_*`), while Prisma reads `DATABASE_URL`. Both must point at the same database.
>
> Make sure that `DATABASE_URL` is set in `app/.env` and that the `server.db.*` values in `app/config` point to the same database.

Database migrations are managed with Knex, not Prisma Migrate.

## Generating enums

With a database connection configured run:

```bash
npm run prisma:enums
```

It reads active code-table values and generates enum files for both the `/app` and `/frontend`.

## Future Considerations

Consider the use of namespaces/modules to wrap particular sections of the application. As more initiatives are added to the system there will be naming conflicts.
