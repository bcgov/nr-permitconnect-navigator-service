export interface AuditFields {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface SoftDeleteFields {
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

interface PrismaDelegate<
  TModel,
  TCreateInput,
  TUpdateInput,
  TWhereUniqueInput,
  TFindUniqueArgs,
  TFindFirstArgs,
  TFindManyArgs
> {
  create(args: { data: TCreateInput }): Promise<TModel>;
  update(args: { where: TWhereUniqueInput; data: TUpdateInput }): Promise<TModel>;
  upsert(args: { where: TWhereUniqueInput; create: TCreateInput; update: TUpdateInput }): Promise<TModel>;
  delete(args: { where: TWhereUniqueInput }): Promise<TModel>;
  findUnique(args: TFindUniqueArgs): Promise<TModel | null>;
  findUniqueOrThrow(args: TFindUniqueArgs): Promise<TModel>;
  findFirst(args: TFindFirstArgs): Promise<TModel | null>;
  findFirstOrThrow(args: TFindFirstArgs): Promise<TModel>;
  findMany(args?: TFindManyArgs): Promise<TModel[]>;
}

export abstract class BaseRepository<
  TModel,
  TCreateInput extends Record<string, unknown>,
  TUpdateInput extends Record<string, unknown>,
  TWhereUniqueInput,
  TWhereInput,
  TFindUniqueArgs extends { where: TWhereUniqueInput },
  TFindFirstArgs extends { where?: TWhereInput },
  TFindManyArgs extends { where?: TWhereInput },
  TDelegate extends PrismaDelegate<
    TModel,
    TCreateInput,
    TUpdateInput,
    TWhereUniqueInput,
    TFindUniqueArgs,
    TFindFirstArgs,
    TFindManyArgs
  >
> {
  protected model: TDelegate;
  protected principal: string;
  protected softDeleteEnabled: boolean;

  protected constructor(model: TDelegate, principal: string, softDeleteEnabled = false) {
    this.model = model;
    this.principal = principal;
    this.softDeleteEnabled = softDeleteEnabled;
  }

  //-------------------------
  // Audit
  //-------------------------

  protected withCreateAudit(data: TCreateInput): TCreateInput & AuditFields {
    const now = new Date();

    return {
      ...data,
      createdAt: now,
      createdBy: this.principal
    };
  }

  protected withUpdateAudit(data: TUpdateInput): TUpdateInput & AuditFields {
    return {
      ...data,
      updatedAt: new Date(),
      updatedBy: this.principal
    };
  }

  protected withSoftDelete(): SoftDeleteFields {
    return {
      deletedAt: new Date(),
      deletedBy: this.principal
    };
  }

  //-------------------------
  // Query Helpers
  //-------------------------

  protected applyNotDeletedFilter(
    args: TFindManyArgs | TFindFirstArgs | undefined,
    includeDeleted: boolean
  ): TFindManyArgs | TFindFirstArgs {
    if (!this.softDeleteEnabled || includeDeleted) {
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

  //-------------------------
  // CRUD
  //-------------------------

  async create(data: TCreateInput): Promise<TModel> {
    return this.model.create({
      data: this.withCreateAudit(data)
    });
  }

  async update(where: TWhereUniqueInput, data: TUpdateInput): Promise<TModel> {
    return this.model.update({
      where: where,
      data: this.withUpdateAudit(data)
    });
  }

  async upsert(where: TWhereUniqueInput, create: TCreateInput, update: TUpdateInput): Promise<TModel> {
    return this.model.upsert({
      where: where,
      create: this.withCreateAudit(create),
      update: this.withUpdateAudit(update)
    });
  }

  async delete(where: TWhereUniqueInput, options?: { hard?: boolean }): Promise<TModel> {
    if (this.softDeleteEnabled && !options?.hard) {
      return this.model.update({
        where: where,
        data: {
          ...this.withUpdateAudit({} as TUpdateInput),
          ...this.withSoftDelete()
        }
      });
    }

    return this.model.delete({ where: where });
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
