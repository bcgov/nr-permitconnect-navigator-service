/*
 * Common initiative enums
 */

export enum ActivityContactRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  PRIMARY = 'PRIMARY'
}

export enum ApplicationStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  DELAYED = 'Delayed',
  COMPLETED = 'Completed'
}

export enum BringForwardType {
  UNRESOLVED = 'Unresolved',
  RESOLVED = 'Resolved'
}

export enum BusinessArea {
  FISH_AND_WILDLIFE = 'Fish and Wildlife',
  WATER = 'Water',
  LANDS = 'Lands',
  FORESTS = 'Forests',
  SYSTEMS = 'Systems',
  MINES = 'Mines',
  PARKS = 'Parks',
  NON_LISTED_PARTNER_AGENCY_OR_OTHER = 'Non-listed Partner Agency / Other',
  // prettier-ignore
  LABOUR_AND_CITIZENS_SERVICES = 'Labour and Citizens\' Services',
  ENVIRONMENT = 'Environment',
  ABORIGINAL_RELATIONS = 'Aboriginal Relations',
  ADVANCED_EDUCATION = 'Advanced Education',
  AGRICULTURAL_LAND_COMMISSION = 'Agricultural Land Commission',
  AGRICULTURE = 'Agriculture',
  ARCHAEOLOGY = 'Archaeology',
  BC_ASSESSMENT_AUTHORITY = 'BC Assessment Authority',
  BC_ENERGY_REGULATOR = 'BC Energy Regulator',
  COMMUNITY_DEVELOPMENT = 'Community Development',
  COMMUNITY_SPORT_AND_CULTURE = 'Community Sport and Culture',
  DEPARTMENT_OF_FISHERIES_AND_OCEANS_CANADA = 'Department of Fisheries and Oceans Canada',
  ECONOMIC_DEVELOPMENT = 'Economic Development',
  EDUCATION = 'Education',
  ELECTRIFICATION = 'Electrification',
  ENERGY = 'Energy',
  ENVIRONMENTAL_PROTECTION = 'Environmental Protection',
  FEDERAL_GOVERNMENT = 'Federal Government',
  FINANCE = 'Finance',
  FRASER_HEALTH_AUTHORITY = 'Fraser Health Authority',
  HEALTH_SERVICES = 'Health Services',
  INTERIOR_HEALTH_AUTHORITY = 'Interior Health Authority',
  LAND_TITLE_AUTHORITY = 'Land Title Authority',
  LOCAL_GOVERNMENT_MUNICIPALITIES_AND_CITIES = 'Local Government (Municipalities and Cities)',
  MINISTRY_OF_ATTORNEY_GENERAL = 'Ministry of Attorney General',
  MINISTRY_OF_SMALL_BUSINESS_AND_REVENUE = 'Ministry of Small Business and Revenue',
  MOUNTAIN_RESORTS_BRANCH = 'Mountain Resorts Branch',
  NORTHERN_HEALTH_AUTHORITY = 'Northern Health Authority',
  OFFICE_OF_THE_PREMIER = 'Office of the Premier',
  PROVINCIAL_EMERGENCY_PROGRAM = 'Provincial Emergency Program',
  PUBLIC_SERVICE_AGENCY = 'Public Service Agency',
  RANGE = 'Range',
  RECREATION_SITES_AND_TRAILS = 'Recreation Sites and Trails',
  REGIONAL_DISTRICTS = 'Regional Districts',
  RIPARIAN = 'Riparian',
  RURAL_DEVELOPMENT = 'Rural Development',
  SMALL_BUSINESS_BC = 'Small Business BC',
  SOLICITOR_GENERAL = 'Solicitor General',
  SURVEYOR_GENERAL_LAND_TITLE_AND_SURVEY_AUTHORITIES = 'Surveyor General - Land Title & Survey Authorities',
  TRANSPORTATION = 'Transportation',
  VANCOUVER_COAST_HEALTH_AUTHORITY = 'Vancouver Coast Health Authority',
  VANCOUVER_ISLAND_HEALTH_AUTHORITY = 'Vancouver Island Health Authority'
}

export enum ContactPreference {
  PHONE_CALL = 'Phone call',
  EMAIL = 'Email',
  EITHER = 'Either'
}

export enum EnquirySubmittedMethod {
  PHONE = 'Phone',
  EMAIL = 'Email',
  PCNS = 'PCNS'
}

export enum DraftCode {
  ELECTRIFICATION_PROJECT = 'ELECTRIFICATION_PROJECT',
  GENERAL_PROJECT = 'GENERAL_PROJECT',
  HOUSING_PROJECT = 'HOUSING_PROJECT'
}

export enum NoteType {
  GENERAL = 'General',
  BRING_FORWARD = 'Bring forward',
  ENQUIRY = 'Enquiry',
  ROADMAP = 'Roadmap'
}

export enum ProjectRelationship {
  OWNER = 'Property owner',
  CONSULTANT = 'Project consultant',
  OTHER = 'Other'
}

export enum SubmissionType {
  ASSISTANCE = 'Assistance',
  ESCALATION = 'Escalation',
  GENERAL_ENQUIRY = 'General enquiry',
  GUIDANCE = 'Guidance',
  INAPPLICABLE = 'Inapplicable',
  STATUS_REQUEST = 'Status request'
}
