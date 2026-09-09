import { Prisma } from '@prisma/client';

import { WritableRepository } from './writable.ts';
import { Initiative } from '#src/utils/enums/application';

import type { PrismaTransactionClient } from '#src/db/database';
import type { PatchEnquiryRequest, SearchEnquiriesRequest } from '#types';

export class EnquiryRepository extends WritableRepository<PrismaTransactionClient['enquiry']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.enquiry, principal, true);
  }

  public async patch(where: { enquiryId: string }, data: PatchEnquiryRequest) {
    return this.update(where, data as Prisma.enquiryUncheckedUpdateInput);
  }

  public async search(params: SearchEnquiriesRequest, initiativeCode?: Initiative) {
    return await this.findMany({
      where: {
        AND: [
          {
            activity: {
              initiative: {
                code: initiativeCode === Initiative.PCNS ? undefined : initiativeCode
              }
            }
          },
          {
            activityId: { in: params.activityId }
          },
          {
            createdBy: { in: params.createdBy }
          },
          {
            enquiryId: { in: params.enquiryId }
          }
        ]
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            },
            initiative: true
          }
        },
        user: params.includeUser
      }
    });
  }
}
