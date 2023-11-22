import { chefsService } from '../services';
import { isTruthy } from '../components/utils';
import { IdentityProvider } from '../components/constants';

import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';

const controller = {
  exportSubmissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.exportSubmissions(req.params.formId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getFormSubmissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.getFormSubmissions(req.params.formId);

      // IDIR users should be able to see all submissions
      const filterToUser = (req.currentUser?.tokenPayload as JwtPayload).identity_provider !== IdentityProvider.IDIR;

      if (isTruthy(filterToUser)) {
        res
          .status(200)
          .send(
            response.filter(
              (x: { createdBy: string }) =>
                x.createdBy.toUpperCase().substring(0, x.createdBy.indexOf('@idir')) ===
                (req.currentUser?.tokenPayload as JwtPayload).idir_username.toUpperCase()
            )
          );
      } else {
        res.status(200).send(response);
      }
    } catch (e: unknown) {
      next(e);
    }
  },

  getPublishedVersion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.getPublishedVersion(req.params.formId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getSubmission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.getSubmission(req.params.formSubmissionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getVersion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.getVersion(req.params.formId, req.params.versionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getVersionFields: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.getVersionFields(req.params.formId, req.params.versionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getVersionSubmissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.getVersionSubmissions(req.params.formId, req.params.versionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
