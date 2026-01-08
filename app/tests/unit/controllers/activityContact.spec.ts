import config from 'config';
import express from 'express';
import request from 'supertest';

import { TEST_ACTIVITY_CONTACT_1, TEST_CONTACT_1, TEST_CURRENT_CONTEXT, TEST_HOUSING_PROJECT_1 } from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import {
  createActivityContactController,
  deleteActivityContactController,
  listActivityContactController,
  updateActivityContactController
} from '../../../src/controllers/activityContact';
import * as activityContactService from '../../../src/services/activityContact';
import * as activityContactHelpers from '../../../src/services/helpers/activityContact';
import * as contactService from '../../../src/services/contact';
import * as emailService from '../../../src/services/email';
import * as projectService from '../../../src/services/project';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon';

jest.mock('config');
let mockedConfig = config as jest.MockedObjectDeep<typeof config>;

const FAKE_ADMIN_ACTIVITY_CONTACT = {
  ...TEST_ACTIVITY_CONTACT_1,
  contact: TEST_CONTACT_1,
  role: ActivityContactRole.ADMIN
};
const FAKE_MEMBER_ACTIVITY_CONTACT = {
  ...TEST_ACTIVITY_CONTACT_1,
  contact: TEST_CONTACT_1,
  role: ActivityContactRole.MEMBER
};
const FAKE_PRIMARY_ACTIVITY_CONTACT = { ...TEST_ACTIVITY_CONTACT_1, contact: TEST_CONTACT_1 };

const validatePrimaryChangeSpy = jest.spyOn(activityContactHelpers, 'validatePrimaryChange');

let app: express.Express;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.request.currentAuthorization = { attributes: [], groups: [] };
  app.request.currentContext = TEST_CURRENT_CONTEXT;
  app.get('/activity/:activityId/contact', listActivityContactController);
  app.delete('/activity/:activityId/contact/:contactId', deleteActivityContactController);
  app.post('/activity/:activityId/contact/:contactId', createActivityContactController);
  app.put('/activity/:activityId/contact/:contactId', updateActivityContactController);

  mockedConfig = config as jest.MockedObjectDeep<typeof config>;
  mockedConfig.get.mockImplementation(() => 'navEmail@test.com');

  validatePrimaryChangeSpy.mockResolvedValue();
});

afterEach(() => {
  jest.resetAllMocks();
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
  const getProjectByActivityIdSpy = jest.spyOn(projectService, 'getProjectByActivityId');
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const deleteActivityContactSpy = jest.spyOn(activityContactService, 'deleteActivityContact');
  const getActivityContactSpy = jest.spyOn(activityContactService, 'getActivityContact');
  const emailSpy = jest.spyOn(emailService, 'email');

  beforeEach(() => {
    getProjectByActivityIdSpy.mockResolvedValue({
      ...TEST_HOUSING_PROJECT_1
    });
  });

  it('should call services and respond with 204', async () => {
    deleteActivityContactSpy.mockResolvedValue();
    getActivityContactSpy.mockResolvedValue({ ...FAKE_MEMBER_ACTIVITY_CONTACT, role: ActivityContactRole.MEMBER });

    await request(app)
      .delete(`/activity/${FAKE_MEMBER_ACTIVITY_CONTACT.activityId}/contact/${FAKE_MEMBER_ACTIVITY_CONTACT.contactId}`)
      .expect(204);

    expect(getActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      FAKE_MEMBER_ACTIVITY_CONTACT.activityId,
      FAKE_MEMBER_ACTIVITY_CONTACT.contactId
    );
    expect(deleteActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(deleteActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      FAKE_MEMBER_ACTIVITY_CONTACT.activityId,
      FAKE_MEMBER_ACTIVITY_CONTACT.contactId
    );
  });

  it('should send an email on success', async () => {
    deleteActivityContactSpy.mockResolvedValue();
    getActivityContactSpy.mockResolvedValue({ ...FAKE_MEMBER_ACTIVITY_CONTACT, role: ActivityContactRole.MEMBER });

    await request(app)
      .delete(`/activity/${FAKE_MEMBER_ACTIVITY_CONTACT.activityId}/contact/${FAKE_MEMBER_ACTIVITY_CONTACT.contactId}`)
      .expect(204);

    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(getProjectByActivityIdSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledTimes(1);
  });

  it('should check for PRIMARY and halt, respond 403', async () => {
    getActivityContactSpy.mockResolvedValue(FAKE_PRIMARY_ACTIVITY_CONTACT);

    await request(app)
      .delete(
        `/activity/${FAKE_PRIMARY_ACTIVITY_CONTACT.activityId}/contact/${FAKE_PRIMARY_ACTIVITY_CONTACT.contactId}`
      )
      .expect(403);

    expect(getActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(getActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      FAKE_PRIMARY_ACTIVITY_CONTACT.activityId,
      FAKE_PRIMARY_ACTIVITY_CONTACT.contactId
    );
    expect(deleteActivityContactSpy).not.toHaveBeenCalled();
  });
});

describe('POST /activity/:activityId/contact/:contactId', () => {
  const getProjectByActivityIdSpy = jest.spyOn(projectService, 'getProjectByActivityId');
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const createActivityContactSpy = jest.spyOn(activityContactService, 'createActivityContact');
  const emailSpy = jest.spyOn(emailService, 'email');

  beforeEach(() => {
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    getProjectByActivityIdSpy.mockResolvedValue({
      ...TEST_HOUSING_PROJECT_1
    });
  });

  it('should call services and respond with 201 and result', async () => {
    createActivityContactSpy.mockResolvedValue(FAKE_MEMBER_ACTIVITY_CONTACT);

    const res = await request(app)
      .post(`/activity/${FAKE_MEMBER_ACTIVITY_CONTACT.activityId}/contact/${FAKE_MEMBER_ACTIVITY_CONTACT.contactId}`)
      .send({ role: FAKE_MEMBER_ACTIVITY_CONTACT.role })
      .expect(201);

    expect(createActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(createActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      FAKE_MEMBER_ACTIVITY_CONTACT.activityId,
      FAKE_MEMBER_ACTIVITY_CONTACT.contactId,
      FAKE_MEMBER_ACTIVITY_CONTACT.role
    );
    expect(res.body).toEqual(FAKE_MEMBER_ACTIVITY_CONTACT);
  });

  it('should send an email for MEMBER', async () => {
    createActivityContactSpy.mockResolvedValue(FAKE_MEMBER_ACTIVITY_CONTACT);

    await request(app)
      .post(`/activity/${FAKE_MEMBER_ACTIVITY_CONTACT.activityId}/contact/${FAKE_MEMBER_ACTIVITY_CONTACT.contactId}`)
      .send({ role: FAKE_MEMBER_ACTIVITY_CONTACT.role })
      .expect(201);

    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(getProjectByActivityIdSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledTimes(1);
  });

  it('should send an email for ADMIN', async () => {
    createActivityContactSpy.mockResolvedValue(FAKE_ADMIN_ACTIVITY_CONTACT);

    await request(app)
      .post(`/activity/${FAKE_ADMIN_ACTIVITY_CONTACT.activityId}/contact/${FAKE_ADMIN_ACTIVITY_CONTACT.contactId}`)
      .send({ role: FAKE_ADMIN_ACTIVITY_CONTACT.role })
      .expect(201);

    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(getProjectByActivityIdSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledTimes(1);
  });

  it('should not send an email for PRIMARY', async () => {
    createActivityContactSpy.mockResolvedValue(FAKE_PRIMARY_ACTIVITY_CONTACT);

    await request(app)
      .post(`/activity/${FAKE_PRIMARY_ACTIVITY_CONTACT.activityId}/contact/${FAKE_PRIMARY_ACTIVITY_CONTACT.contactId}`)
      .send({ role: FAKE_PRIMARY_ACTIVITY_CONTACT.role })
      .expect(201);

    expect(emailSpy).not.toHaveBeenCalled();
  });
});

describe('PUT /activity/:activityId/contact/:contactId', () => {
  const getProjectByActivityIdSpy = jest.spyOn(projectService, 'getProjectByActivityId');
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const updateActivityContactSpy = jest.spyOn(activityContactService, 'updateActivityContact');
  const getActivityContactSpy = jest.spyOn(activityContactService, 'getActivityContact');
  const emailSpy = jest.spyOn(emailService, 'email');

  beforeEach(() => {
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    getProjectByActivityIdSpy.mockResolvedValue({
      ...TEST_HOUSING_PROJECT_1
    });
  });

  it('should call services and respond with 200', async () => {
    updateActivityContactSpy.mockResolvedValue({ ...FAKE_MEMBER_ACTIVITY_CONTACT, role: ActivityContactRole.ADMIN });
    getActivityContactSpy.mockResolvedValue({ ...FAKE_MEMBER_ACTIVITY_CONTACT, role: ActivityContactRole.MEMBER });

    const res = await request(app)
      .put(`/activity/${FAKE_MEMBER_ACTIVITY_CONTACT.activityId}/contact/${FAKE_MEMBER_ACTIVITY_CONTACT.contactId}`)
      .send({ role: ActivityContactRole.ADMIN })
      .expect(200);

    expect(getActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(getActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      FAKE_MEMBER_ACTIVITY_CONTACT.activityId,
      FAKE_MEMBER_ACTIVITY_CONTACT.contactId
    );
    expect(updateActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(updateActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      FAKE_MEMBER_ACTIVITY_CONTACT.activityId,
      FAKE_MEMBER_ACTIVITY_CONTACT.contactId,
      ActivityContactRole.ADMIN
    );
    expect(res.body).toEqual({ ...FAKE_MEMBER_ACTIVITY_CONTACT, role: ActivityContactRole.ADMIN });
  });

  it('should send an email for ADMIN', async () => {
    updateActivityContactSpy.mockResolvedValue({ ...FAKE_ADMIN_ACTIVITY_CONTACT, role: ActivityContactRole.ADMIN });
    getActivityContactSpy.mockResolvedValue({ ...FAKE_ADMIN_ACTIVITY_CONTACT, role: ActivityContactRole.ADMIN });

    await request(app)
      .put(`/activity/${FAKE_ADMIN_ACTIVITY_CONTACT.activityId}/contact/${FAKE_ADMIN_ACTIVITY_CONTACT.contactId}`)
      .send({ role: FAKE_ADMIN_ACTIVITY_CONTACT.role })
      .expect(200);

    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(getProjectByActivityIdSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledTimes(1);
  });

  it('should not send an email for MEMBER', async () => {
    updateActivityContactSpy.mockResolvedValue({ ...FAKE_MEMBER_ACTIVITY_CONTACT, role: ActivityContactRole.MEMBER });
    getActivityContactSpy.mockResolvedValue({ ...FAKE_MEMBER_ACTIVITY_CONTACT, role: ActivityContactRole.MEMBER });

    await request(app)
      .put(`/activity/${FAKE_MEMBER_ACTIVITY_CONTACT.activityId}/contact/${FAKE_MEMBER_ACTIVITY_CONTACT.contactId}`)
      .send({ role: FAKE_MEMBER_ACTIVITY_CONTACT.role })
      .expect(200);

    expect(emailSpy).not.toHaveBeenCalled();
  });

  it('should check for PRIMARY and halt, respond 403', async () => {
    getActivityContactSpy.mockResolvedValue(FAKE_PRIMARY_ACTIVITY_CONTACT);

    await request(app)
      .put(`/activity/${FAKE_PRIMARY_ACTIVITY_CONTACT.activityId}/contact/${FAKE_PRIMARY_ACTIVITY_CONTACT.contactId}`)
      .expect(403);

    expect(getActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(getActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      FAKE_PRIMARY_ACTIVITY_CONTACT.activityId,
      FAKE_PRIMARY_ACTIVITY_CONTACT.contactId
    );
    expect(updateActivityContactSpy).not.toHaveBeenCalled();
  });
});
