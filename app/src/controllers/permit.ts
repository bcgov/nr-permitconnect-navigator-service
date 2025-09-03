import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper';
import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import { isTruthy } from '../utils/utils';
import { Initiative } from '../utils/enums/application';
import { deletePermit, getPermit, getPermitTypes, listPermits, upsertPermit } from '../services/permit';
import { deleteManyPermitTracking, upsertPermitTracking } from '../services/permitTracking';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { ListPermitsOptions, Permit, PermitTracking, PermitType } from '../types';

export const deletePermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    await deletePermit(tx, req.params.permitId);
  });
  res.status(204).end();
};

export const getPermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  const response = await transactionWrapper<Permit>(async (tx: PrismaTransactionClient) => {
    return await getPermit(tx, req.params.permitId);
  });
  res.status(200).json(response);
};

export const getPermitTypesController = async (
  req: Request<never, never, never, { initiative: Initiative }>,
  res: Response
) => {
  const response = await transactionWrapper<PermitType[]>(async (tx: PrismaTransactionClient) => {
    return await getPermitTypes(tx, req.query.initiative);
  });
  res.status(200).json(response);
};

export const listPermitsController = async (
  req: Request<never, never, never, Partial<ListPermitsOptions>>,
  res: Response
) => {
  const response = await transactionWrapper<Permit[]>(async (tx: PrismaTransactionClient) => {
    const options: ListPermitsOptions = {
      ...req.query,
      includeNotes: isTruthy(req.query.includeNotes)
    };

    return await listPermits(tx, options);
  });
  res.status(200).json(response);
};

export const upsertPermitController = async (req: Request<never, never, Permit>, res: Response) => {
  const response = await transactionWrapper<Permit>(async (tx: PrismaTransactionClient) => {
    const createStamps = generateCreateStamps(req.currentContext);
    const updateStamps = generateUpdateStamps(req.currentContext);

    // Add permit ID and stamp data if necessary
    const permitData: Permit = {
      ...req.body,
      permitId: req.body.permitId || uuidv4(),
      createdAt: req.body.createdAt ?? createStamps.createdAt,
      createdBy: req.body.createdBy ?? createStamps.createdBy,
      ...updateStamps
    };

    // Add data to tracking IDs if necessary
    permitData.permitTracking?.forEach((x: PermitTracking) => {
      x.permitId = x.permitId ?? permitData.permitId;
      x.shownToProponent = x.shownToProponent ?? false;

      if (x.createdAt && x.createdBy) {
        x.updatedAt = updateStamps.updatedAt;
        x.updatedBy = updateStamps.updatedBy;
      } else {
        x.createdAt = createStamps.createdAt;
        x.createdBy = createStamps.createdBy;
      }
    });

    // Upserting can't have relational information in the data
    const permitUpsertData: Permit = {
      ...permitData,
      permitNote: undefined,
      permitTracking: undefined
    };

    const data = await upsertPermit(tx, permitUpsertData);
    await deleteManyPermitTracking(tx, permitData);
    await upsertPermitTracking(tx, permitData);
    return data;
  });
  res.status(200).json(response);
};
