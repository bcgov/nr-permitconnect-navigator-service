import { Prisma } from '@prisma/client';

import { UserRepository } from './user';
import prisma, { PrismaClientType } from '../db/database';
import { ContactRepository } from './contact';
import { SYSTEM_ID } from '../utils/constants/application';
import { IdentityProviderRepository } from './identityProvider';
import { SubjectGroupRepository } from './yars/subjectGroup';
import { GroupRepository } from './yars/group';
import { InitiativeRepository } from './initiative';
import { GroupRolePolicyVwRepository } from './yars/groupRolePolicyVw';
import { AccessRequestRepository } from './accessRequest';
import { PolicyAttributeRepository } from './yars/policyAttribute';

export interface Repositories {
  accessRequest: AccessRequestRepository;
  contact: ContactRepository;
  identityProvider: IdentityProviderRepository;
  initiative: InitiativeRepository;
  user: UserRepository;

  // yars
  group: GroupRepository;
  groupRolePolicyVw: GroupRolePolicyVwRepository;
  policyAttribute: PolicyAttributeRepository;
  subjectGroup: SubjectGroupRepository;
}

interface TxOpts {
  isolationLevel?: Prisma.TransactionIsolationLevel;
  maxWait?: number;
  timeout?: number;
}
class UnitOfWork {
  private prisma: PrismaClientType;

  constructor(prisma: PrismaClientType) {
    this.prisma = prisma;
  }

  async execute<T>(
    fn: (repos: Repositories) => Promise<T>,
    principal: string = SYSTEM_ID,
    opts: TxOpts = {}
  ): Promise<T> {
    const { isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted, maxWait = 2000, timeout = 10000 } = opts;

    return this.prisma.$transaction(
      async (tx) => {
        const repos: Repositories = {
          accessRequest: AccessRequestRepository.create(tx, principal),
          contact: ContactRepository.create(tx, principal),
          identityProvider: IdentityProviderRepository.create(tx, principal),
          initiative: InitiativeRepository.create(tx, principal),
          user: UserRepository.create(tx, principal),

          // yars
          group: GroupRepository.create(tx, principal),
          groupRolePolicyVw: GroupRolePolicyVwRepository.create(tx),
          policyAttribute: PolicyAttributeRepository.create(tx, principal),
          subjectGroup: SubjectGroupRepository.create(tx, principal)
        };

        return fn(repos);
      },
      { isolationLevel, maxWait, timeout }
    );
  }
}

export const unitOfWork = new UnitOfWork(prisma);
