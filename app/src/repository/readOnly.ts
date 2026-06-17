export interface PrismaDelegate<TModel, TFindUniqueArgs, TFindFirstArgs, TFindManyArgs> {
  findUnique(args: TFindUniqueArgs): Promise<TModel | null>;
  findUniqueOrThrow(args: TFindUniqueArgs): Promise<TModel>;
  findFirst(args: TFindFirstArgs): Promise<TModel | null>;
  findFirstOrThrow(args: TFindFirstArgs): Promise<TModel>;
  findMany(args?: TFindManyArgs): Promise<TModel[]>;
}

export abstract class ReadOnlyRepository<
  TModel,
  TWhereUniqueInput,
  TWhereInput,
  TFindUniqueArgs extends { where: TWhereUniqueInput },
  TFindFirstArgs extends { where?: TWhereInput },
  TFindManyArgs extends { where?: TWhereInput },
  TDelegate extends PrismaDelegate<TModel, TFindUniqueArgs, TFindFirstArgs, TFindManyArgs>
> {
  protected model: TDelegate;

  protected constructor(model: TDelegate) {
    this.model = model;
  }

  // ------------------------
  // Query Helpers
  // ------------------------

  protected applyNotDeletedFilter(
    args: TFindManyArgs | TFindFirstArgs | undefined,
    includeDeleted: boolean
  ): TFindManyArgs | TFindFirstArgs {
    if (includeDeleted) {
      return (args ?? {}) as TFindManyArgs | TFindFirstArgs;
    }

    const base = (args ?? {}) as TFindManyArgs | TFindFirstArgs;

    return {
      ...base,
      where: {
        ...(base.where ?? ({} as TWhereInput)),
        deletedAt: null
      }
    };
  }
  /*
   * For soft-delete support, you cannot safely use Prisma's findUnique
   * directly because findUnique only accepts unique fields.
   */
  async findUnique(where: TWhereUniqueInput, options?: { includeDeleted?: boolean }): Promise<TModel | null> {
    return this.model.findFirst(
      this.applyNotDeletedFilter(
        {
          where
        } as unknown as TFindFirstArgs,
        options?.includeDeleted === true
      ) as TFindFirstArgs
    );
  }

  async findUniqueOrThrow(where: TWhereUniqueInput, options?: { includeDeleted?: boolean }): Promise<TModel> {
    const entity = await this.findUnique(where, options);

    if (!entity) {
      throw new Error('Entity not found');
    }

    return entity;
  }

  async findFirst(args: TFindFirstArgs, options?: { includeDeleted?: boolean }): Promise<TModel | null> {
    return this.model.findFirst(this.applyNotDeletedFilter(args, options?.includeDeleted === true) as TFindFirstArgs);
  }

  async findFirstOrThrow(args: TFindFirstArgs, options?: { includeDeleted?: boolean }): Promise<TModel> {
    return this.model.findFirstOrThrow(
      this.applyNotDeletedFilter(args, options?.includeDeleted === true) as TFindFirstArgs
    );
  }

  async findMany(args?: TFindManyArgs, options?: { includeDeleted?: boolean }): Promise<TModel[]> {
    return this.model.findMany(this.applyNotDeletedFilter(args, options?.includeDeleted === true) as TFindManyArgs);
  }
}
