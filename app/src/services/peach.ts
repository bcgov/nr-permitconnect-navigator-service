import { findPriorityPermitTracking } from '#src/domains/peach';
import { getPiesRecord } from '#src/external/peach';
import { summarizePiesRecord } from '#src/parsers/peach';
import { Problem } from '#src/utils/index';

import type { PermitTracking } from '#types';

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
