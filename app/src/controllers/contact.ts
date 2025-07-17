import { Prisma } from '@prisma/client';

import { deleteContact, getContact, matchContacts, searchContacts, upsertContacts } from '../services/contact';
import { addDashesToUuid, isTruthy, mixedQueryToArray } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { Contact, ContactSearchParameters } from '../types';

export const deleteContactController = async (
  req: Request<{ contactId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = req.params.contactId;
    await deleteContact(contactId);

    res.status(204).end();
  } catch (e: unknown) {
    // TODO: Handle Prisma errors at app level
    // P2025 is thrown when a record is not found, https://www.prisma.io/docs/orm/reference/error-reference#p2025
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ message: 'Contact not found' });
    } else {
      next(e);
    }
  }
};

export const getContactController = async (
  req: Request<{ contactId: string }, never, never, { includeActivities?: boolean }>,
  res: Response
) => {
  const contactId = req.params.contactId;
  const includeActivities = isTruthy(req.query.includeActivities) ?? false;
  const response = await getContact(contactId, includeActivities);
  res.status(200).json(response);
};

// Get current user's contact information
export const getCurrentUserContactController = async (req: Request<never, never, never, never>, res: Response) => {
  const response = await searchContacts({
    userId: [req.currentContext.userId as string]
  });
  res.status(200).json(response[0]);
};

export const matchContactsController = async (
  req: Request<never, never, ContactSearchParameters, never>,
  res: Response
) => {
  const response = await matchContacts(req.body);
  res.status(200).json(response);
};

export const searchContactsController = async (
  req: Request<never, never, never, ContactSearchParameters>,
  res: Response
) => {
  const contactIds = mixedQueryToArray(req.query.contactId);
  const userIds = mixedQueryToArray(req.query.userId);
  const response = await searchContacts({
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
  res.status(200).json(response);
};

export const updateContactController = async (req: Request<never, never, Contact, never>, res: Response) => {
  const response = await upsertContacts([req.body], req.currentContext);
  res.status(200).json(response);
};
