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

## Update Backup Container

Follow the outlined steps [here](https://github.com/bcgov/nr-permitconnect-navigator-service/wiki/Database-Backup-and-Restore#updating-the-backup-container-version).

## Recovery Database

Follow the outlined steps [here](https://github.com/bcgov/nr-permitconnect-navigator-service/wiki/Database-Backup-and-Restore#recovery).

## Generating enums

Run `npm run prisma:enums`

## Future Considerations

Consider the use of namespaces/modules to wrap particular sections of the application. As more initiatives are added to the system there will be naming conflicts.
