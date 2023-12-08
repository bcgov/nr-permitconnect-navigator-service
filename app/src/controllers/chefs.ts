import config from 'config';

import { chefsService } from '../services';
import { isTruthy } from '../components/utils';
import { IdentityProvider } from '../components/constants';

import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import type { ChefsFormConfig, ChefsFormConfigData } from '../types/ChefsFormConfig';
import type { ChefsSubmissionDataSource } from '../types/ChefsSubmissionDataSource';

const controller = {
  getFormExport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cfg = config.get('server.chefs.forms') as ChefsFormConfig;
      let formData = new Array<ChefsSubmissionDataSource>();

      // Get a JSON export of all form data merged into a single array
      await Promise.all(
        Object.values<ChefsFormConfigData>(cfg).map(async (x: ChefsFormConfigData) => {
          const data = await chefsService.getFormExport(x.id);
          data.forEach((d: ChefsSubmissionDataSource) => (d.form.id = x.id));
          formData = formData.concat(data);
        })
      );

      /*
       * Filter Data source
       * IDIR users should be able to see all submissions
       * BCeID/Business should only see their own submissions
       */
      const filterData = (data: Array<ChefsSubmissionDataSource>) => {
        const tokenPayload = req.currentUser?.tokenPayload as JwtPayload;
        const filterToUser = tokenPayload && tokenPayload.identity_provider !== IdentityProvider.IDIR;

        if (isTruthy(filterToUser)) {
          return data.filter(
            (x: { form: { username: string } }) =>
              x.form.username.toUpperCase().substring(0, x.form.username.indexOf('@')) ===
              (req.currentUser?.tokenPayload as JwtPayload).bceid_username.toUpperCase()
          );
        } else {
          return data;
        }
      };

      res.status(200).send(filterData(formData));
    } catch (e: unknown) {
      next(e);
    }
  },

  getSubmission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.getSubmission(req.query.formId as string, req.params.formSubmissionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getSubmissionStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.getSubmissionStatus(req.query.formId as string, req.params.formSubmissionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateSubmission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.updateSubmission(
        req.query.formId as string,
        req.params.formSubmissionId,
        req.body
      );
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
