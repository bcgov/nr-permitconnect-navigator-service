import express from 'express';
import request from 'supertest';

import { TEST_ACTIVITY_CONTACT_1 } from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import {
  createActivityContactController,
  deleteActivityContactController,
  listActivityContactController,
  updateActivityContactController
} from '../../../src/controllers/activityContact';
import * as activityContactService from '../../../src/services/activityContact';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon';

let app: express.Express;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.get('/activity/:activityId/contact', listActivityContactController);
  app.delete('/activity/:activityId/contact/:contactId', deleteActivityContactController);
  app.post('/activity/:activityId/contact/:contactId', createActivityContactController);
  app.put('/activity/:activityId/contact/:contactId', updateActivityContactController);
});

describe('GET /activity/:activityId/contact', () => {
  const listActivityContactsSpy = jest.spyOn(activityContactService, 'listActivityContacts');

  it('should call services and respond with 200 and result', async () => {
    listActivityContactsSpy.mockResolvedValue([TEST_ACTIVITY_CONTACT_1]);

    const res = await request(app).get(`/activity/${TEST_ACTIVITY_CONTACT_1.activityId}/contact`).expect(200);

    expect(listActivityContactsSpy).toHaveBeenCalledTimes(1);
    expect(listActivityContactsSpy).toHaveBeenCalledWith(prismaTxMock, TEST_ACTIVITY_CONTACT_1.activityId);
    expect(res.body).toEqual([TEST_ACTIVITY_CONTACT_1]);
  });
});

describe('DELETE /activity/:activityId/contact/:contactId', () => {
  const deleteActivityContactSpy = jest.spyOn(activityContactService, 'deleteActivityContact');
  const getActivityContactSpy = jest.spyOn(activityContactService, 'getActivityContact');

  it('should call services and respond with 204', async () => {
    deleteActivityContactSpy.mockResolvedValue();
    getActivityContactSpy.mockResolvedValue({ ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.MEMBER });

    await request(app)
      .delete(`/activity/${TEST_ACTIVITY_CONTACT_1.activityId}/contact/${TEST_ACTIVITY_CONTACT_1.contactId}`)
      .expect(204);

    expect(getActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(getActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId
    );
    expect(deleteActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(deleteActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId
    );
  });

  it('should check for PRIMARY and halt, respond 403', async () => {
    getActivityContactSpy.mockResolvedValue(TEST_ACTIVITY_CONTACT_1);

    await request(app)
      .delete(`/activity/${TEST_ACTIVITY_CONTACT_1.activityId}/contact/${TEST_ACTIVITY_CONTACT_1.contactId}`)
      .expect(403);

    expect(getActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(getActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId
    );
    expect(deleteActivityContactSpy).not.toHaveBeenCalled();
  });
});

describe('POST /activity/:activityId/contact/:contactId', () => {
  const createActivityContactSpy = jest.spyOn(activityContactService, 'createActivityContact');

  it('should call services and respond with 201 and result', async () => {
    createActivityContactSpy.mockResolvedValue(TEST_ACTIVITY_CONTACT_1);

    const res = await request(app)
      .post(`/activity/${TEST_ACTIVITY_CONTACT_1.activityId}/contact/${TEST_ACTIVITY_CONTACT_1.contactId}`)
      .send({ role: TEST_ACTIVITY_CONTACT_1.role })
      .expect(201);

    expect(createActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(createActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId,
      TEST_ACTIVITY_CONTACT_1.role
    );
    expect(res.body).toEqual(TEST_ACTIVITY_CONTACT_1);
  });
});

describe('PUT /activity/:activityId/contact/:contactId', () => {
  const updateActivityContactSpy = jest.spyOn(activityContactService, 'updateActivityContact');
  const getActivityContactSpy = jest.spyOn(activityContactService, 'getActivityContact');

  it('should call services and respond with 200', async () => {
    updateActivityContactSpy.mockResolvedValue({ ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.ADMIN });
    getActivityContactSpy.mockResolvedValue({ ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.MEMBER });

    const res = await request(app)
      .put(`/activity/${TEST_ACTIVITY_CONTACT_1.activityId}/contact/${TEST_ACTIVITY_CONTACT_1.contactId}`)
      .send({ role: ActivityContactRole.ADMIN })
      .expect(200);

    expect(getActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(getActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId
    );
    expect(updateActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(updateActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId,
      ActivityContactRole.ADMIN
    );
    expect(res.body).toEqual({ ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.ADMIN });
  });

  it('should check for PRIMARY and halt, respond 403', async () => {
    getActivityContactSpy.mockResolvedValue(TEST_ACTIVITY_CONTACT_1);

    await request(app)
      .put(`/activity/${TEST_ACTIVITY_CONTACT_1.activityId}/contact/${TEST_ACTIVITY_CONTACT_1.contactId}`)
      .expect(403);

    expect(getActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(getActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId
    );
    expect(updateActivityContactSpy).not.toHaveBeenCalled();
  });
});
