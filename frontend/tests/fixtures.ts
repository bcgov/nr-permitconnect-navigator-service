// Shared fixtures; kept free of imports so specs that mock modules can still use them

// Audit columns every API resource carries
export const testAuditFields = {
  createdBy: 'testCreatedBy',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedBy: 'testUpdatedBy',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedBy: null,
  deletedAt: null
};

// A permit's columns that stay null until filled in
export const testPermitDefaults = {
  ...testAuditFields,
  issuedPermitId: null,
  needed: null,
  submittedDate: null,
  submittedTime: null,
  decisionDate: null,
  decisionTime: null,
  statusLastChanged: null,
  statusLastChangedTime: null,
  statusLastVerified: null,
  statusLastVerifiedTime: null,
  targetDate: null,
  targetDateDescription: null,
  onHoldCode: null,
  technicalReviewer: null
};

// A contact's columns that stay null until filled in
export const testContactDefaults = {
  ...testAuditFields,
  userId: null,
  firstName: null,
  lastName: null,
  phoneNumber: null,
  email: null,
  contactPreference: null,
  contactApplicantRelationship: null
};

// An enquiry's columns that stay null until filled in
export const testEnquiryDefaults = {
  ...testAuditFields,
  assignedUserId: null,
  submissionType: null,
  relatedActivityId: null,
  enquiryDescription: null,
  enquiryStatus: null,
  atsClientId: null,
  atsEnquiryId: null,
  addedToAts: false
};

// A housing project's columns that specs rarely set themselves
export const testHousingProjectDefaults = {
  ...testAuditFields,
  assignedUserId: null,
  submittedBy: 'testSubmittedBy',
  relatedPermits: null,
  astUpdated: false,
  financiallySupported: false,
  checkProvincialPermits: null,
  consentToFeedback: false
};
