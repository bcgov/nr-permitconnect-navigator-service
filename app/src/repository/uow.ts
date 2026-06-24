import { Prisma } from '@prisma/client';

import { UserRepository } from './user';
import prisma, { PrismaClientType, PrismaTransactionClient } from '../db/database';
import { ContactRepository } from './contact';
import { SYSTEM_ID } from '../utils/constants/application';
import { IdentityProviderRepository } from './identityProvider';
import { SubjectGroupRepository } from './yars/subjectGroup';
import { GroupRepository } from './yars/group';
import { InitiativeRepository } from './initiative';
import { GroupRolePolicyVwRepository } from './yars/groupRolePolicyVw';
import { AccessRequestRepository } from './accessRequest';
import { PolicyAttributeRepository } from './yars/policyAttribute';

/**
 * Collection of repositories available within a unit-of-work scope.
 *
 * All repositories share the same Prisma transaction client, ensuring
 * that database operations participate in the same transaction boundary.
 */
export interface Repositories {
  accessRequest: AccessRequestRepository;
  contact: ContactRepository;
  identityProvider: IdentityProviderRepository;
  initiative: InitiativeRepository;
  user: UserRepository;

  // YARS
  group: GroupRepository;
  groupRolePolicyVw: GroupRolePolicyVwRepository;
  policyAttribute: PolicyAttributeRepository;
  subjectGroup: SubjectGroupRepository;
}

/**
 * Provides lazily instantiated repository instances for a transaction scope.
 *
 * Repository instances are created on first access and cached for the
 * lifetime of the provider. All repositories share the same transaction
 * client and principal context.
 */
class RepositoryProvider implements Repositories {
  private readonly tx: PrismaTransactionClient;
  private readonly principal: string;

  private repositories = new Map<string, object>();

  constructor(tx: PrismaTransactionClient, principal: string) {
    this.tx = tx;
    this.principal = principal;
  }

  //--------------------------------------------------------------------------
  // PCNS Repositories
  //--------------------------------------------------------------------------

  get accessRequest(): AccessRequestRepository {
    return this.getOrCreate('accessRequest', () => new AccessRequestRepository(this.tx, this.principal));
  }

  get contact(): ContactRepository {
    return this.getOrCreate('contact', () => new ContactRepository(this.tx, this.principal));
  }

  get identityProvider(): IdentityProviderRepository {
    return this.getOrCreate('identityProvider', () => new IdentityProviderRepository(this.tx, this.principal));
  }

  get initiative(): InitiativeRepository {
    return this.getOrCreate('initiative', () => new InitiativeRepository(this.tx, this.principal));
  }

  get user(): UserRepository {
    return this.getOrCreate('user', () => new UserRepository(this.tx, this.principal));
  }

  //--------------------------------------------------------------------------
  // YARS Repositories
  //--------------------------------------------------------------------------

  get group(): GroupRepository {
    return this.getOrCreate('group', () => new GroupRepository(this.tx, this.principal));
  }

  get groupRolePolicyVw(): GroupRolePolicyVwRepository {
    return this.getOrCreate('groupRolePolicyVw', () => new GroupRolePolicyVwRepository(this.tx));
  }

  get policyAttribute(): PolicyAttributeRepository {
    return this.getOrCreate('policyAttribute', () => new PolicyAttributeRepository(this.tx, this.principal));
  }

  get subjectGroup(): SubjectGroupRepository {
    return this.getOrCreate('subjectGroup', () => new SubjectGroupRepository(this.tx, this.principal));
  }

  //--------------------------------------------------------------------------
  // Internal Helpers
  //--------------------------------------------------------------------------

  /**
   * Returns a cached repository instance or creates one if it does not exist.
   * @param key - Unique repository cache key.
   * @param factory - Repository factory function.
   * @returns A repository object
   */
  private getOrCreate<T extends object>(key: string, factory: () => T): T {
    let repo = this.repositories.get(key);

    if (!repo) {
      repo = factory();
      this.repositories.set(key, repo);
    }

    return repo as T;
  }
}

/**
 * Transaction execution options.
 */
interface TxOpts {
  isolationLevel?: Prisma.TransactionIsolationLevel;
  maxWait?: number;
  timeout?: number;
}

/**
 * Implements the Unit of Work pattern for transactional database operations.
 *
 * Creates a transaction boundary, instantiates repositories bound to that
 * transaction, and provides them to the supplied callback. Any repository
 * operations executed through the callback participate in the same atomic
 * transaction.
 */
class UnitOfWork {
  private prisma: PrismaClientType;

  constructor(prisma: PrismaClientType) {
    this.prisma = prisma;
  }

  /**
   * Executes a function within a database transaction.
   *
   * A RepositoryProvider is created for the transaction and supplied to the
   * callback. All repositories resolved from the provider share the same
   * transaction context.
   * @template T - Result type returned by the callback.
   * @param fn - Transactional work to execute.
   * @param principal - Acting user or system identifier.
   * @param opts - Transaction configuration options.
   * @returns Result returned by the callback.
   */
  async execute<T>(
    fn: (repos: RepositoryProvider) => Promise<T>,
    principal: string = SYSTEM_ID,
    opts: TxOpts = {}
  ): Promise<T> {
    const { isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted, maxWait = 2000, timeout = 10000 } = opts;

    return this.prisma.$transaction(
      async (tx) => {
        return fn(new RepositoryProvider(tx, principal));
      },
      { isolationLevel, maxWait, timeout }
    );
  }
}

export const unitOfWork = new UnitOfWork(prisma);

/*

src/
├── controllers/          # Entry point (HTTP requests & responses)
│   └── user.ts
│
├── services/             # Orchestration / Workflows
│   └── user.ts
│
├── domains/              # Pure domain logic & validations
│   └── user.ts
│
├── repositories/         # Pure data access layer
│   ├── base.ts
│   ├── user.ts
│   └── unit-of-work.ts

[ Controller ]
      │
      ▼
 [ Service ]   ◄─── (Manages Unit of Work transactions)
   │       │
   │       ▼
   │   [ Domain ]   (Atomic, reusable business rules)
   │       │
   ▼       ▼
[ Repository ]      (Isolated DB queries)

*/
