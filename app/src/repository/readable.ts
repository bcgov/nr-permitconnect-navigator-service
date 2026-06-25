import { Prisma } from '@prisma/client';

/**
 * Typed view of a Prisma model delegate. Each method is generic
 * over its args so the return type is computed from the caller's
 * select/include via `Prisma.Result`.
 */
export interface ReadableModelDelegate<D> {
  count<A extends Prisma.Args<D, 'count'>>(
    args?: Prisma.SelectSubset<A, Prisma.Args<D, 'count'>>
  ): Promise<Prisma.Result<D, A, 'count'>>;
  findFirst<A extends Prisma.Args<D, 'findFirst'>>(
    args?: Prisma.SelectSubset<A, Prisma.Args<D, 'findFirst'>>
  ): Promise<Prisma.Result<D, A, 'findFirst'>>;
  findFirstOrThrow<A extends Prisma.Args<D, 'findFirstOrThrow'>>(
    args?: Prisma.SelectSubset<A, Prisma.Args<D, 'findFirstOrThrow'>>
  ): Promise<Prisma.Result<D, A, 'findFirstOrThrow'>>;
  findMany<A extends Prisma.Args<D, 'findMany'>>(
    args?: Prisma.SelectSubset<A, Prisma.Args<D, 'findMany'>>
  ): Promise<Prisma.Result<D, A, 'findMany'>>;
}

export abstract class ReadableRepository<TDelegate> {
  protected model: ReadableModelDelegate<TDelegate>;
  protected softDeleteEnabled: boolean;

  protected constructor(model: TDelegate, softDeleteEnabled = false) {
    this.model = model as ReadableModelDelegate<TDelegate>;
    this.softDeleteEnabled = softDeleteEnabled;
  }

  //-------------------------
  // Query Helpers
  //-------------------------

  // Merges `deletedAt: null` into `where` while preserving the args type `A`.
  private withNotDeleted<A>(args: A, includeDeleted: boolean): A {
    if (!this.softDeleteEnabled || includeDeleted) {
      return args;
    }

    return {
      ...args,
      where: {
        ...(args as { where?: object }).where,
        deletedAt: null
      }
    } as A; // Contained assertion: object spread widens, re-pin to `A`
  }

  //-------------------------
  // Reads
  //-------------------------

  async count<A extends Prisma.Args<TDelegate, 'count'>>(
    args?: Prisma.SelectSubset<A, Prisma.Args<TDelegate, 'count'>>,
    options?: { includeDeleted?: boolean }
  ): Promise<Prisma.Result<TDelegate, A, 'count'>> {
    return this.model.count(this.withNotDeleted(args, options?.includeDeleted === true));
  }

  async findMany<A extends Prisma.Args<TDelegate, 'findMany'>>(
    args?: Prisma.SelectSubset<A, Prisma.Args<TDelegate, 'findMany'>>,
    options?: { includeDeleted?: boolean }
  ): Promise<Prisma.Result<TDelegate, A, 'findMany'>> {
    return this.model.findMany(this.withNotDeleted(args, options?.includeDeleted === true));
  }

  async findFirst<A extends Prisma.Args<TDelegate, 'findFirst'>>(
    args?: Prisma.SelectSubset<A, Prisma.Args<TDelegate, 'findFirst'>>,
    options?: { includeDeleted?: boolean }
  ): Promise<Prisma.Result<TDelegate, A, 'findFirst'>> {
    return this.model.findFirst(this.withNotDeleted(args, options?.includeDeleted === true));
  }

  async findFirstOrThrow<A extends Prisma.Args<TDelegate, 'findFirstOrThrow'>>(
    args?: Prisma.SelectSubset<A, Prisma.Args<TDelegate, 'findFirstOrThrow'>>,
    options?: { includeDeleted?: boolean }
  ): Promise<Prisma.Result<TDelegate, A, 'findFirstOrThrow'>> {
    return this.model.findFirstOrThrow(this.withNotDeleted(args, options?.includeDeleted === true));
  }

  /*
   * findUnique is routed through findFirst so the soft-delete filter applies.
   * The unique-where is a valid findFirst-where, but the *operation* differs,
   * so the args/result are re-pinned to the findUnique shape.
   */
  async findUnique<A extends Prisma.Args<TDelegate, 'findUnique'>>(
    args: Prisma.SelectSubset<A, Prisma.Args<TDelegate, 'findUnique'>>,
    options?: { includeDeleted?: boolean }
  ): Promise<Prisma.Result<TDelegate, A, 'findUnique'>> {
    const finalArgs = this.withNotDeleted(args, options?.includeDeleted === true);

    const result = await this.model.findFirst(
      finalArgs as unknown as Prisma.SelectSubset<A, Prisma.Args<TDelegate, 'findFirst'>>
    );

    return result as Prisma.Result<TDelegate, A, 'findUnique'>;
  }

  async findUniqueOrThrow<A extends Prisma.Args<TDelegate, 'findUnique'>>(
    args: Prisma.SelectSubset<A, Prisma.Args<TDelegate, 'findUnique'>>,
    options?: { includeDeleted?: boolean }
  ): Promise<NonNullable<Prisma.Result<TDelegate, A, 'findUnique'>>> {
    const entity = await this.findUnique(args, options);

    if (!entity) {
      throw new Error('Entity not found');
    }

    return entity as NonNullable<Prisma.Result<TDelegate, A, 'findUnique'>>;
  }
}
