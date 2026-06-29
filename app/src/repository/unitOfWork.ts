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
import { HousingProjectRepository } from './housingProject';
import { PermitRepository } from './permit';
import { ActivityRepository } from './activity';
import { ActivityContactRepository } from './activityContact';
import { DraftRepository } from './draft';
import { PermitTrackingRepository } from './permitTracking';
import { ElectrificationProjectRepository } from './electrificationProject';
import { GeneralProjectRepository } from './generalProject';
import { EnquiryRepository } from './enquiry';
import { DocumentRepository } from './document';
import { NoteRepository } from './note';
import { NoteHistoryRepository } from './noteHistory';
import { PermitTypeRepository } from './permitType';
import { SourceSystemKindRepository } from './sourceSystemKind';
import { PermitNoteRepository } from './permitNote';
import { requestContext } from '../types/context';

/**
 * Collection of repositories available within a unit-of-work scope.
 *
 * All repositories share the same Prisma transaction client, ensuring
 * that database operations participate in the same transaction boundary.
 */
export interface Repositories {
  accessRequest: AccessRequestRepository;
  activity: ActivityRepository;
  activityContact: ActivityContactRepository;
  contact: ContactRepository;
  document: DocumentRepository;
  draft: DraftRepository;
  electrificationProject: ElectrificationProjectRepository;
  enquiry: EnquiryRepository;
  generalProject: GeneralProjectRepository;
  housingProject: HousingProjectRepository;
  identityProvider: IdentityProviderRepository;
  initiative: InitiativeRepository;
  note: NoteRepository;
  noteHistory: NoteHistoryRepository;
  permit: PermitRepository;
  permitNote: PermitNoteRepository;
  permitTracking: PermitTrackingRepository;
  permitType: PermitTypeRepository;
  sourceSystemKind: SourceSystemKindRepository;
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

  get activity(): ActivityRepository {
    return this.getOrCreate('activity', () => new ActivityRepository(this.tx, this.principal));
  }

  get activityContact(): ActivityContactRepository {
    return this.getOrCreate('activityContact', () => new ActivityContactRepository(this.tx, this.principal));
  }

  get contact(): ContactRepository {
    return this.getOrCreate('contact', () => new ContactRepository(this.tx, this.principal));
  }

  get document(): DocumentRepository {
    return this.getOrCreate('document', () => new DocumentRepository(this.tx, this.principal));
  }

  get draft(): DraftRepository {
    return this.getOrCreate('draft', () => new DraftRepository(this.tx, this.principal));
  }

  get electrificationProject(): ElectrificationProjectRepository {
    return this.getOrCreate(
      'electrificationProject',
      () => new ElectrificationProjectRepository(this.tx, this.principal)
    );
  }

  get enquiry(): EnquiryRepository {
    return this.getOrCreate('enquiry', () => new EnquiryRepository(this.tx, this.principal));
  }

  get generalProject(): GeneralProjectRepository {
    return this.getOrCreate('generalProject', () => new GeneralProjectRepository(this.tx, this.principal));
  }

  get housingProject(): HousingProjectRepository {
    return this.getOrCreate('housingProject', () => new HousingProjectRepository(this.tx, this.principal));
  }

  get identityProvider(): IdentityProviderRepository {
    return this.getOrCreate('identityProvider', () => new IdentityProviderRepository(this.tx, this.principal));
  }

  get initiative(): InitiativeRepository {
    return this.getOrCreate('initiative', () => new InitiativeRepository(this.tx, this.principal));
  }

  get note(): NoteRepository {
    return this.getOrCreate('note', () => new NoteRepository(this.tx, this.principal));
  }

  get noteHistory(): NoteHistoryRepository {
    return this.getOrCreate('noteHistory', () => new NoteHistoryRepository(this.tx, this.principal));
  }

  get permit(): PermitRepository {
    return this.getOrCreate('permit', () => new PermitRepository(this.tx, this.principal));
  }

  get permitNote(): PermitNoteRepository {
    return this.getOrCreate('permitNote', () => new PermitNoteRepository(this.tx, this.principal));
  }

  get permitTracking(): PermitTrackingRepository {
    return this.getOrCreate('permitTracking', () => new PermitTrackingRepository(this.tx, this.principal));
  }

  get permitType(): PermitTypeRepository {
    return this.getOrCreate('permitType', () => new PermitTypeRepository(this.tx, this.principal));
  }

  get sourceSystemKind(): SourceSystemKindRepository {
    return this.getOrCreate('sourceSystemKind', () => new SourceSystemKindRepository(this.tx, this.principal));
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
   * @param opts - Transaction configuration options.
   * @param principal - Optional override of the principal of the unit of work.
   * @returns Result returned by the callback.
   */
  async execute<T>(
    fn: (repos: RepositoryProvider, tx: PrismaTransactionClient) => Promise<T>,
    opts: TxOpts = {},
    principal?: string
  ): Promise<T> {
    const { isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted, maxWait = 2000, timeout = 10000 } = opts;
    const txPrincipal = principal ?? requestContext.getStore()?.principal ?? SYSTEM_ID;

    return this.prisma.$transaction(
      async (tx) => {
        return fn(new RepositoryProvider(tx, txPrincipal), tx);
      },
      { isolationLevel, maxWait, timeout }
    );
  }

  /**
   * Executes a function within a Prisma transaction and exposes the raw transaction client.
   *
   * This is an escape hatch from the Unit of Work abstraction. Unlike `execute`,
   * this method does NOT provide repositories and instead exposes the underlying
   * Prisma transaction client directly.
   *
   * IMPORTANT:
   * This method should be avoided when possible.
   * Prefer `execute()` with RepositoryProvider to ensure:
   * - consistent data access patterns
   * - reduced coupling to Prisma
   * - better testability and maintainability
   *
   * Use this only when:
   * - repository abstractions are insufficient or overly restrictive
   * - performing bulk operations or raw queries (`$queryRaw`, `$executeRaw`)
   * - leveraging Prisma transaction capabilities not exposed via repositories
   * @template T - Result type returned by the callback.
   * @param fn - Transactional work receiving the raw Prisma transaction client.
   * @param principal - Acting user or system identifier.
   * @param opts - Transaction configuration options.
   * @returns Result returned by the callback.
   */
  async executeRaw<T>(
    fn: (tx: PrismaTransactionClient, principal: string) => Promise<T>,
    principal: string = SYSTEM_ID,
    opts: TxOpts = {}
  ): Promise<T> {
    const { isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted, maxWait = 2000, timeout = 10000 } = opts;

    return this.prisma.$transaction(
      async (tx) => {
        return fn(tx, principal);
      },
      { isolationLevel, maxWait, timeout }
    );
  }
}

export const unitOfWork = new UnitOfWork(prisma);
