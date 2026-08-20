import { WritableRepository } from './writable.ts';
import { Initiative } from '../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { SearchEnquiriesRequest } from '../types/index.ts';

export class EnquiryRepository extends WritableRepository<PrismaTransactionClient['enquiry']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.enquiry, principal, true);
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
