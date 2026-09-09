import { randomUUID } from 'node:crypto';

import {
  deleteContactService,
  getContactService,
  matchContactsService,
  matchContactsExactService,
  searchContactsService,
  upsertContactsService
} from '#src/services/contact';
import { IdentityProviderKind } from '#src/utils/enums/application';
import { addDashesToUuid, hasIdentity, mixedQueryToArray } from '#src/utils/utils';

import type { Request, Response } from 'express';
import type {
  Contact,
  GetContactRequest,
  LocalContext,
  MatchContactsRequest,
  SearchContactsRequest,
  UpsertContactRequest
} from '#types';

export const deleteContactController = async (
  req: Request<{ contactId: string }>,
  res: Response<never, LocalContext>
) => {
  await deleteContactService(req.params.contactId);
  res.status(204).end();
};

export const getContactController = async (
  req: Request<{ contactId: string }, never, never, GetContactRequest>,
  res: Response<Contact>
) => {
  const response = await getContactService(req.params.contactId, req.query.includeActivities ?? false);
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
  req: Request<never, never, MatchContactsRequest, never>,
  res: Response<Contact[], LocalContext>
) => {
  const params = {
    contactId: req.body.contactId ?? undefined,
    userId: req.body.userId ?? undefined,
    email: req.body.email ?? undefined,
    firstName: req.body.firstName ?? undefined,
    lastName: req.body.lastName ?? undefined,
    phoneNumber: req.body.phoneNumber ?? undefined
  };

  let response: Contact[];
  if (hasIdentity(IdentityProviderKind.AZUREIDIR, res.locals.currentContext))
    response = await matchContactsService(params);
  else response = await matchContactsExactService(params);

  res.status(200).json(response);
};

export const searchContactsController = async (
  req: Request<never, never, SearchContactsRequest, never>,
  res: Response<Contact[]>
) => {
  const contactIds = mixedQueryToArray(req.body.contactId ?? undefined);
  const userIds = mixedQueryToArray(req.body.userId ?? undefined);

  const response = await searchContactsService({
    userId: userIds ? userIds.map((id) => addDashesToUuid(id)) : userIds,
    contactId: contactIds ? contactIds.map((id) => addDashesToUuid(id)) : contactIds,
    email: req.body.email ?? undefined,
    firstName: req.body.firstName ?? undefined,
    lastName: req.body.lastName ?? undefined,
    contactApplicantRelationship: req.body.contactApplicantRelationship ?? undefined,
    phoneNumber: req.body.phoneNumber ?? undefined,
    initiative: req.body.initiative ?? undefined,
    includeActivities: req.body.includeActivities
  });

  res.status(200).json(response);
};

export const upsertContactController = async (
  req: Request<never, never, UpsertContactRequest, never>,
  res: Response<Contact, LocalContext>
) => {
  const contact = { ...req.body, contactId: req.body.contactId ?? randomUUID() };
  const response = await upsertContactsService([contact]);
  res.status(200).json(response[0]);
};
