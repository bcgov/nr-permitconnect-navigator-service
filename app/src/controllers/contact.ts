import { v4 as uuidv4 } from 'uuid';

import {
  deleteContactService,
  getContactService,
  matchContactsService,
  matchContactsExactService,
  searchContactsService,
  upsertContactsService
} from '../services/contact.ts';
import { IdentityProviderKind } from '../utils/enums/application.ts';
import { addDashesToUuid, hasIdentity, isTruthy, mixedQueryToArray } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type { Contact, ContactSearchParameters, LocalContext } from '../types/index.ts';

export const deleteContactController = async (
  req: Request<{ contactId: string }>,
  res: Response<never, LocalContext>
) => {
  await deleteContactService(req.params.contactId, res.locals.currentContext.userId);
  res.status(204).end();
};

export const getContactController = async (
  req: Request<{ contactId: string }, never, never, { includeActivities?: boolean }>,
  res: Response<Contact>
) => {
  const response = await getContactService(req.params.contactId, isTruthy(req.query.includeActivities) ?? false);
  res.status(200).json(response);
};

// Get current user's contact information
export const getCurrentUserContactController = async (req: Request, res: Response<Contact, LocalContext>) => {
  const response = await searchContactsService({
    userId: [res.locals.currentContext.userId!]
  });
  res.status(200).json(response[0]);
};

export const matchContactsController = async (
  req: Request<never, never, ContactSearchParameters, never>,
  res: Response<Contact[], LocalContext>
) => {
  let response: Contact[];
  if (hasIdentity(IdentityProviderKind.AZUREIDIR, res.locals.currentContext))
    response = await matchContactsService(req.body);
  else response = await matchContactsExactService(req.body);

  res.status(200).json(response);
};

export const searchContactsController = async (
  req: Request<never, never, ContactSearchParameters | undefined, never>,
  res: Response<Contact[]>
) => {
  const contactIds = mixedQueryToArray(req.body?.contactId);
  const userIds = mixedQueryToArray(req.body?.userId);

  const response = await searchContactsService({
    userId: userIds ? userIds.map((id) => addDashesToUuid(id)) : userIds,
    contactId: contactIds ? contactIds.map((id) => addDashesToUuid(id)) : contactIds,
    email: req.body?.email,
    firstName: req.body?.firstName,
    lastName: req.body?.lastName,
    contactApplicantRelationship: req.body?.contactApplicantRelationship,
    phoneNumber: req.body?.phoneNumber,
    initiative: req.body?.initiative,
    includeActivities: isTruthy(req.body?.includeActivities)
  });

  res.status(200).json(response);
};

export const upsertContactController = async (
  req: Request<never, never, Contact, never>,
  res: Response<Contact, LocalContext>
) => {
  const contact = { ...req.body, contactId: req.body.contactId ?? uuidv4() };
  const response = await upsertContactsService([contact]);
  res.status(200).json(response[0]);
};
