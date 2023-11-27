import config from 'config';

import { chefsService } from '../services';
import { isTruthy } from '../components/utils';
import { IdentityProvider } from '../components/constants';

import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import type { ChefsFormConfig, ChefsFormConfigData } from '../types/ChefsFormConfig';
import type { ChefsSubmissionDataSource } from '../types/ChefsSubmissionDataSource';

const controller = {
  getSubmissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cfg = config.get('server.chefs.forms') as ChefsFormConfig;
      let formData = new Array<ChefsSubmissionDataSource>();

      await Promise.all(
        Object.values<ChefsFormConfigData>(cfg).map(async (x: ChefsFormConfigData) => {
          const data = await chefsService.getFormSubmissions(x.formId);
          formData = formData.concat(data);
        })
      );

      /*
       * Filter Data source
       * IDIR users should be able to see all submissions
       * BCeID/Business should only see their own submissions
       */
      const filterData = (data: Array<ChefsSubmissionDataSource>) => {
        const filterToUser = (req.currentUser?.tokenPayload as JwtPayload).identity_provider !== IdentityProvider.IDIR;

        if (isTruthy(filterToUser)) {
          return data.filter(
            (x: { createdBy: string }) =>
              x.createdBy.toUpperCase().substring(0, x.createdBy.indexOf('@')) ===
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
  }
};

export default controller;
