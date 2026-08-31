import { unitOfWork } from '#src/db/unitOfWork';
import { getTeamMemberEmailTemplateData, verifyPrimaryChange } from '#src/domains/activityContact';
import { email } from '#src/external/ches';
import { ActivityContactRole } from '#src/utils/enums/projectCommon';
import Problem from '#src/utils/problem';
import {
  teamAdminAddedTemplate,
  teamMemberAddedTemplate,
  teamMemberRevokedTemplate,
  teamPrimaryAddedTemplate
} from '#src/utils/templates';

import type { ActivityContact, CurrentAuthorization, CurrentContext } from '#types';

export const createActivityContactService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  activityId: string,
  contactId: string,
  role: ActivityContactRole
) => {
  return await unitOfWork.execute(
    async ({ activityContact, contact, electrificationProject, enquiry, generalProject, housingProject }) => {
      // If the PRIMARY role is being given to another user, make any pre adjustments
      if (role === ActivityContactRole.PRIMARY)
        await verifyPrimaryChange({ activityContact, contact }, activityId, currentAuthorization, currentContext);

      const created = await activityContact.create({
        activityId,
        contactId,
        role
      });

      const linkedContact = await contact.findUniqueOrThrow({ where: { contactId } });

      const { templateParams, navEmail } = await getTeamMemberEmailTemplateData(
        { contact, electrificationProject, enquiry, generalProject, housingProject },
        currentContext.initiative,
        currentContext.userId,
        activityId,
        linkedContact
      );

      if (templateParams && navEmail) {
        let template, subject;
        if (role === ActivityContactRole.MEMBER) {
          template = teamMemberAddedTemplate(templateParams);
          subject = `You've been added to the project ${templateParams.projectName} project in the Navigator Service`;
        } else if (role === ActivityContactRole.ADMIN) {
          template = teamAdminAddedTemplate(templateParams);
          subject = `You are now the Admin of ${templateParams.projectName} project in the Navigator Service`;
        }

        if (template && subject && linkedContact.email) {
          await email({
            to: [linkedContact.email],
            from: navEmail,
            subject: subject,
            bodyType: 'html',
            body: template
          });
        }
      }

      return created;
    }
  );
};

export const deleteActivityContactService = async (
  currentContext: CurrentContext,
  activityId: string,
  contactId: string
) => {
  return await unitOfWork.execute(
    async ({ activityContact, contact, electrificationProject, enquiry, generalProject, housingProject }) => {
      const ac = await activityContact.findFirstOrThrow({
        where: {
          activityId: activityId,
          contactId: contactId
        },
        include: { contact: true }
      });

      if ((ac.role as ActivityContactRole) === ActivityContactRole.PRIMARY)
        throw new Problem(403, { detail: 'Cannot remove PRIMARY contact' });

      await activityContact.delete(
        {
          activityId_contactId: {
            activityId,
            contactId
          }
        },
        { hard: true }
      );

      const { templateParams, navEmail } = await getTeamMemberEmailTemplateData(
        { contact, electrificationProject, enquiry, generalProject, housingProject },
        currentContext.initiative,
        currentContext.userId,
        activityId,
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
    }
  );
};

export const listActivityContactsService = async (activityId: string) => {
  return await unitOfWork.execute(async ({ activityContact }) => {
    return await activityContact.findMany({
      where: {
        activityId
      },
      include: { contact: true }
    });
  });
};

export const updateActivityContactService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  activityId: string,
  contactId: string,
  role: ActivityContactRole
) => {
  return await unitOfWork.execute(
    async ({ activityContact, contact, electrificationProject, enquiry, generalProject, housingProject }) => {
      // Disallow removing the only PRIMARY user
      const ac = await activityContact.findFirstOrThrow({
        where: {
          activityId: activityId,
          contactId: contactId
        }
      });

      if ((ac.role as ActivityContactRole) === ActivityContactRole.PRIMARY)
        throw new Problem(403, { detail: 'Cannot remove PRIMARY contact' });

      // If the PRIMARY role is being given to another user, make any pre adjustments
      let demoted: ActivityContact | undefined;
      if (role === ActivityContactRole.PRIMARY) {
        demoted = await verifyPrimaryChange(
          { activityContact, contact },
          activityId,
          currentAuthorization,
          currentContext
        );
      }

      const updated = await activityContact.update(
        {
          activityId_contactId: {
            activityId,
            contactId
          }
        },
        {
          role: role
        }
      );

      const linkedContact = await contact.findUniqueOrThrow({ where: { contactId } });

      const { templateParams, navEmail } = await getTeamMemberEmailTemplateData(
        { contact, electrificationProject, enquiry, generalProject, housingProject },
        currentContext.initiative,
        currentContext.userId,
        activityId,
        linkedContact
      );

      if (templateParams && navEmail) {
        let template, subject;
        const isAdminChange = ActivityContactRole.ADMIN === role;
        if (isAdminChange || ActivityContactRole.PRIMARY === role) {
          template = isAdminChange ? teamAdminAddedTemplate(templateParams) : teamPrimaryAddedTemplate(templateParams);
          const roleString = isAdminChange ? 'Admin' : 'Primary contact';
          subject = `You are now the ${roleString} of ${templateParams.projectName} project in the Navigator Service`;
        }

        if (template && subject && linkedContact.email) {
          await email({
            to: [linkedContact.email],
            from: navEmail,
            subject: subject,
            bodyType: 'html',
            body: template
          });
        }
      }

      return { updated, demoted };
    }
  );
};
