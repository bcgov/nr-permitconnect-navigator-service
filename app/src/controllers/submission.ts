import config from 'config';
import { NIL } from 'uuid';

import { submissionService, userService } from '../services';
import { addDashesToUuid, getCurrentIdentity, isTruthy } from '../components/utils';
import { IdentityProvider } from '../components/constants';

import type { JwtPayload } from 'jsonwebtoken';
import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { ChefsFormConfig, ChefsFormConfigData, Submission, ChefsSubmissionExport } from '../types';

const controller = {
  getFormExport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cfg = config.get('server.chefs.forms') as ChefsFormConfig;

      const exportData: Array<Partial<Submission & { formId: string }>> = await Promise.all(
        Object.values<ChefsFormConfigData>(cfg).map(async (x: ChefsFormConfigData) => {
          return (await submissionService.getFormExport(x.id)).map((data: ChefsSubmissionExport) => {
            const financiallySupportedValues = {
              financiallySupportedBC: isTruthy(data.isBCHousingSupported),
              financiallySupportedIndigenous: isTruthy(data.isIndigenousHousingProviderSupported),
              financiallySupportedNonProfit: isTruthy(data.isNonProfitSupported),
              financiallySupportedHousingCoop: isTruthy(data.isHousingCooperativeSupported)
            };

            return {
              formId: x.id,
              submissionId: data.form.submissionId,
              companyNameRegistered: data.companyNameRegistered,
              activityId: data.form.confirmationId,
              contactEmail: data.contactEmail,
              contactPhoneNumber: data.contactPhoneNumber,
              contactName: `${data.contactFirstName} ${data.contactLastName}`,
              financiallySupported: Object.values(financiallySupportedValues).includes(true),
              ...financiallySupportedValues,
              intakeStatus: data.form.status,
              latitude: data.latitude,
              longitude: data.longitude,
              naturalDisaster: data.naturalDisasterInd,
              projectName: data.projectName,
              queuePriority: data.queuePriority,
              singleFamilyUnits: data.singleFamilyUnits ?? data.multiFamilyUnits,
              streetAddress: data.streetAddress,
              submittedAt: data.form.createdAt,
              submittedBy: data.form.username
            };
          });
        })
      ).then((x) => x.filter((y) => y.length).flat());

      // Get a list of all submission IDs
      const result = await submissionService.searchSubmissions({
        submissionId: exportData.map((x) => x.submissionId as string)
      });

      // Overwrite export data with application data where possible
      const mergedExportData = exportData.map((x: Partial<Submission & { formId: string }>) => ({
        ...x,
        ...result.find((y) => y?.submissionId === x.submissionId)
      }));

      /*
       * Filter Data source
       * IDIR users should be able to see all submissions
       * BCeID/Business should only see their own submissions
       */
      const filterData = (data: Array<Partial<Submission & { formId: string }>>) => {
        const tokenPayload = req.currentUser?.tokenPayload as JwtPayload;
        const filterToUser = tokenPayload && tokenPayload.identity_provider !== IdentityProvider.IDIR;

        if (isTruthy(filterToUser)) {
          return data.filter(
            (x: Partial<Submission>) =>
              x.submittedBy?.toUpperCase().substring(0, x.submittedBy.indexOf('@')) ===
              (req.currentUser?.tokenPayload as JwtPayload).bceid_username.toUpperCase()
          );
        } else {
          return data;
        }
      };

      res.status(200).send(filterData(mergedExportData));
    } catch (e: unknown) {
      next(e);
    }
  },

  getStatistics: async (
    req: Request<never, { dateFrom: string; dateTo: string; monthYear: string; userId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await submissionService.getStatistics(req.query);
      res.status(200).send(response[0]);
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
      const response = await submissionService.getSubmission(
        addDashesToUuid(req.query.formId),
        req.params.submissionId
      );
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updateSubmission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentUser, NIL), NIL);
      const response = await submissionService.updateSubmission({ ...(req.body as Submission), updatedBy: userId });
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
