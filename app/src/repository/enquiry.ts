import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import { EnquirySearchParameters } from '../types/stuff';
import { Initiative } from '../utils/enums/application.ts';

export class EnquiryRepository extends WritableRepository<PrismaTransactionClient['enquiry']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.enquiry, principal, true);
  }

  public async search(params: EnquirySearchParameters, initiative: Initiative) {
    return await this.model.findMany({
      where: {
        AND: [
          {
            activity: {
              initiative: {
                code: initiative !== Initiative.PCNS ? initiative : undefined
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
