import config from 'config';

import { chefsService } from '../services';
import { addDashesToUuid, isTruthy } from '../components/utils';
import { IdentityProvider } from '../components/constants';

import type { JwtPayload } from 'jsonwebtoken';
import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { ChefsFormConfig, ChefsFormConfigData, ChefsSubmissionForm, ChefsSubmissionFormExport } from '../types';

const controller = {
  getFormExport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cfg = config.get('server.chefs.forms') as ChefsFormConfig;
      let exportData = new Array<Partial<ChefsSubmissionForm & { formId: string }>>();

      // Get CHEFS export of all form data, converted to a modified ChefsSubmissionForm type
      await Promise.all(
        Object.values<ChefsFormConfigData>(cfg).map(async (x: ChefsFormConfigData) => {
          const data = await chefsService.getFormExport(x.id);

          data.forEach((d: ChefsSubmissionFormExport) => {
            const financiallySupportedValues = {
              financiallySupportedBC: isTruthy(d.isBCHousingSupported),
              financiallySupportedIndigenous: isTruthy(d.isIndigenousHousingProviderSupported),
              financiallySupportedNonProfit: isTruthy(d.isNonProfitSupported),
              financiallySupportedHousingCoop: isTruthy(d.isHousingCooperativeSupported)
            };

            exportData.push({
              formId: x.id,
              submissionId: d.form.submissionId,
              confirmationId: d.form.confirmationId,
              contactEmail: d.contactEmail,
              contactPhoneNumber: d.contactPhoneNumber,
              contactName: `${d.contactFirstName} ${d.contactLastName}`,
              financiallySupported: Object.values(financiallySupportedValues).includes(true),
              ...financiallySupportedValues,
              intakeStatus: d.form.status,
              latitude: d.latitude,
              longitude: d.longitude,
              naturalDisaster: d.naturalDisasterInd,
              projectName: d.companyNameRegistered,
              queuePriority: d.queuePriority,
              singleFamilyUnits: d.singleFamilyUnits ?? d.multiFamilyUnits,
              streetAddress: d.streetAddress,
              submittedAt: d.form.createdAt,
              submittedBy: d.form.username
            });
          });
        })
      );

      // Get a list of all submission IDs
      const result = await chefsService.searchSubmissions({
        submissionId: exportData.map((x) => x.submissionId as string)
      });

      // Overwrite export data with application data where possible
      exportData = exportData.map((x: Partial<ChefsSubmissionForm & { formId: string }>) => {
        return {
          ...x,
          ...result.find((y) => y?.submissionId === x.submissionId)
        };
      });

      /*
       * Filter Data source
       * IDIR users should be able to see all submissions
       * BCeID/Business should only see their own submissions
       */
      const filterData = (data: Array<Partial<ChefsSubmissionForm & { formId: string }>>) => {
        const tokenPayload = req.currentUser?.tokenPayload as JwtPayload;
        const filterToUser = tokenPayload && tokenPayload.identity_provider !== IdentityProvider.IDIR;

        if (isTruthy(filterToUser)) {
          return data.filter(
            (x: Partial<ChefsSubmissionForm>) =>
              x.submittedBy?.toUpperCase().substring(0, x.submittedBy.indexOf('@')) ===
              (req.currentUser?.tokenPayload as JwtPayload).bceid_username.toUpperCase()
          );
        } else {
          return data;
        }
      };

      res.status(200).send(filterData(exportData));
    } catch (e: unknown) {
      next(e);
    }
  },

  getSubmission: async (
    req: Request<{ submissionId: string }, { formId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await chefsService.getSubmission(addDashesToUuid(req.query.formId), req.params.submissionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateSubmission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await chefsService.updateSubmission(req.body);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
