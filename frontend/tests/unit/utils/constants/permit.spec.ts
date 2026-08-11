import { PermitStage, PermitState } from '@/utils/enums/codeEnums';
import { VALID_STATE_STAGES } from '@/utils/constants/permit';

describe('permit constants', () => {
  describe('VALID_STATE_STAGES', () => {
    describe('completeness', () => {
      it('has an entry for every PermitState', () => {
        const allStates = Object.values(PermitState);
        const definedStates = Object.keys(VALID_STATE_STAGES);

        expect(definedStates.sort()).toEqual(allStates.sort());
      });

      it('has at least one stage for each state', () => {
        Object.values(VALID_STATE_STAGES).forEach((stages) => {
          expect(stages.length).toBeGreaterThan(0);
        });
      });
    });

    describe('data integrity', () => {
      it('only contains valid PermitStage values', () => {
        const validStages = Object.values(PermitStage);

        Object.values(VALID_STATE_STAGES).forEach((stages) => {
          stages.forEach((stage) => {
            expect(validStages).toContain(stage);
          });
        });
      });

      it('does not contain duplicate stages for any state', () => {
        Object.values(VALID_STATE_STAGES).forEach((stages) => {
          const uniqueStages = [...new Set(stages)];
          expect(stages.length).toBe(uniqueStages.length);
        });
      });
    });

    describe('business rules', () => {
      it('allows valid stages for INITIAL_REVIEW state', () => {
        const stages = VALID_STATE_STAGES[PermitState.INITIAL_REVIEW];

        expect(stages).toEqual([PermitStage.APPLICATION_SUBMISSION, PermitStage.TECHNICAL_REVIEW]);
      });

      it('allows only PRE_SUBMISSION for NONE state', () => {
        expect(VALID_STATE_STAGES[PermitState.NONE]).toEqual([PermitStage.PRE_SUBMISSION]);
      });

      it('allows only POST_DECISION for final states (DENIED, APPROVED, ISSUED)', () => {
        const finalStates = [PermitState.DENIED, PermitState.APPROVED, PermitState.ISSUED];

        finalStates.forEach((state) => {
          expect(VALID_STATE_STAGES[state]).toEqual([PermitStage.POST_DECISION]);
        });
      });

      it('allows valid stages for IN_PROGRESS state', () => {
        const stages = VALID_STATE_STAGES[PermitState.IN_PROGRESS];

        expect(stages).toContain(PermitStage.APPLICATION_SUBMISSION);
        expect(stages).toContain(PermitStage.TECHNICAL_REVIEW);
        expect(stages).toContain(PermitStage.PENDING_DECISION);
      });

      it('allows valid stages for PENDING_APPLICANT_ACTION state', () => {
        const stages = VALID_STATE_STAGES[PermitState.PENDING_APPLICANT_ACTION];

        expect(stages).toContain(PermitStage.APPLICATION_SUBMISSION);
        expect(stages).toContain(PermitStage.TECHNICAL_REVIEW);
        expect(stages).toContain(PermitStage.PENDING_DECISION);
      });

      it('allows valid stages for WITHDRAWN state', () => {
        const stages = VALID_STATE_STAGES[PermitState.WITHDRAWN];

        expect(stages).toContain(PermitStage.APPLICATION_SUBMISSION);
        expect(stages).toContain(PermitStage.TECHNICAL_REVIEW);
        expect(stages).toContain(PermitStage.PENDING_DECISION);
        expect(stages).toContain(PermitStage.POST_DECISION);
      });

      it('does not allow PRE_SUBMISSION for any state except NONE', () => {
        const statesWithoutNone = Object.entries(VALID_STATE_STAGES).filter(([state]) => state !== PermitState.NONE);

        statesWithoutNone.forEach(([, stages]) => {
          expect(stages).not.toContain(PermitStage.PRE_SUBMISSION);
        });
      });
    });
  });
});
