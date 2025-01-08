import { contactService } from '../services';
import { addDashesToUuid, mixedQueryToArray } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { Contact, ContactSearchParameters } from '../types';

const controller = {
  searchContacts: async (
    req: Request<never, never, never, ContactSearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const contactIds = mixedQueryToArray(req.query.contactId);
      let userIds = mixedQueryToArray(req.query.userId);

      if (!userIds && req.currentContext.userId) userIds = [req.currentContext.userId];

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
