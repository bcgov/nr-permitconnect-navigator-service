import { Prisma } from '@prisma/client';

interface AuditFields {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

interface SoftDeleteFields {
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

interface PrismaDelegate<TModel, TCreateInput, TUpdateInput, TWhereUniqueInput, TFindManyArgs, TFindFirstArgs> {
  create(args: { data: TCreateInput }): Promise<TModel>;
  update(args: { where: TWhereUniqueInput; data: TUpdateInput }): Promise<TModel>;
  delete(args: { where: TWhereUniqueInput }): Promise<TModel>;
  findFirst(args: TFindFirstArgs): Promise<TModel | null>;
  findMany(args?: TFindManyArgs): Promise<TModel[]>;
}

export abstract class BaseRepository<
  TModel,
  TCreateInput extends Record<string, unknown>,
  TUpdateInput extends Record<string, unknown>,
  TWhereUniqueInput,
  TWhereInput,
  TFindManyArgs extends { where?: TWhereInput },
  TFindFirstArgs extends { where?: TWhereInput },
  TDelegate extends PrismaDelegate<TModel, TCreateInput, TUpdateInput, TWhereUniqueInput, TFindManyArgs, TFindFirstArgs>
> {
  protected constructor(
    protected readonly model: TDelegate,
    protected readonly userId: string,
    protected readonly softDeleteEnabled = false
  ) {}

  // ------------------------
  // Audit helpers
  // ------------------------

  protected withCreateAudit(data: TCreateInput): TCreateInput & AuditFields {
    const now = new Date();

    return {
      ...data,
      createdAt: now,
      createdBy: this.userId
    };
  }

  protected withUpdateAudit(data: TUpdateInput): TUpdateInput & AuditFields {
    return {
      ...data,
      updatedAt: new Date(),
      updatedBy: this.userId
    };
  }

  protected withSoftDelete(): SoftDeleteFields {
    return {
      deletedAt: new Date(),
      deletedBy: this.userId
    };
  }

  // ------------------------
  // Query helpers
  // ------------------------

  protected applyNotDeletedFilter(
    args: TFindManyArgs | TFindFirstArgs | undefined,
    includeDeleted = false
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

  // ------------------------
  // CRUD
  // ------------------------

  async create(data: TCreateInput): Promise<TModel> {
    return this.model.create({
      data: this.withCreateAudit(data)
    });
  }

  async update(where: TWhereUniqueInput, data: TUpdateInput): Promise<TModel> {
    return this.model.update({
      where,
      data: this.withUpdateAudit(data)
    });
  }

  async delete(where: TWhereUniqueInput): Promise<TModel> {
    if (!this.softDeleteEnabled) {
      return this.model.delete({ where });
    }

    return this.model.update({
      where,
      data: {
        ...this.withUpdateAudit({} as TUpdateInput),
        ...this.withSoftDelete()
      }
    });
  }

  async findFirst(args: TFindFirstArgs, options?: { includeDeleted?: boolean }): Promise<TModel | null> {
    return this.model.findFirst(this.applyNotDeletedFilter(args, options?.includeDeleted) as TFindFirstArgs);
  }

  async findMany(args?: TFindManyArgs, options?: { includeDeleted?: boolean }): Promise<TModel[]> {
    return this.model.findMany(this.applyNotDeletedFilter(args, options?.includeDeleted) as TFindManyArgs);
  }
}
