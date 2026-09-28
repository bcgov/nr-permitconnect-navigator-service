import express from 'express';
import { z } from 'zod';

import { openapiRoute } from './openapiRoute.ts';
import {
  getElectrificationProjectPermitDataController,
  getGeneralProjectPermitDataController,
  getHousingProjectPermitDataController
} from '#src/controllers/reporting';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { UNAUTHORIZED_RESPONSE, FORBIDDEN_RESPONSE } from '#src/schemas/response/problem';
import { housingReportingPermitDataSchema, reportingPermitDataSchema } from '#src/schemas/response/reportingPermitData';

const basePath = '/reporting';
const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

openapiRoute(basePath, router, {
  method: 'get',
  path: '/electrification-project/permit',
  summary: 'Get all electrification project and permit data for csv download',
  tags: ['Reporting'],
  responses: {
    200: { description: 'Electrification project permit report rows', schema: z.array(reportingPermitDataSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.REPORTING, Action.READ)],
  handler: getElectrificationProjectPermitDataController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/general-project/permit',
  summary: 'Get all general project and permit data for csv download',
  tags: ['Reporting'],
  responses: {
    200: { description: 'General project permit report rows', schema: z.array(reportingPermitDataSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.REPORTING, Action.READ)],
  handler: getGeneralProjectPermitDataController
});

openapiRoute(basePath, router, {
  method: 'get',
  path: '/housing-project/permit',
  summary: 'Get all housing project and permit data for csv download',
  tags: ['Reporting'],
  responses: {
    200: { description: 'Housing project permit report rows', schema: z.array(housingReportingPermitDataSchema) },
    401: UNAUTHORIZED_RESPONSE,
    403: FORBIDDEN_RESPONSE
  },
  middleware: [hasAuthorization(Resource.REPORTING, Action.READ)],
  handler: getHousingProjectPermitDataController
});

export default router;
