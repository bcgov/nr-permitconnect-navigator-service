import pLimit from 'p-limit';

import { unitOfWork } from '#src/db/unitOfWork';
import {
  applyPeachUpdates,
  fetchPeachRecords,
  findPriorityPermitTracking,
  getPeachTrackingRecords
} from '#src/domains/peach';
import { prepareNotificationEmails } from '#src/domains/permit';
import { email } from '#src/external/ches';
import { getPiesRecord } from '#src/external/peach';
import { summarizePiesRecord } from '#src/parsers/peach';
import { Problem } from '#src/utils/index';

import type { Email, PermitTracking } from '#types';

// Each email fetches a CHES token and opens its own db transaction to log it
const emailLimit = pLimit(5);

export const getPeachSummaryService = async (data: PermitTracking[]) => {
  const permitTracking = findPriorityPermitTracking(data);

  if (!permitTracking?.trackingId || !permitTracking?.sourceSystemKind?.sourceSystem) {
    throw new Problem(422, { detail: 'No PEACH-integrated tracking ID and/or system were found in the request body.' });
  }

  const response = await getPiesRecord(permitTracking.trackingId, permitTracking.sourceSystemKind.sourceSystem);
  const peachSummary = summarizePiesRecord(response);

  if (!peachSummary) {
    throw new Problem(500, { detail: 'No status data could be derived from the PEACH record that was found.' });
  }

  return peachSummary;
};

/**
 * Applies PEACH data to PCNS permits and prepares their notification emails in the same write transaction, so a
 * permit's update and its note are committed together; a failed note roll back its permit update too. Fetches
 * from PEACH between transactions so no external call holds a connection.
 * @returns The prepared emails, ready to send once this has committed
 */
export const syncPeachRecordsService = async (): Promise<Email[]> => {
  const trackingRecords = await unitOfWork.execute(({ permit }) => getPeachTrackingRecords({ permit }));
  const parsedRecords = await fetchPeachRecords(trackingRecords);

  return await unitOfWork.execute(async (repos) => {
    const updatedPermitsWithNotes = await applyPeachUpdates({ permit: repos.permit }, trackingRecords, parsedRecords);

    const emailLists = await Promise.all(
      updatedPermitsWithNotes.map(({ permit, note }) => prepareNotificationEmails(repos, permit, true, note))
    );

    return emailLists.flat();
  });
};

/**
 * Sends the notification emails prepared by syncPeachRecordsService, rate limited, no db transaction involved.
 * @param emails - The emails to send
 */
export const sendPeachNotificationsService = async (emails: Email[]) => {
  await Promise.all(emails.map((emailData) => emailLimit(() => email(emailData))));
};
