# NR PermitConnect Navigator Service Database

## Directory Structure

```txt
db/                       - Database Root
├── migrations/           - Knex database migrations files
├── models/               - Database/Application conversion layer
├── prisma/               - Location of the Prisma schema
└── utils/                - Utility functions
dataConnection.ts         - Defines the Prisma database connection
stamps.ts                 - Defines default timestamp columns
```

## Models

The files in `models/` contain two key sections: type definitions, and `toPrismaModel`/`fromPrismaModel` conversion functions.

The type definitions are necessary to generate the appropriate hard typings for the conversions. They do not need to be exported as they should never need to be referenced outsite their respective files.

Due to the way Prisma handles foreign keys multiple types may need to be created.

Types beginning with `PrismaRelation` are type definitions for an object going to the database. This type may or may not include relational information, but for consistency are named with the same prefix.

Types beginning with `PrismaGraph` are type definitions for an object coming from the database. The incoming type may also begin with `PrismaRelation` - it depends if there is any relational information required or not.

See `user.ts` and `document.ts` for examples of the differences.

The `toPrismaModel` and `fromPrismaModel` functions are used to convert Prisma database models to application `src/types/` and vice versa. These functions should only ever be used in the application service layer.

## Future Considerations

Consider the use of namespaces/modules to wrap particular sections of the application. As more initiatives are added to the system there will be naming conflicts.
