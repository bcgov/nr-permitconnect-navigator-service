import { Prisma } from '@prisma/client';

import { ReadableModelDelegate, ReadableRepository } from './readable';

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

type CreateData<D> = Prisma.Args<D, 'create'>['data'];
type UpdateData<D> = Prisma.Args<D, 'update'>['data'];
type WhereUnique<D> = Prisma.Args<D, 'findUnique'>['where'];
type DeleteUnique<D> = Prisma.Args<D, 'delete'>['where'];
type DeleteManyUnique<D> = Prisma.Args<D, 'deleteMany'>['where'];

/** The default (all-scalars, no-relations) record shape for a delegate. */
type DefaultModel<D> = Prisma.Result<D, object, 'findUniqueOrThrow'>;

/**
 * Typed view of a Prisma model delegate.
 */
interface WritableModelDelegate<D> extends ReadableModelDelegate<D> {
  create(args: { data: CreateData<D> }): Promise<DefaultModel<D>>;
  update(args: { where: WhereUnique<D>; data: UpdateData<D> }): Promise<DefaultModel<D>>;
  upsert(args: { where: WhereUnique<D>; create: CreateData<D>; update: UpdateData<D> }): Promise<DefaultModel<D>>;
  delete(args: { where: DeleteUnique<D> }): Promise<DefaultModel<D>>;
  deleteMany(args: { where: DeleteManyUnique<D> }): Promise<DefaultModel<D>>;
}

export abstract class WritableRepository<TDelegate> extends ReadableRepository<TDelegate> {
  declare protected model: WritableModelDelegate<TDelegate>;
  protected principal: string;

  protected constructor(model: TDelegate, principal: string, softDeleteEnabled = false) {
    super(model, softDeleteEnabled);
    this.principal = principal;
  }

  //-------------------------
  // Audit
  //-------------------------

  protected withCreateAudit<T extends object>(data: T): T & AuditFields {
    return { ...data, createdAt: new Date(), createdBy: this.principal };
  }

  protected withUpdateAudit<T extends object>(data: T): T & AuditFields {
    return { ...data, updatedAt: new Date(), updatedBy: this.principal };
  }

  protected withSoftDelete(): SoftDeleteFields {
    return { deletedAt: new Date(), deletedBy: this.principal };
  }

  //-------------------------
  // CRUD
  //-------------------------

  async create(data: CreateData<TDelegate>): Promise<DefaultModel<TDelegate>> {
    return this.model.create({ data: this.withCreateAudit(data) });
  }

  async update(where: WhereUnique<TDelegate>, data: UpdateData<TDelegate>): Promise<DefaultModel<TDelegate>> {
    return this.model.update({ where, data: this.withUpdateAudit(data) });
  }

  async upsert(
    where: WhereUnique<TDelegate>,
    create: CreateData<TDelegate>,
    update: UpdateData<TDelegate>
  ): Promise<DefaultModel<TDelegate>> {
    return this.model.upsert({
      where,
      create: this.withCreateAudit(create),
      update: this.withUpdateAudit(update)
    });
  }

  async delete(where: DeleteUnique<TDelegate>, options?: { hard?: boolean }): Promise<DefaultModel<TDelegate>> {
    if (this.softDeleteEnabled && !options?.hard) {
      return this.model.update({
        where,
        data: { ...this.withUpdateAudit({}), ...this.withSoftDelete() }
      });
    }

    return this.model.delete({ where });
  }

  async deleteMany(where: DeleteManyUnique<TDelegate>, options?: { hard?: boolean }): Promise<DefaultModel<TDelegate>> {
    if (this.softDeleteEnabled && !options?.hard) {
      return this.model.update({
        where,
        data: { ...this.withUpdateAudit({}), ...this.withSoftDelete() }
      });
    }

    return this.model.deleteMany({ where });
  }
}
