import express from 'express';
import request from 'supertest';

import { housingProjectValidator } from '../../../src/validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

function buildApp() {
  const app = express();
  app.use(express.json());

  app.post('/', housingProjectValidator.createHousingProject, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );
  app.post('/draft/submit', housingProjectValidator.submitHousingProjectDraft, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );
  app.patch('/:housingProjectId', housingProjectValidator.patchHousingProject, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });

  return app;
}

const validParams = '/5183f223-526a-44cf-8b6a-80f90c4e802b';

describe('createHousingProject validator', () => {
  const app = buildApp();

  it('accepts an empty body', async () => {
    const res = await request(app).post('/').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('rejects unrecognized fields', async () => {
    const res = await request(app).post('/').send({ notARealField: true });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/Unrecognized key\(s\) in object: 'notARealField'/);
  });
});

describe('submitHousingProjectDraft validator', () => {
  const app = buildApp();

  const validContact = {
    contactId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    email: 'test@example.com',
    firstName: 'Jane',
    phoneNumber: '778-555-1234',
    contactApplicantRelationship: 'Property owner',
    contactPreference: 'Email'
  };
  const validHousing = {
    financiallySupportedBc: 'No',
    financiallySupportedIndigenous: 'No',
    financiallySupportedNonProfit: 'No',
    financiallySupportedHousingCoop: 'No',
    hasRentalUnits: 'No',
    singleFamilySelected: true,
    singleFamilyUnits: '1-9'
  };
  const validLocation = {
    naturalDisaster: 'No',
    projectLocation: 'Location coordinates',
    latitude: 49,
    longitude: -123
  };
  const validPermits = { hasAppliedProvincialPermits: 'No' };

  function validBody(basic: Record<string, unknown>) {
    return {
      contact: validContact,
      basic,
      housing: validHousing,
      location: validLocation,
      permits: validPermits
    };
  }

  it('requires registeredName when projectApplicantType is Business', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send(
        validBody({
          consentToFeedback: true,
          projectApplicantType: 'Business',
          projectName: 'Test Project',
          projectDescription: 'Desc'
        })
      );
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"registeredName" is required/);
  });

  it('passes when projectApplicantType is Business and registeredName is provided', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send(
        validBody({
          consentToFeedback: true,
          projectApplicantType: 'Business',
          projectName: 'Test Project',
          projectDescription: 'Desc',
          registeredName: 'Acme'
        })
      );
    expect(res.status).toBe(200);
  });

  it('does not require registeredName when projectApplicantType is Individual', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send(
        validBody({
          consentToFeedback: true,
          projectApplicantType: 'Individual',
          projectName: 'Test Project',
          projectDescription: 'Desc'
        })
      );
    expect(res.status).toBe(200);
  });

  it('requires basic, contact, housing, location, and permits', async () => {
    const res = await request(app).post('/draft/submit').send({});
    expect(res.status).toBe(422);
  });

  it('requires contactId on contact', async () => {
    const contactWithoutId: Record<string, unknown> = { ...validContact };
    delete contactWithoutId.contactId;
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: contactWithoutId,
        basic: {
          consentToFeedback: true,
          projectApplicantType: 'Individual',
          projectName: 'Test Project',
          projectDescription: 'Desc'
        },
        housing: validHousing,
        location: validLocation,
        permits: validPermits
      });
    expect(res.status).toBe(422);
  });

  it('requires contactPreference on contact', async () => {
    const contactWithoutPreference: Record<string, unknown> = { ...validContact };
    delete contactWithoutPreference.contactPreference;
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: contactWithoutPreference,
        basic: {
          consentToFeedback: true,
          projectApplicantType: 'Individual',
          projectName: 'Test Project',
          projectDescription: 'Desc'
        },
        housing: validHousing,
        location: validLocation,
        permits: validPermits
      });
    expect(res.status).toBe(422);
  });

  it('rejects unrecognized fields on contact', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: { ...validContact, notARealField: true },
        basic: {
          consentToFeedback: true,
          projectApplicantType: 'Individual',
          projectName: 'Test Project',
          projectDescription: 'Desc'
        },
        housing: validHousing,
        location: validLocation,
        permits: validPermits
      });
    expect(res.status).toBe(422);
  });
});

describe('patchHousingProject validator', () => {
  const app = buildApp();

  it('passes with an empty body', async () => {
    const res = await request(app).patch(validParams).send({});
    expect(res.status).toBe(200);
  });

  it('passes with a single partial field', async () => {
    const res = await request(app).patch(validParams).send({ projectName: 'Updated Name' });
    expect(res.status).toBe(200);
  });

  it('accepts naturalDisaster as a boolean', async () => {
    const res = await request(app).patch(validParams).send({ naturalDisaster: true });
    expect(res.status).toBe(200);
  });

  it('rejects naturalDisaster as a string', async () => {
    const res = await request(app).patch(validParams).send({ naturalDisaster: 'No' });
    expect(res.status).toBe(422);
  });

  it('still enforces otherUnits when otherUnitsDescription is Yes', async () => {
    const res = await request(app).patch(validParams).send({ otherUnitsDescription: 'Yes' });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"otherUnits" is required/);
  });

  it('still enforces rentalUnits when hasRentalUnits is Yes', async () => {
    const res = await request(app).patch(validParams).send({ hasRentalUnits: 'Yes' });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"rentalUnits" is required/);
  });

  it('still enforces indigenousDescription when financiallySupportedIndigenous is Yes', async () => {
    const res = await request(app).patch(validParams).send({ financiallySupportedIndigenous: 'Yes' });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"indigenousDescription" is required/);
  });

  it('still enforces nonProfitDescription when financiallySupportedNonProfit is Yes', async () => {
    const res = await request(app).patch(validParams).send({ financiallySupportedNonProfit: 'Yes' });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"nonProfitDescription" is required/);
  });

  it('still enforces housingCoopDescription when financiallySupportedHousingCoop is Yes', async () => {
    const res = await request(app).patch(validParams).send({ financiallySupportedHousingCoop: 'Yes' });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"housingCoopDescription" is required/);
  });

  it('rejects fields not in the patchable schema', async () => {
    const res = await request(app).patch(validParams).send({ notARealField: true });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/Unrecognized key\(s\) in object: 'notARealField'/);
  });
});
