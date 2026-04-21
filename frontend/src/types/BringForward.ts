export interface BringForward {
  activityId: string;
  enquiryId?: string;
  noteId: string;
  electrificationProjectId?: string;
  escalateToDirector?: boolean;
  escalateToSupervisor?: boolean;
  generalProjectId?: string;
  housingProjectId?: string;
  title: string;
  projectName?: string;
  bringForwardDate: string;
  createdByFullName?: string;
}
