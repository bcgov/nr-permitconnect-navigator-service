import { unitOfWork } from '#src/db/unitOfWork';
import { deleteActivity } from '#src/domains/activity';

export const deleteActivityService = async (activityId: string): Promise<void> => {
  return await unitOfWork.execute(
    async ({
      activity,
      activityContact,
      document,
      electrificationProject,
      enquiry,
      generalProject,
      housingProject,
      note,
      noteHistory,
      permit,
      permitNote,
      permitTracking
    }) => {
      await deleteActivity(
        {
          activity,
          activityContact,
          document,
          electrificationProject,
          enquiry,
          generalProject,
          housingProject,
          note,
          noteHistory,
          permit,
          permitNote,
          permitTracking
        },
        activityId
      );
    }
  );
};
