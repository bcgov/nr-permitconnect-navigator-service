import config from 'config';

import { getProjectByActivityId } from './project';
import { Repositories } from '../repository/uow';
import { Problem } from '../utils';
import { GroupName, Initiative } from '../utils/enums/application';
import { ActivityContactRole } from '../utils/enums/projectCommon';

import type { ActivityContact, Contact, CurrentAuthorization, CurrentContext } from '../types';

export const getTeamMemberEmailTemplateData = async (
  repositories: Pick<
    Repositories,
    'contact' | 'electrificationProject' | 'generalProject' | 'housingProject' | 'enquiry'
  >,
  initiative: Initiative,
  currentUserId: string | undefined,
  activityId: string,
  contact: Contact
) => {
  let adminContact: Contact[] = [];
  if (currentUserId) {
    adminContact = await repositories.contact.search({
      userId: [currentUserId]
    });
  }

  try {
    const project = await getProjectByActivityId(
      {
        electrificationProject: repositories.electrificationProject,
        generalProject: repositories.generalProject,
        housingProject: repositories.housingProject
      },
      activityId
    );
    const projectName = project.projectName ?? '';

    const templateParams = {
      dearName: `${contact.firstName} ${contact.lastName}`,
      adminName: adminContact?.length ? `${adminContact[0].firstName} ${adminContact[0].lastName}` : undefined,
      projectName,
      initiative: project.activity?.initiative?.code.toLowerCase(),
      projectId: project.projectId
    };

    const navEmail: string = config.get('server.pcns.navEmail');

    return { templateParams, navEmail };
  } catch (e) {
    // getProjectByActivityId could 404 indicating it might be an enquiry, in which case we just do nothing
    const enquiry = await repositories.enquiry.search({ activityId: [activityId] }, initiative);
    if (enquiry[0]) {
      return { templateParams: undefined, navEmail: undefined };
    } else {
      throw e;
    }
  }
};

/**
 * Only allows either the existing PRIMARY user of an activity, a navigator, or a user authorized with scope:all
 *   to hand off the PRIMARY to a new contact
 * This function will change the current PRIMARY's role to ADMIN
 * Needs to be called BEFORE the new PRIMARY role is given
 * @param repositories - The required repositories
 * @param activityId - The activity ID given in the request
 * @param currentAuthorization - The authorization of the current authorized user
 * @param currentContext - The context of the current authorized user
 * @returns A promise resolving to the previous PRIMARY activity contact, or undefined if none was demoted.
 */
export const verifyPrimaryChange = async (
  repositories: Pick<Repositories, 'activityContact' | 'contact'>,
  activityId: string,
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext
): Promise<ActivityContact | undefined> => {
  const NAVIGATOR_GROUPS = new Set([GroupName.ADMIN, GroupName.NAVIGATOR, GroupName.SUPERVISOR]);

  const activityContacts = await repositories.activityContact.findMany({ where: { activityId } });

  // Current user scope check
  if (!currentAuthorization.attributes.includes('scope:all')) {
    const currentUserContact = await repositories.contact.search({ userId: [currentContext.userId as string] });
    const currentUserActivityContact = activityContacts.find((ac) => ac.contactId === currentUserContact[0].contactId);

    // Check if current user is a primary contact or navigator.
    const userIsPrimaryContact = currentUserActivityContact?.role === ActivityContactRole.PRIMARY;
    const userIsNavigator = currentAuthorization.groups.some(
      (g) => g.initiativeCode === currentContext.initiative && NAVIGATOR_GROUPS.has(g.name)
    );

    if (!userIsPrimaryContact && !userIsNavigator) {
      throw new Problem(403, { detail: 'User lacks required role.' });
    }
  }

  // If necessary, update current PRIMARY activity contact to ADMIN and return
  const currentPrimaryActivityContact = activityContacts.find((ac) => ac.role === ActivityContactRole.PRIMARY);
  if (currentPrimaryActivityContact) {
    return await repositories.activityContact.update(
      {
        activityId_contactId: {
          activityId,
          contactId: currentPrimaryActivityContact.contactId
        }
      },
      {
        role: ActivityContactRole.ADMIN
      }
    );
  }

  return undefined;
};
