import { Prisma } from '@prisma/client';
import { Problem } from '../utils';

export class DatabaseProblem extends Problem {
  constructor(detail = 'Database operation failed') {
    super(500, {
      type: '/problems/database-error',
      title: 'Database Error',
      detail
    });
  }
}

export class DuplicateKeyProblem extends Problem {
  readonly fields: string[];

  constructor(fields?: string[]) {
    super(
      409,
      {
        type: '/problems/duplicate-key',
        title: 'Duplicate Key',
        detail: fields?.length
          ? `Unique constraint violation on field(s): ${fields.join(', ')}`
          : 'Duplicate value violates a unique constraint'
      },
      { fields }
    );
    this.fields = fields ?? [];
  }

  public isConstraint(...expected: string[]): boolean {
    return expected.every((f) => this.fields.includes(f));
  }
}

export class ForeignKeyProblem extends Problem {
  constructor(field?: string) {
    super(
      409,
      {
        type: '/problems/foreign-key',
        title: 'Foreign Key Constraint',
        detail: field ? `Foreign key constraint failed on '${field}'.` : 'Foreign key constraint failed.'
      },
      { field }
    );
  }
}

export class NotFoundProblem extends Problem {
  constructor(entity = 'Record') {
    super(404, {
      type: '/problems/not-found',
      title: `${entity} Not Found`,
      detail: `${entity} could not be found`
    });
  }
}

export function mapPrismaError(error: unknown): Problem {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return new DatabaseProblem('Unknown database error');
  }

  switch (error.code) {
    case 'P2002': {
      const fields = (error.meta?.target as string[] | undefined) ?? [];
      return new DuplicateKeyProblem(fields);
    }

    case 'P2003': {
      const field = typeof error.meta?.field_name === 'string' ? error.meta.field_name : undefined;

      return new ForeignKeyProblem(field);
    }

    case 'P2025':
      return new NotFoundProblem();

    default:
      return new DatabaseProblem(`Unhandled Prisma error: ${error.code}`);
  }
}
