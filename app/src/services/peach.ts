import { findPriorityPermitTracking } from '#src/domains/peach';
import { getPeachRecord } from '#src/external/peach';
import { summarizePeachRecord } from '#src/parsers/peach';
import { Problem } from '#src/utils/index';

import type { PermitTracking } from '#types';

export const getPeachSummaryService = async (data: PermitTracking[]) => {
  const permitTracking = findPriorityPermitTracking(data);

  if (!permitTracking?.trackingId || !permitTracking?.sourceSystemKind?.sourceSystem) {
    throw new Problem(422, { detail: 'No PEACH-integrated tracking ID and/or system were found in the request body.' });
  }

  const response = await getPeachRecord(permitTracking.trackingId, permitTracking.sourceSystemKind.sourceSystem);
  const peachSummary = summarizePeachRecord(response);

  if (!peachSummary)
    throw new Problem(422, { detail: 'No status data could be derived from the PEACH record that was found.' });

  return peachSummary;
};
