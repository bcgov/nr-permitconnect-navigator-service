import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { generateUpdateStamps } from '../db/utils/utils.ts';
import { deleteContact, getContact, matchContacts, searchContacts, upsertContacts } from '../services/contact.ts';
import { addDashesToUuid, isTruthy, mixedQueryToArray } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Contact, ContactSearchParameters } from '../types/index.ts';

export const deleteContactController = async (req: Request<{ contactId: string }>, res: Response) => {
  const contactId = req.params.contactId;
  await transactionWrapper(async (tx: PrismaTransactionClient) => {
    await deleteContact(tx, contactId);
  });
  res.status(204).end();
};

export const getContactController = async (
  req: Request<{ contactId: string }, never, never, { includeActivities?: boolean }>,
  res: Response
) => {
  const response = await transactionWrapper<Contact>(async (tx: PrismaTransactionClient) => {
    const contactId = req.params.contactId;
    const includeActivities = isTruthy(req.query.includeActivities) ?? false;
    return await getContact(tx, contactId, includeActivities);
  });
  res.status(200).json(response);
};

// Get current user's contact information
export const getCurrentUserContactController = async (req: Request<never, never, never, never>, res: Response) => {
  const response = await transactionWrapper<Contact[]>(async (tx: PrismaTransactionClient) => {
    return await searchContacts(tx, {
      userId: [req.currentContext.userId!]
    });
  });
  res.status(200).json(response[0]);
};

export const matchContactsController = async (
  req: Request<never, never, ContactSearchParameters, never>,
  res: Response
) => {
  const response = await transactionWrapper<Contact[]>(async (tx: PrismaTransactionClient) => {
    return await matchContacts(tx, req.body);
  });
  res.status(200).json(response);
};

export const searchContactsController = async (
  req: Request<never, never, never, ContactSearchParameters>,
  res: Response
) => {
  const contactIds = mixedQueryToArray(req.query.contactId);
  const userIds = mixedQueryToArray(req.query.userId);
  const response = await transactionWrapper<Contact[]>(async (tx: PrismaTransactionClient) => {
    return await searchContacts(tx, {
      userId: userIds ? userIds.map((id) => addDashesToUuid(id)) : userIds,
      contactId: contactIds ? contactIds.map((id) => addDashesToUuid(id)) : contactIds,
      email: req.query.email,
      firstName: req.query.firstName,
      lastName: req.query.lastName,
      contactApplicantRelationship: req.query.contactApplicantRelationship,
      phoneNumber: req.query.phoneNumber,
      initiative: req.query.initiative,
      includeActivities: isTruthy(req.query.includeActivities)
    });
  });
  res.status(200).json(response);
};

export const upsertContactController = async (req: Request<never, never, Contact, never>, res: Response) => {
  const contact = { ...req.body, contactId: req.body.contactId ?? uuidv4() };
  const response = await transactionWrapper<Contact[]>(async (tx: PrismaTransactionClient) => {
    return await upsertContacts(tx, [{ ...contact, ...generateUpdateStamps(req.currentContext) }]);
  });
  res.status(200).json(response[0]);
};
