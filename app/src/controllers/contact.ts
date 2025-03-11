import { contactService } from '../services';
import { addDashesToUuid, isTruthy, mixedQueryToArray } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { Contact, ContactSearchParameters } from '../types';

const controller = {
  getContact: async (
    req: Request<{ contactId: string }, never, never, { includeActivities?: boolean }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const contactId = req.params.contactId;
      const includeActivities = isTruthy(req.query.includeActivities) ?? false;
      const response = await contactService.getContact(contactId, includeActivities);

      if (!response) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  // Get current user's contact information
  getCurrentUserContact: async (req: Request<never, never, never, never>, res: Response, next: NextFunction) => {
    try {
      const response = await contactService.searchContacts({
        userId: [req.currentContext.userId as string]
      });
      res.status(200).json(response[0]);
    } catch (e: unknown) {
      next(e);
    }
  },

  searchContacts: async (
    req: Request<never, never, never, ContactSearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const contactIds = mixedQueryToArray(req.query.contactId);
      const userIds = mixedQueryToArray(req.query.userId);
      const response = await contactService.searchContacts({
        userId: userIds ? userIds.map((id) => addDashesToUuid(id)) : userIds,
        contactId: contactIds ? contactIds.map((id) => addDashesToUuid(id)) : contactIds,
        email: req.query.email,
        firstName: req.query.firstName,
        lastName: req.query.lastName,
        contactApplicantRelationship: req.query.contactApplicantRelationship,
        phoneNumber: req.query.phoneNumber
      });
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateContact: async (req: Request<never, never, Contact, never>, res: Response, next: NextFunction) => {
    try {
      const response = await contactService.upsertContacts([req.body], req.currentContext);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
