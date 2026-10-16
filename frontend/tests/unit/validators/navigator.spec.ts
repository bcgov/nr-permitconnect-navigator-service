import { runSchema, t } from '../../helpers';
import {
  createAstNotesPanelSchema,
  createAtsInfoPanelSchema,
  createCompanyProjectNamePanelSchema,
  createConsentPanelSchema,
  createContactCardNavFormSchema,
  createElectrificationPanelSchema,
  createFinanciallySupportedPanelSchema,
  createLocationDescriptionPanelSchema,
  createLocationPanelSchema,
  createLocationPidsPanelSchema,
  createProjectAreasUpdatedSchema,
  createProjectDescriptionPanelSchema,
  createRelatedEnquiriesPanelSchema,
  createResidentialUnitsSchema,
  createSubmissionStatePanelSchema
} from '@/validators/navigator';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { BasicResponse, Initiative } from '@/utils/enums/application';
import { ApplicationStatus, Area, Region, SubmissionType } from '@/utils/enums/projectCommon';

import type { CodeTableName } from '@/types';

// Mocks

// Fixtures

const UNITS = NUM_RESIDENTIAL_UNITS_LIST[0];
const LONG = 'a'.repeat(256);
const AAI_REQUIRED = 'Authorization and Approvals Insight (AAI) updated is a required field';
const UNITS_ONE_OF = 'must be one of the following values: 1-9, 10-49, 50-500, >500, Unsure';

const codeList = {
  BusinessArea: ['AGRICULTURE'],
  ElectrificationProjectCategory: ['IPP'],
  ElectrificationProjectType: ['IPP_SOLAR', 'OTHER']
} as unknown as Record<CodeTableName, string[]>;

const orgBookOptions = [{ registeredName: 'Test Co', registeredId: 'BC123' }];

const options = (initiative: Initiative) => ({ initiative, t, codeList, orgBookOptions });

const validSubmissionState = {
  applicationStatus: ApplicationStatus.NEW,
  area: Area.COAST,
  assignedUser: null,
  queuePriority: 2,
  region: Region.CARIBOO,
  submissionType: SubmissionType.GUIDANCE
};

// Mount

// Tests

describe('navigator validators', () => {
  describe('createContactCardNavFormSchema', () => {
    const schema = createContactCardNavFormSchema({ t }).contact;

    it('requires email and first name', async () => {
      expect((await runSchema(schema, {})).errors).toEqual({
        email: 'Contact email is a required field',
        firstName: 'Contact first name is a required field'
      });
    });

    it('rejects malformed values', async () => {
      expect(
        (
          await runSchema(schema, {
            email: 'bad',
            firstName: ' ',
            contactApplicantRelationship: 'x',
            contactPreference: 'x'
          })
        ).errors
      ).toEqual({
        email: 'Contact email must be valid',
        firstName: 'Contact first name is a required field',
        contactApplicantRelationship:
          'Relationship to project must be one of the following values: Property owner, Project consultant, Other',
        contactPreference: 'Preferred contact method must be one of the following values: Phone call, Email, Either'
      });
    });

    it('trims text and converts empty strings to null', async () => {
      expect(
        (
          await runSchema(schema, {
            contactId: '',
            email: 'a@b.co',
            firstName: ' A ',
            lastName: '',
            phoneNumber: '',
            contactApplicantRelationship: '',
            contactPreference: 'Email',
            userId: ''
          })
        ).value
      ).toEqual({
        contactId: null,
        email: 'a@b.co',
        firstName: 'A',
        lastName: null,
        phoneNumber: null,
        contactApplicantRelationship: null,
        contactPreference: 'Email',
        userId: null
      });
    });
  });

  describe('createCompanyProjectNamePanelSchema', () => {
    const schemaFor = (initiative: Initiative) =>
      createCompanyProjectNamePanelSchema(options(initiative)).companyProjectName;

    it.each([
      [
        Initiative.GENERAL,
        {
          activityType: 'Activity type is a required field',
          projectName: 'Project name is a required field'
        }
      ],
      [
        Initiative.ELECTRIFICATION,
        {
          companyNameRegistered: 'Company name is a required field',
          projectName: 'Project name is a required field'
        }
      ],
      [Initiative.HOUSING, { projectName: 'Project name is a required field' }]
    ])('%s requires its initiative specific fields', async (initiative, errors) => {
      expect((await runSchema(schemaFor(initiative), {})).errors).toEqual(errors);
    });

    it('GENERAL only accepts the Other activity type', async () => {
      expect((await runSchema(schemaFor(Initiative.GENERAL), { activityType: 'X', projectName: 'p' })).errors).toEqual({
        activityType: 'Activity type must be one of the following values: Other'
      });
    });

    it('ELECTRIFICATION requires the company name to be an org book suggestion', async () => {
      expect(
        (await runSchema(schemaFor(Initiative.ELECTRIFICATION), { companyNameRegistered: 'Nope', projectName: 'p' }))
          .errors
      ).toEqual({ companyNameRegistered: 'Company name must be a valid value from the list of suggestions' });
    });

    it('HOUSING accepts any activity type and company name', async () => {
      expect(
        (
          await runSchema(schemaFor(Initiative.HOUSING), {
            activityType: 'X',
            companyNameRegistered: 'Nope',
            projectName: 'p'
          })
        ).errors
      ).toEqual({});
    });

    it.each([
      [Initiative.GENERAL, null],
      [Initiative.ELECTRIFICATION, '  '],
      [Initiative.HOUSING, '  ']
    ])('%s outputs projectNumber "  " as %j', async (initiative, projectNumber) => {
      expect(
        (
          await runSchema(schemaFor(initiative), {
            activityType: 'Other',
            companyIdRegistered: '',
            companyNameRegistered: 'Test Co',
            projectName: '  p  ',
            projectNumber: '  '
          })
        ).value
      ).toEqual({
        activityType: 'Other',
        companyIdRegistered: null,
        companyNameRegistered: 'Test Co',
        projectName: 'p',
        projectNumber
      });
    });
  });

  describe('createElectrificationPanelSchema', () => {
    const schema = createElectrificationPanelSchema({ codeList, t }).electrification;

    it('requires the project type', async () => {
      expect((await runSchema(schema, {})).errors).toEqual({ projectType: 'Project type is a required field' });
    });

    it('rejects malformed values', async () => {
      expect(
        (
          await runSchema(schema, {
            bcEnvironmentAssessNeeded: 'Maybe',
            bcHydroNumber: LONG,
            hasEpa: 'Maybe',
            megawatts: 'abc',
            projectCategory: 'X',
            projectType: 'X'
          })
        ).errors
      ).toEqual({
        bcEnvironmentAssessNeeded: 'BC Environmental Assessment needed? must be one of the following values: Yes, No',
        bcHydroNumber: 'BC Hydro Call for Power project number must be at most 255 characters',
        hasEpa: 'Do they have an EPA? must be one of the following values: Yes, No',
        megawatts: 'Must be a valid number',
        projectCategory: 'Project category must be one of the following values: IPP',
        projectType: 'Project type must be one of the following values: IPP_SOLAR, OTHER'
      });
    });

    it('requires megawatts to be positive', async () => {
      expect((await runSchema(schema, { projectType: 'OTHER', megawatts: 0 })).errors).toEqual({
        megawatts: 'Must be greater than zero'
      });
    });

    it('casts megawatts and converts empty strings to null', async () => {
      expect((await runSchema(schema, { projectType: 'IPP_SOLAR', megawatts: '2.5' })).value).toEqual({
        projectType: 'IPP_SOLAR',
        megawatts: 2.5
      });
      expect(
        (
          await runSchema(schema, {
            bcEnvironmentAssessNeeded: '',
            bcHydroNumber: ' 1 ',
            hasEpa: 'Yes',
            megawatts: '',
            projectCategory: 'IPP',
            projectType: 'IPP_SOLAR'
          })
        ).value
      ).toEqual({
        bcEnvironmentAssessNeeded: null,
        bcHydroNumber: '1',
        hasEpa: 'Yes',
        megawatts: null,
        projectCategory: 'IPP',
        projectType: 'IPP_SOLAR'
      });
    });
  });

  describe('createLocationPanelSchema', () => {
    const schema = createLocationPanelSchema({ t }).location;

    it('requires natural disaster', async () => {
      expect((await runSchema(schema, {})).errors).toEqual({
        naturalDisaster: 'Affected by natural disaster is a required field'
      });
    });

    it('rejects malformed values', async () => {
      expect(
        (
          await runSchema(schema, {
            geomarkUrl: LONG,
            latitude: 1,
            locality: LONG,
            locationPids: LONG,
            longitude: 1,
            naturalDisaster: 'x',
            province: LONG,
            streetAddress: LONG
          })
        ).errors
      ).toEqual({
        geomarkUrl: 'Geomark URL must be at most 255 characters',
        latitude: 'Latitude must be greater than or equal to 48',
        locality: 'Locality must be at most 255 characters',
        locationPids: 'Location PID(s) must be at most 255 characters',
        longitude: 'Longitude must be less than or equal to -114',
        naturalDisaster: 'Affected by natural disaster must be one of the following values: Yes, No',
        province: 'Province must be at most 255 characters',
        streetAddress: 'Street address must be at most 255 characters'
      });
    });

    it('casts coordinates and converts blank text to null', async () => {
      expect(
        (
          await runSchema(schema, {
            latitude: '50',
            locationAddress: '',
            longitude: null,
            naturalDisaster: 'No',
            streetAddress: ' '
          })
        ).value
      ).toEqual({ latitude: 50, locationAddress: null, longitude: null, naturalDisaster: 'No', streetAddress: null });
    });
  });

  describe('simple text panels', () => {
    it('createLocationPidsPanelSchema converts empty to null', async () => {
      expect((await runSchema(createLocationPidsPanelSchema().locationPids, { auto: '' })).value).toEqual({
        auto: null
      });
    });

    it('createLocationDescriptionPanelSchema caps the description at 4000', async () => {
      expect(
        (
          await runSchema(createLocationDescriptionPanelSchema({ t }).locationDescription, {
            description: 'a'.repeat(4001)
          })
        ).errors
      ).toEqual({ description: 'Additional information about location must be at most 4000 characters' });
    });

    it('createAstNotesPanelSchema caps notes at 4000 and converts empty to null', async () => {
      const schema = createAstNotesPanelSchema({ t }).astNotes;

      expect((await runSchema(schema, { notes: 'a'.repeat(4001) })).errors).toEqual({
        notes: 'Automated Status Tool (AST) notes must be at most 4000 characters'
      });
      expect((await runSchema(schema, { notes: '' })).value).toEqual({ notes: null });
    });

    it('createRelatedEnquiriesPanelSchema accepts null', async () => {
      expect(await runSchema(createRelatedEnquiriesPanelSchema().relatedEnquiries, { csv: null })).toEqual({
        value: { csv: null },
        errors: {}
      });
    });
  });

  describe('createConsentPanelSchema', () => {
    it('createConsentPanelSchema requires Yes or No', async () => {
      const schema = createConsentPanelSchema({ t }).consent;

      expect((await runSchema(schema, {})).errors).toEqual({
        consentToFeedback: 'Consent to feedback is a required field'
      });
      expect((await runSchema(schema, { consentToFeedback: BasicResponse.UNSURE })).errors).toEqual({
        consentToFeedback: 'Consent to feedback must be one of the following values: Yes, No'
      });
    });
  });

  describe('createProjectDescriptionPanelSchema', () => {
    const schemaFor = (initiative: Initiative) =>
      createProjectDescriptionPanelSchema(options(initiative)).projectDescription;

    it.each([Initiative.GENERAL, Initiative.HOUSING])('%s requires a description', async (initiative) => {
      expect((await runSchema(schemaFor(initiative), { description: '  ' })).errors).toEqual({
        description: 'Additional information about project is a required field'
      });
    });

    // Known bug: when('project.projectType') resolves inside projectDescription, not the form root,
    // so the OTHER branch can never trigger
    it('ELECTRIFICATION never requires a description', async () => {
      expect((await runSchema(schemaFor(Initiative.ELECTRIFICATION), { description: '' })).errors).toEqual({});
    });
  });

  describe('createResidentialUnitsSchema', () => {
    const schema = createResidentialUnitsSchema({ t }).units;

    it('requires hasRentalUnits', async () => {
      expect((await runSchema(schema, {})).errors).toEqual({
        hasRentalUnits: 'Rental included is a required field'
      });
    });

    it('requires rental units when rentals are Yes and other units when an other type is described', async () => {
      expect(
        (await runSchema(schema, { hasRentalUnits: BasicResponse.YES, otherUnitsDescription: 'Townhouses' })).errors
      ).toEqual({
        otherUnits: 'Other type units is a required field',
        rentalUnits: 'Rental units is a required field'
      });
    });

    it('rejects values outside the unit list', async () => {
      expect(
        (
          await runSchema(schema, {
            hasRentalUnits: BasicResponse.YES,
            multiFamilyUnits: 'x',
            otherUnits: 'x',
            otherUnitsDescription: LONG,
            rentalUnits: 'x',
            singleFamilyUnits: 'x'
          })
        ).errors
      ).toEqual({
        multiFamilyUnits: `Multi-family units ${UNITS_ONE_OF}`,
        otherUnits: `Other type units ${UNITS_ONE_OF}`,
        otherUnitsDescription: 'Other type must be at most 255 characters',
        rentalUnits: `Rental units ${UNITS_ONE_OF}`,
        singleFamilyUnits: `Single family units ${UNITS_ONE_OF}`
      });
    });

    // The otherwise branches replace the schema, dropping the oneOf check
    it('accepts any rental and other units when their triggers are off', async () => {
      expect(
        (await runSchema(schema, { hasRentalUnits: BasicResponse.NO, otherUnits: 'x', rentalUnits: 'x' })).errors
      ).toEqual({});
    });

    it.each([null, ''])('does not require other units when the other type is %j', async (otherUnitsDescription) => {
      expect((await runSchema(schema, { hasRentalUnits: BasicResponse.NO, otherUnitsDescription })).errors).toEqual({});
    });

    it('accepts well-formed units', async () => {
      const units = {
        hasRentalUnits: BasicResponse.YES,
        multiFamilyUnits: null,
        otherUnits: UNITS,
        otherUnitsDescription: 'Townhouses',
        rentalUnits: UNITS,
        singleFamilyUnits: UNITS
      };

      expect(await runSchema(schema, units)).toEqual({ value: units, errors: {} });
    });
  });

  describe('createFinanciallySupportedPanelSchema', () => {
    const schema = createFinanciallySupportedPanelSchema({ t }).finance;
    const allYes = {
      financiallySupportedBc: BasicResponse.YES,
      financiallySupportedHousingCoop: BasicResponse.YES,
      financiallySupportedIndigenous: BasicResponse.YES,
      financiallySupportedNonProfit: BasicResponse.YES
    };

    it('requires every financially supported answer', async () => {
      expect((await runSchema(schema, {})).errors).toEqual({
        financiallySupportedBc: 'BC Housing is a required field',
        financiallySupportedHousingCoop: 'Housing co-operative is a required field',
        financiallySupportedIndigenous: 'Indigenous Housing Provider is a required field',
        financiallySupportedNonProfit: 'Non-profit housing society is a required field'
      });
    });

    it('requires descriptions when the answer is Yes', async () => {
      expect((await runSchema(schema, allYes)).errors).toEqual({
        housingCoopDescription: 'Name of Housing co-operative is a required field',
        indigenousDescription: 'Name of Indigenous Housing Provider is a required field',
        nonProfitDescription: 'Name of Non-profit housing society is a required field'
      });
    });

    it('caps descriptions at 255 when the answer is Yes', async () => {
      expect(
        (
          await runSchema(schema, {
            ...allYes,
            financiallySupportedBc: 'x',
            housingCoopDescription: LONG,
            indigenousDescription: LONG,
            nonProfitDescription: LONG
          })
        ).errors
      ).toEqual({
        financiallySupportedBc: 'BC Housing must be one of the following values: Yes, No, Unsure',
        housingCoopDescription: 'Name of Housing co-operative must be at most 255 characters',
        indigenousDescription: 'Name of Indigenous Housing Provider must be at most 255 characters',
        nonProfitDescription: 'Name of Non-profit housing society must be at most 255 characters'
      });
    });

    it('does not check descriptions when the answer is not Yes', async () => {
      expect(
        (
          await runSchema(schema, {
            financiallySupportedBc: BasicResponse.NO,
            financiallySupportedHousingCoop: BasicResponse.NO,
            financiallySupportedIndigenous: BasicResponse.UNSURE,
            financiallySupportedNonProfit: BasicResponse.NO,
            indigenousDescription: LONG
          })
        ).errors
      ).toEqual({});
    });
  });

  describe('createSubmissionStatePanelSchema', () => {
    const schemaFor = (initiative: Initiative) => createSubmissionStatePanelSchema(options(initiative)).submissionState;

    const commonErrors = {
      applicationStatus: 'Project state is a required field',
      assignedUser: 'Assigned to must be empty or a selected user',
      queuePriority: 'Priority is a required field',
      submissionType: 'Submission type is a required field'
    };

    it.each([Initiative.ELECTRIFICATION, Initiative.HOUSING])('%s requires the common fields', async (initiative) => {
      expect((await runSchema(schemaFor(initiative), {})).errors).toEqual(commonErrors);
    });

    it('GENERAL also requires area and region', async () => {
      expect((await runSchema(schemaFor(Initiative.GENERAL), {})).errors).toEqual({
        ...commonErrors,
        area: 'Area is a required field',
        region: 'Region is a required field'
      });
    });

    it('GENERAL rejects malformed values including area and region', async () => {
      expect(
        (
          await runSchema(schemaFor(Initiative.GENERAL), {
            applicationStatus: 'x',
            area: 'x',
            assignedUser: 'bob',
            queuePriority: 'x',
            region: 'x',
            submissionType: 'x'
          })
        ).errors
      ).toEqual({
        applicationStatus: 'Project state must be one of the following values: New, In Progress, Delayed, Completed',
        area: 'Area is a required field',
        assignedUser: 'Assigned to must be empty or a selected user',
        queuePriority: 'Priority must be a number',
        region: 'Region is a required field',
        submissionType: 'Submission type must be one of the following values: Guidance, Inapplicable'
      });
    });

    it.each([Initiative.ELECTRIFICATION, Initiative.HOUSING])('%s ignores area and region', async (initiative) => {
      expect(
        (await runSchema(schemaFor(initiative), { ...validSubmissionState, area: 'x', region: 'x' })).errors
      ).toEqual({});
    });

    // The priority Select clears to null
    it('treats a cleared queue priority as missing', async () => {
      expect(
        (await runSchema(schemaFor(Initiative.GENERAL), { ...validSubmissionState, queuePriority: null })).errors
      ).toEqual({ queuePriority: 'Priority is a required field' });
    });

    it('casts the queue priority', async () => {
      expect(
        (await runSchema(schemaFor(Initiative.GENERAL), { ...validSubmissionState, queuePriority: '2' })).value
      ).toEqual(validSubmissionState);
    });
  });

  describe('createAtsInfoPanelSchema', () => {
    const schemaFor = (initiative: Initiative) => createAtsInfoPanelSchema(options(initiative)).atsInfo;

    it.each([Initiative.GENERAL, Initiative.ELECTRIFICATION, Initiative.HOUSING])(
      '%s accepts nulls',
      async (initiative) => {
        const atsInfo = { atsClientId: null, atsEnquiryId: null, businessArea: null };

        expect(await runSchema(schemaFor(initiative), atsInfo)).toEqual({ value: atsInfo, errors: {} });
      }
    );

    it('GENERAL checks the business area against the code list', async () => {
      const { errors } = await runSchema(schemaFor(Initiative.GENERAL), {
        atsClientId: -1,
        atsEnquiryId: 'x',
        businessArea: 'NOPE'
      });

      expect(Object.keys(errors).sort()).toEqual(['atsClientId', 'atsEnquiryId', 'businessArea']);
      expect(errors).toMatchObject({
        atsClientId: 'ATS Client # must be greater than or equal to 0',
        businessArea: 'Business area must be one of the following values: AGRICULTURE'
      });
    });

    it.each([Initiative.ELECTRIFICATION, Initiative.HOUSING])('%s ignores the business area', async (initiative) => {
      expect((await runSchema(schemaFor(initiative), { businessArea: 'NOPE' })).errors).toEqual({});
    });
  });

  describe('createProjectAreasUpdatedSchema', () => {
    const ADDED_TO_ATS_REQUIRED = 'Authorized Tracking System (ATS) updated is a required field';
    const LTSA_REQUIRED = 'Land Title Survey Authority (LTSA) completed is a required field';

    const schemaFor = (initiative: Initiative) =>
      createProjectAreasUpdatedSchema(options(initiative)).projectAreasUpdated;

    it.each([
      [Initiative.GENERAL, { aaiUpdated: AAI_REQUIRED }],
      [Initiative.ELECTRIFICATION, { aaiUpdated: AAI_REQUIRED, addedToAts: ADDED_TO_ATS_REQUIRED }],
      [
        Initiative.HOUSING,
        {
          aaiUpdated: AAI_REQUIRED,
          addedToAts: ADDED_TO_ATS_REQUIRED,
          ltsaCompleted: LTSA_REQUIRED,
          bcOnlineCompleted: 'BC Online completed is a required field'
        }
      ]
    ])('%s requires its initiative specific flags', async (initiative, errors) => {
      expect((await runSchema(schemaFor(initiative), {})).errors).toEqual(errors);
    });

    it('accepts false flags', async () => {
      const flags = { aaiUpdated: false, addedToAts: false, ltsaCompleted: false, bcOnlineCompleted: false };

      expect(await runSchema(schemaFor(Initiative.HOUSING), flags)).toEqual({ value: flags, errors: {} });
    });
  });
});
