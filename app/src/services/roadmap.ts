import { v4 as uuidv4 } from 'uuid';

import { PermitStage } from '../db/codes/enums';
import { getProjectByActivityId } from '../domains/project';
import { email } from '../external/ches';
import { getObject, searchObject } from '../external/coms';
import { unitOfWork } from '../repository/unitOfWork';
import { Problem } from '../utils';
import { PermitNeeded } from '../utils/enums/permit';
import { ActivityContactRole } from '../utils/enums/projectCommon';
import { roadmapTemplate } from '../utils/templates';
import { description } from '../../package.json';

import type { CurrentContext, Email, EmailAttachment, NoteHistory, Permit } from '../types';

function getPermitTypeNamesByNeeded(permits: Permit[], permitNeeded: PermitNeeded) {
  return permits.filter((p) => p.needed === permitNeeded).map((p) => p.permitType?.name);
}

function getPermitTypeNamesByStage(permits: Permit[], permitStage: PermitStage) {
  return permits.filter((p) => p.stage === permitStage).map((p) => p.permitType?.name);
}

export const getRoadmapNoteService = async (activityId: string): Promise<string> => {
  return await unitOfWork.execute(async ({ electrificationProject, generalProject, housingProject, permit }) => {
    const project = await getProjectByActivityId(
      {
        electrificationProject,
        generalProject,
        housingProject
      },
      activityId
    );
    const permits = await permit.findMany({ where: { activityId } });
    const primaryContact = project?.activity?.activityContact?.find(
      (ac) => ac.role === ActivityContactRole.PRIMARY
    )?.contact;

    const permitStateApplied = getPermitTypeNamesByStage(permits, PermitStage.APPLICATION_SUBMISSION);
    const permitStateCompleted = getPermitTypeNamesByStage(permits, PermitStage.POST_DECISION);
    const permitPossiblyNeeded = getPermitTypeNamesByStage(permits, PermitStage.PRE_SUBMISSION).filter((value) =>
      getPermitTypeNamesByNeeded(permits, PermitNeeded.UNDER_INVESTIGATION).includes(value)
    );
    const permitStateNew = getPermitTypeNamesByStage(permits, PermitStage.PRE_SUBMISSION).filter((value) =>
      getPermitTypeNamesByNeeded(permits, PermitNeeded.YES).includes(value)
    );

    const rodmapNote = roadmapTemplate({
      contactName:
        primaryContact?.firstName && primaryContact?.lastName
          ? `${primaryContact?.firstName} ${primaryContact?.lastName}`
          : '',
      projectName: project?.projectName,
      activityId: project?.activityId,
      permitStateNew: permitStateNew,
      permitPossiblyNeeded: permitPossiblyNeeded,
      permitStateApplied: permitStateApplied,
      permitStateCompleted: permitStateCompleted,
      navigatorName: description
    });
    return rodmapNote;
  });
};

export const sendRoadmapService = async (
  currentContext: CurrentContext,
  activityId: string,
  selectedFileIds: string[],
  emailData: Email
): Promise<NoteHistory> => {
  if (selectedFileIds?.length) {
    const attachments: EmailAttachment[] = [];

    if (currentContext.bearerToken) {
      const bearerToken = currentContext.bearerToken;

      // Attempt to get the requested documents from COMS
      // If succesful it is converted to base64 encoding and added to the attachment list
      const objectPromises = selectedFileIds.map(async (id) => {
        const { status, headers, data } = await getObject(bearerToken, id);
        const searchResponse = await searchObject(bearerToken, id);

        if (status === 200 && searchResponse.data[0]) {
          const filename = searchResponse.data[0].name;
          if (filename) {
            attachments.push({
              content: Buffer.from(data).toString('base64'),
              contentType: headers['content-type'] as string,
              encoding: 'base64',
              filename: filename
            });
          } else {
            throw new Problem(500, { detail: `Unable to obtain filename for file ${id}` });
          }
        }
      });

      await Promise.all(objectPromises);
    }

    // All succesful so attachment list is added to payload
    emailData.attachments = attachments;
  }

  // Send the email
  const { status } = await email(emailData);

  return await unitOfWork.execute(async ({ note, noteHistory }) => {
    // Add a new note on successful email send
    if (status === 201) {
      let noteBody = emailData.body;
      if (emailData.attachments) {
        noteBody += '\n\nAttachments:\n';
        emailData.attachments.forEach((x) => {
          noteBody += `${x.filename}\n`;
        });
      }

      const noteHistoryRes = await noteHistory.create({
        noteHistoryId: uuidv4(),
        activityId: activityId,
        type: 'Roadmap',
        title: 'Sent roadmap',
        bringForwardDate: null,
        bringForwardState: null,
        escalateToSupervisor: false,
        escalateToDirector: false,
        escalationType: null,
        shownToProponent: false
      });

      const noteRes = await note.create({
        noteId: uuidv4(),
        noteHistoryId: noteHistoryRes.noteHistoryId,
        note: noteBody
      });
      return { ...noteHistoryRes, note: [noteRes] };
    } else {
      throw new Problem(500, { detail: 'Failed to send roadmap email.' });
    }
  });
};
