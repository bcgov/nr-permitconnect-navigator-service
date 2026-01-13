import config from 'config';

import { Problem } from '../utils/index.ts';
import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  createActivityContact,
  deleteActivityContact,
  getActivityContact,
  listActivityContacts,
  updateActivityContact
} from '../services/activityContact.ts';
import { searchContacts } from '../services/contact.ts';
import { email } from '../services/email.ts';
import { searchEnquiries } from '../services/enquiry.ts';
import { verifyPrimaryChange } from '../services/helpers/activityContact.ts';
import { getProjectByActivityId } from '../services/project.ts';
import { Initiative } from '../utils/enums/application.ts';
import { ActivityContactRole } from '../utils/enums/projectCommon.ts';
import { teamAdminAddedTemplate, teamMemberAddedTemplate, teamMemberRevokedTemplate } from '../utils/templates.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { ActivityContact, Contact } from '../types/index.ts';

const getTeamMemberEmailTemplateData = async (
  tx: PrismaTransactionClient,
  initiative: Initiative,
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

  try {
    const project = await getProjectByActivityId(tx, activityId);
    const projectName = project.projectName ?? '';

    const templateParams = {
      dearName: `${contact.firstName} ${contact.lastName}`,
      adminName: adminContact?.length ? `${adminContact[0].firstName} ${adminContact[0].lastName}` : undefined,
      projectName
    };

    const navEmail: string = config.get('server.pcns.navEmail');

    return { templateParams, navEmail };
  } catch (e) {
    // getProjectByActivityId could 404 indicating it might be an enquiry, in which case we just do nothing
    const enquiry = await searchEnquiries(tx, { activityId: [activityId] }, initiative);
    if (enquiry[0]) {
      return { templateParams: undefined, navEmail: undefined };
    } else {
      throw e;
    }
  }
};

export const createActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>,
  res: Response
) => {
  const response = await transactionWrapper<ActivityContact>(async (tx: PrismaTransactionClient) => {
    // Make any pre adjustments if the PRIMARY role is being given to another user
    await verifyPrimaryChange(
      tx,
      req.currentAuthorization.attributes,
      req.currentContext.userId,
      req.params.activityId,
      req.body.role
    );

    const newContact = await createActivityContact(tx, req.params.activityId, req.params.contactId, req.body.role);

    const { templateParams, navEmail } = await getTeamMemberEmailTemplateData(
      tx,
      req.currentContext.initiative!,
      req.currentContext.userId,
      req.params.activityId,
      newContact.contact!
    );

    if (templateParams && navEmail) {
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
    // Disallow removing the only PRIMARY user
    const ac = await getActivityContact(tx, req.params.activityId, req.params.contactId);
    if ((ac.role as ActivityContactRole) === ActivityContactRole.PRIMARY)
      throw new Problem(403, { detail: 'Cannot remove PRIMARY contact' });
    await deleteActivityContact(tx, req.params.activityId, req.params.contactId);

    const { templateParams, navEmail } = await getTeamMemberEmailTemplateData(
      tx,
      req.currentContext.initiative!,
      req.currentContext.userId,
      req.params.activityId,
      ac.contact!
    );

    if (templateParams && navEmail) {
      if (ac.contact?.email) {
        await email({
          to: [ac.contact.email],
          from: navEmail,
          subject: `You no longer have access to ${templateParams.projectName} project in the Navigator Service`,
          bodyType: 'html',
          body: teamMemberRevokedTemplate(templateParams)
        });
      }
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
    // Disallow removing the only PRIMARY user
    const ac = await getActivityContact(tx, req.params.activityId, req.params.contactId);

    if ((ac.role as ActivityContactRole) === ActivityContactRole.PRIMARY)
      throw new Problem(403, { detail: 'Cannot remove PRIMARY contact' });

    // Make any pre adjustments if the PRIMARY role is being given to another user
    await verifyPrimaryChange(
      tx,
      req.currentAuthorization.attributes,
      req.currentContext.userId,
      req.params.activityId,
      req.body.role
    );

    const updated = await updateActivityContact(tx, req.params.activityId, req.params.contactId, req.body.role);

    const { templateParams, navEmail } = await getTeamMemberEmailTemplateData(
      tx,
      req.currentContext.initiative!,
      req.currentContext.userId,
      req.params.activityId,
      updated.contact!
    );

    if (templateParams && navEmail) {
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
    }

    return updated;
  });

  res.status(200).json(response);
};
