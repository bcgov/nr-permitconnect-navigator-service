import { BasicResponse } from '@/utils/enums/application';
import { PermitStage } from '@/utils/enums/codeEnums';
import { PermitNeeded } from '@/utils/enums/permit';
import { draftToPermitsFormValues, projectToPermitsFormValues, toPermitsPayload } from '@/utils/permit';

import type { Permit } from '@/types';

describe('permit.ts', () => {
  describe('toPermitsPayload', () => {
    it('serializes submitted dates and keeps only the first tracking ID', () => {
      expect(
        toPermitsPayload({
          hasAppliedProvincialPermits: BasicResponse.YES,
          appliedPermits: [
            {
              permitTypeId: 1,
              submittedDate: new Date('2024-01-01T00:00:00.000Z'),
              permitTracking: [{ trackingId: 'TRK-1' }, { trackingId: 'TRK-2' }]
            }
          ],
          investigatePermits: [{ permitTypeId: 2 }]
        })
      ).toEqual({
        hasAppliedProvincialPermits: BasicResponse.YES,
        appliedPermits: [
          { permitTypeId: 1, submittedDate: '2024-01-01T00:00:00.000Z', permitTracking: [{ trackingId: 'TRK-1' }] }
        ],
        investigatePermits: [{ permitTypeId: 2 }]
      });
    });
  });

  describe('draftToPermitsFormValues', () => {
    it('turns saved submitted dates back into Dates', () => {
      const permits = {
        hasAppliedProvincialPermits: BasicResponse.YES,
        appliedPermits: [
          { permitTypeId: 1, submittedDate: '2024-01-01T00:00:00.000Z', permitTracking: [{ trackingId: 'TRK-1' }] }
        ]
      } as unknown as Parameters<typeof draftToPermitsFormValues>[0];

      expect(draftToPermitsFormValues(permits)).toEqual({
        hasAppliedProvincialPermits: BasicResponse.YES,
        appliedPermits: [
          {
            permitTypeId: 1,
            submittedDate: new Date('2024-01-01T00:00:00.000Z'),
            permitTracking: [{ trackingId: 'TRK-1' }]
          }
        ]
      });
    });

    it('handles drafts saved without a permits section', () => {
      expect(draftToPermitsFormValues(undefined)).toEqual({ appliedPermits: [] });
    });
  });

  describe('projectToPermitsFormValues', () => {
    it('splits project permits into applied and investigate lists', () => {
      const applied = { permitId: 'p1', stage: PermitStage.APPLICATION_SUBMISSION, submittedDate: '2024-01-01' };
      const investigate = {
        permitId: 'p2',
        stage: PermitStage.PRE_SUBMISSION,
        needed: PermitNeeded.UNDER_INVESTIGATION
      };
      const other = { permitId: 'p3', stage: PermitStage.PRE_SUBMISSION, needed: PermitNeeded.YES };

      const result = projectToPermitsFormValues(BasicResponse.UNSURE, [applied, investigate, other] as Permit[]);

      expect(result.hasAppliedProvincialPermits).toBe(BasicResponse.UNSURE);
      expect(result.appliedPermits).toEqual([{ ...applied, submittedDate: new Date('2024-01-01') }]);
      expect(result.investigatePermits).toEqual([investigate]);
    });

    it('drops an unrecognized saved answer', () => {
      expect(projectToPermitsFormValues('Maybe', []).hasAppliedProvincialPermits).toBeUndefined();
    });
  });
});
