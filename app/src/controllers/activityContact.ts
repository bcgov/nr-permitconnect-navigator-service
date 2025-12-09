import config from 'config';

import { Problem } from '../utils';
import { transactionWrapper } from '../db/utils/transactionWrapper';
import {
  createActivityContact,
  deleteActivityContact,
  getActivityContact,
  listActivityContacts,
  updateActivityContact
} from '../services/activityContact';
import { searchContacts } from '../services/contact';
import { searchElectrificationProjects } from '../services/electrificationProject';
import { email } from '../services/email';
import { searchHousingProjects } from '../services/housingProject';
import { ActivityContactRole } from '../utils/enums/projectCommon';
import { teamAdminAddedTemplate, teamMemberAddedTemplate, teamMemberRevokedTemplate } from '../utils/templates';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { ActivityContact, Contact } from '../types';

const getTeamMemberEmailTemplateData = async (
  tx: PrismaTransactionClient,
  currentUserId: string | undefined,
  activityId: string,
  contact: Contact
) => {
  let adminContact: Contact[] = [];
  if (currentUserId) {
    adminContact = await searchContacts(tx, {
      userId: [currentUserId]
    });
  }

  const hp = await searchHousingProjects(tx, { activityId: [activityId] });
  const ep = await searchElectrificationProjects(tx, { activityId: [activityId] });
  const projectName = hp[0]?.projectName ?? ep[0]?.projectName ?? '';

  const templateParams = {
    dearName: `${contact.firstName} ${contact.lastName}`,
    adminName: adminContact?.length ? `${adminContact[0].firstName} ${adminContact[0].lastName}` : undefined,
    projectName
  };

  const navEmail = config.get('server.pcns.navEmail') as string;

  return { templateParams, navEmail };
};

export const createActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>,
  res: Response
) => {
  const response = await transactionWrapper<ActivityContact>(async (tx: PrismaTransactionClient) => {
    const newContact = await createActivityContact(tx, req.params.activityId, req.params.contactId, req.body.role);

    const { templateParams, navEmail } = await getTeamMemberEmailTemplateData(
      tx,
      req.currentContext.userId,
      req.params.activityId,
      newContact.contact!
    );

    let template, subject;
    if (req.body.role === ActivityContactRole.MEMBER) {
      template = teamMemberAddedTemplate(templateParams);
      subject = `You've been added to the project ${templateParams.projectName} project in the Navigator Service`;
    } else if (req.body.role === ActivityContactRole.ADMIN) {
      template = teamAdminAddedTemplate(templateParams);
      subject = `You are now the Admin of ${templateParams.projectName} project in the Navigator Service`;
    }

    if (template && subject && newContact.contact?.email) {
      await email({
        to: [newContact.contact.email],
        from: navEmail,
        subject: subject,
        bodyType: 'html',
        body: template
      });
    }

    return newContact;
  });

  res.status(201).json(response);
};

export const deleteActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }>,
  res: Response
) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const ac = await getActivityContact(tx, req.params.activityId, req.params.contactId);
    if (ac.role === ActivityContactRole.PRIMARY) throw new Problem(403, { detail: 'Cannot remove PRIMARY contact' });
    await deleteActivityContact(tx, req.params.activityId, req.params.contactId);

    const { templateParams, navEmail } = await getTeamMemberEmailTemplateData(
      tx,
      req.currentContext.userId,
      req.params.activityId,
      ac.contact!
    );

    if (ac.contact?.email) {
      await email({
        to: [ac.contact.email],
        from: navEmail,
        subject: `You no longer have access to ${templateParams.projectName} project in the Navigator Service`,
        bodyType: 'html',
        body: teamMemberRevokedTemplate(templateParams)
      });
    }
  });

  res.status(204).end();
};

export const listActivityContactController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await transactionWrapper<ActivityContact[]>(async (tx: PrismaTransactionClient) => {
    return await listActivityContacts(tx, req.params.activityId);
  });

  res.status(200).json(response);
};

export const updateActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>,
  res: Response
) => {
  const response = await transactionWrapper<ActivityContact>(async (tx: PrismaTransactionClient) => {
    const ac = await getActivityContact(tx, req.params.activityId, req.params.contactId);

    if (ac.role === ActivityContactRole.PRIMARY) throw new Problem(403, { detail: 'Cannot remove PRIMARY contact' });

    const updated = await updateActivityContact(tx, req.params.activityId, req.params.contactId, req.body.role);

    const { templateParams, navEmail } = await getTeamMemberEmailTemplateData(
      tx,
      req.currentContext.userId,
      req.params.activityId,
      updated.contact!
    );

    let template, subject;
    if (req.body.role === ActivityContactRole.ADMIN) {
      template = teamAdminAddedTemplate(templateParams);
      subject = `You are now the Admin of ${templateParams.projectName} project in the Navigator Service`;
    }

    if (template && subject && updated.contact?.email) {
      await email({
        to: [updated.contact.email],
        from: navEmail,
        subject: subject,
        bodyType: 'html',
        body: template
      });
    }

    return updated;
  });

  res.status(200).json(response);
};
