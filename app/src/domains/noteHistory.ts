import config from 'config';

import { getProjectByActivityId } from './project';
import { email } from '../external/ches';
import { Repositories } from '../repository/unitOfWork';
import { Problem } from '../utils';
import { GroupName, Initiative, Resource } from '../utils/enums/application';
import { NoteType } from '../utils/enums/projectCommon';
import { bringForwardEnquiryNotificationTemplate, bringForwardProjectNotificationTemplate } from '../utils/templates';

import type { NoteHistory, User } from '../types';

export async function emailBringForwardNotification(
  repositories: Pick<
    Repositories,
    'electrificationProject' | 'generalProject' | 'housingProject' | 'subjectGroup' | 'user'
  >,
  noteHistory: NoteHistory,
  initiative: Initiative,
  resource: Resource
) {
  if (noteHistory.type !== NoteType.BRING_FORWARD || !noteHistory.escalateToSupervisor) return;

  const subGrps = await repositories.subjectGroup.findMany({
    where: {
      group: {
        name: GroupName.SUPERVISOR,
        initiative: {
          code: initiative
        }
      }
    }
  });

  const supervisors = await repositories.user.findMany({
    where: {
      AND: [{ sub: { in: subGrps.map((x) => x.sub) } }, { active: true }]
    }
  });

  const supervisorsEmails = supervisors.flatMap((user: User) => (user.email ? [user.email] : []));

  if (supervisorsEmails.length === 0) return;

  let body: string;

  if (resource === Resource.ENQUIRY) {
    body = bringForwardEnquiryNotificationTemplate({
      activityId: noteHistory.activityId
    });
  } else if (
    [Resource.ELECTRIFICATION_PROJECT, Resource.GENERAL_PROJECT, resource === Resource.HOUSING_PROJECT].includes(
      resource
    )
  ) {
    const project = await getProjectByActivityId(
      {
        electrificationProject: repositories.electrificationProject,
        generalProject: repositories.generalProject,
        housingProject: repositories.housingProject
      },
      noteHistory.activityId
    );

    if (!project) return;

    body = bringForwardProjectNotificationTemplate({
      projectName: project.projectName,
      activityId: noteHistory.activityId
    });
  } else {
    throw new Problem(422, { detail: 'Invalid resource type for bring forward notification' });
  }

  const configCC = config.get<string>('server.ches.submission.cc');

  const emailData = {
    from: configCC,
    to: supervisorsEmails,
    subject: 'New escalation in PCNS',
    bodyType: 'html',
    body: body
  };
  await email(emailData);
}
