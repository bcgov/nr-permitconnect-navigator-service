import { deleteActivity } from '../domains/activity';
import { unitOfWork } from '../repository/unitOfWork';

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
