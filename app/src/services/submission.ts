/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';
import proj4 from 'proj4';

import prisma from '../db/dataConnection';
import { submission } from '../db/models';
import { BasicResponse, Initiative } from '../utils/enums/application';
import { ApplicationStatus } from '../utils/enums/housing';
import { getChefsApiKey } from '../utils/utils';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { IStamps } from '../interfaces/IStamps';
import type { Submission, SubmissionSearchParameters } from '../types';

/**
 * @function chefsAxios
 * Returns an Axios instance for the CHEFS API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function chefsAxios(formId: string, options: AxiosRequestConfig = {}): AxiosInstance {
  return axios.create({
    baseURL: config.get('server.chefs.apiPath'),
    timeout: 10000,
    auth: { username: formId, password: getChefsApiKey(formId) ?? '' },
    ...options
  });
}

/**
 * @function openMapsAxios
 * Returns an Axios instance for the CHEFS API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function openMapsAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  return axios.create({
    baseURL: config.get('server.openMaps.apiPath'),
    timeout: 10000,
    ...options
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPolygonArray(geoJSON: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polygonArray = geoJSON.geometry.coordinates[0].map((c: any) => {
    return { lat: c[1], lng: c[0] };
  });
  return polygonArray;
}

/**
 * @function getParcelDataFromPMBC
 * DataBC’s Open Web Services
 * Accessing geographic data via WMS/WFS
 * Services Provided by OCIO - Digital Platforms & Data - Data Systems & Services
 * ref: https://docs.geoserver.org/main/en/user/services/wfs/reference.html#getfeature
 * ref: https://catalogue.data.gov.bc.ca/dataset/parcelmap-bc-parcel-fabric
 * @returns parcel data in JSON
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPIDs(polygon: Array<any>) {
  // const { getConfig } = storeToRefs(useConfigStore());
  // close polygon by re-adding first point to end of array
  // const points = polygon.concat(polygon[0]);

  // define the source and destination layer types
  // leaflet map layer
  const source = proj4.Proj('EPSG:4326'); // gps format of leaflet map
  // projection (BC Parcel data layer)
  proj4.defs(
    'EPSG:3005',
    'PROJCS["NAD83 / BC Albers", GEOGCS["NAD83", DATUM["North_American_Datum_1983", SPHEROID["GRS 1980",6378137,298.257222101, AUTHORITY["EPSG","7019"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY["EPSG","6269"]], PRIMEM["Greenwich",0, AUTHORITY["EPSG","8901"]], UNIT["degree",0.0174532925199433, AUTHORITY["EPSG","9122"]], AUTHORITY["EPSG","4269"]], PROJECTION["Albers_Conic_Equal_Area"], PARAMETER["standard_parallel_1",50], PARAMETER["standard_parallel_2",58.5], PARAMETER["latitude_of_center",45], PARAMETER["longitude_of_center",-126], PARAMETER["false_easting",1000000], PARAMETER["false_northing",0], UNIT["metre",1, AUTHORITY["EPSG","9001"]], AXIS["Easting",EAST], AXIS["Northing",NORTH], AUTHORITY["EPSG","3005"]]'
  );
  const dest = proj4.Proj('EPSG:3005');

  // convert lat/long for WFS query
  const result = polygon.map((point) => {
    //@ts-expect-error please help
    return proj4(source, dest, { x: point.lng, y: point.lat });
  });

  // built query string for WFS request
  let query = '';
  result.forEach((point, index, array) => {
    query = query.concat(point.x, ' ', point.y);
    if (index < array.length - 1) query = query.concat(', ');
  });

  let params =
    '/geo/pub/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&outputFormat=json&typeName=WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW&CQL_FILTER=INTERSECTS(SHAPE, POLYGON ((query)))';

  params = params.replace('query', query);

  // return params;

  const response = await openMapsAxios().get(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcelData = response.data.features?.map((f: any) => f.properties);
  // get comma separated PIDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PIDs = parcelData.map((p: any) => p.PID_FORMATTED).join(',');

  return PIDs;
}

const service = {
  /**
   * @function createSubmission
   * Creates a new submission
   * @returns {Promise<Partial<Submission>>} The result of running the transaction
   */
  createSubmission: async (data: Partial<Submission>) => {
    const polygonArray = getPolygonArray(data.geoJSON);
    const PIDs = await getPIDs(polygonArray);
    data.locationPIDsAuto = PIDs;
    const response = await prisma.submission.create({
      //@ts-expect-error please help
      data: { ...submission.toPrismaModel(data as Submission), created_at: data.createdAt, created_by: data.createdBy },
      include: {
        activity: {
          include: {
            activity_contact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
    //@ts-expect-error please help
    return submission.fromPrismaModelWithContact(response);
  },

  /**
   * @function createSubmissionsFromExport
   * Creates the given activities and submissions from exported CHEFS data
   * @param {Array<Partial<Submission>>} submissions Array of Submissions
   * @returns {Promise<void>} The result of running the transaction
   */
  createSubmissionsFromExport: async (submissions: Array<Partial<Submission>>) => {
    await prisma.$transaction(async (trx) => {
      const initiative = await trx.initiative.findFirstOrThrow({
        where: {
          code: Initiative.HOUSING
        }
      });

      await trx.activity.createMany({
        data: submissions.map((x) => ({
          activity_id: x.activityId as string,
          initiative_id: initiative.initiative_id,
          is_deleted: false
        }))
      });

      await trx.submission.createMany({
        data: submissions.map((x) => ({
          submission_id: x.submissionId as string,
          activity_id: x.activityId as string,
          application_status: ApplicationStatus.NEW,
          company_name_registered: x.companyNameRegistered,
          financially_supported: x.financiallySupported,
          financially_supported_bc: x.financiallySupportedBC,
          financially_supported_indigenous: x.financiallySupportedIndigenous,
          financially_supported_non_profit: x.financiallySupportedNonProfit,
          financially_supported_housing_coop: x.financiallySupportedHousingCoop,
          has_applied_provincial_permits: x.hasAppliedProvincialPermits,
          housing_coop_description: x.housingCoopDescription,
          indigenous_description: x.indigenousDescription,
          is_developed_by_company_or_org: x.isDevelopedByCompanyOrOrg,
          is_developed_in_bc: x.isDevelopedInBC,
          intake_status: x.intakeStatus,
          location_pids: x.locationPIDs,
          latitude: parseFloat(x.latitude as unknown as string),
          locality: x.locality,
          longitude: parseFloat(x.longitude as unknown as string),
          natural_disaster: x.naturalDisaster === BasicResponse.YES ? true : false,
          non_profit_description: x.nonProfitDescription,
          project_location: x.projectLocation,
          project_name: x.projectName,
          project_description: x.projectDescription,
          province: x.province,
          queue_priority: x.queuePriority,
          rental_units: x.rentalUnits?.toString(),
          single_family_units: x.singleFamilyUnits,
          multi_family_units: x.multiFamilyUnits,
          other_units: x.otherUnits,
          other_units_description: x.otherUnitsDescription,
          has_rental_units: x.hasRentalUnits,
          street_address: x.streetAddress,
          submitted_at: new Date(x.submittedAt ?? Date.now()),
          submitted_by: x.submittedBy as string
        }))
      });
    });
  },

  /**
   * @function deleteSubmission
   * Deletes the submission, followed by the associated activity
   * This action will cascade delete across all linked items
   * @param {string} submissionId Submission ID
   * @returns {Promise<Submission>} The result of running the delete operation
   */
  deleteSubmission: async (submissionId: string) => {
    const response = await prisma.$transaction(async (trx) => {
      const del = await trx.submission.delete({
        where: {
          submission_id: submissionId
        },
        include: {
          activity: {
            include: {
              activity_contact: {
                include: {
                  contact: true
                }
              }
            }
          }
        }
      });

      await trx.activity.delete({
        where: {
          activity_id: del.activity_id
        }
      });

      return del;
    });

    return submission.fromPrismaModelWithContact(response);
  },

  /**
   * @function getSubmission
   * Gets a full data export for the requested CHEFS form
   * @param {string} formId CHEFS form id
   * @returns {Promise<any>} The result of running the get operation
   */
  getFormExport: async (formId: string) => {
    try {
      const response = await chefsAxios(formId).get(`forms/${formId}/export`, {
        params: { format: 'json', type: 'submissions' }
      });
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getStatistics
   * Gets a set of submission related statistics
   * @returns {Promise<object>} The result of running the query
   */
  getStatistics: async (filters: { dateFrom: string; dateTo: string; monthYear: string; userId: string }) => {
    // Return a single quoted string or null for the given value
    const val = (value: unknown) => (value ? `'${value}'` : null);

    const date_from = val(filters.dateFrom);
    const date_to = val(filters.dateTo);
    const month_year = val(filters.monthYear);
    const user_id = filters.userId?.length ? filters.userId : null;

    /* eslint-disable max-len */
    const response =
      await prisma.$queryRaw`select * from get_activity_statistics(${date_from}, ${date_to}, ${month_year}, ${user_id}::uuid)`;
    /* eslint-enable max-len */

    // count() returns BigInt
    // JSON.stringify() doesn't know how to serialize BigInt
    // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
    return JSON.parse(JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)));
  },

  /**
   * @function getSubmission
   * Gets a specific submission from the PCNS database
   * @param {string} submissionId PCNS Submission ID
   * @returns {Promise<Submission | null>} The result of running the findFirst operation
   */
  getSubmission: async (submissionId: string) => {
    try {
      const result = await prisma.submission.findFirst({
        where: {
          submission_id: submissionId
        },
        include: {
          activity: {
            include: {
              activity_contact: {
                include: {
                  contact: true
                }
              }
            }
          }
        }
      });

      return result ? submission.fromPrismaModelWithContact(result) : null;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getSubmissions
   * Gets a list of submissions
   * @returns {Promise<(Submission | null)[]>} The result of running the findMany operation
   */
  getSubmissions: async () => {
    try {
      const result = await prisma.submission.findMany({
        include: {
          activity: {
            include: {
              activity_contact: {
                include: {
                  contact: true
                }
              }
            }
          },
          user: true
        }
      });

      return result.map((x) => submission.fromPrismaModelWithUser(x));
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function searchSubmissions
   * Search and filter for specific submission
   * @param {string[]} [params.activityId] Optional array of uuids representing the activity ID
   * @param {string[]} [params.intakeStatus] Optional array of strings representing the intake status
   * @param {boolean}  [params.includeUser] Optional boolean representing whether the linked user should be included
   * @param {string[]} [params.submissionId] Optional array of uuids representing the submission ID
   * @param {string[]} [params.submissionType] Optional array of strings representing the submission type
   * @returns {Promise<(Submission | null)[]>} The result of running the findMany operation
   */
  searchSubmissions: async (params: SubmissionSearchParameters) => {
    let result = await prisma.submission.findMany({
      include: {
        activity: {
          include: {
            activity_contact: {
              include: {
                contact: true
              }
            }
          }
        },
        user: params.includeUser
      },
      where: {
        AND: [
          {
            activity_id: { in: params.activityId }
          },
          {
            intake_status: { in: params.intakeStatus }
          },
          {
            submission_id: { in: params.submissionId }
          },
          {
            submission_type: { in: params.submissionType }
          }
        ]
      }
    });

    // Remove soft deleted submissions
    if (!params.includeDeleted) result = result.filter((x) => !x.activity.is_deleted);

    const submissions = params.includeUser
      ? result.map((x) => submission.fromPrismaModelWithUser(x))
      : result.map((x) => submission.fromPrismaModelWithContact(x));

    return submissions;
  },

  /**
   * @function updateIsDeletedFlag
   * Updates is_deleted flag for the corresponding activity
   * @param {string} submissionId Submission ID
   * @param {string} isDeleted flag
   * @returns {Promise<Submission>} The result of running the delete operation
   */
  updateIsDeletedFlag: async (submissionId: string, isDeleted: boolean, updateStamp: Partial<IStamps>) => {
    const deleteSubmission = await prisma.submission.findUnique({
      where: {
        submission_id: submissionId
      },
      include: {
        activity: {
          include: {
            activity_contact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });

    if (deleteSubmission) {
      await prisma.activity.update({
        data: { is_deleted: isDeleted, updated_at: updateStamp.updatedAt, updated_by: updateStamp.updatedBy },
        where: {
          activity_id: deleteSubmission?.activity_id
        }
      });
      return submission.fromPrismaModelWithContact(deleteSubmission);
    }
  },

  /**
   * @function updateSubmission
   * Updates a specific submission
   * @param {Submission} data Submission to update
   * @returns {Promise<Submission | null>} The result of running the update operation
   */
  updateSubmission: async (data: Submission) => {
    try {
      const result = await prisma.submission.update({
        //@ts-expect-error please help
        data: { ...submission.toPrismaModel(data), updated_at: data.updatedAt, updated_by: data.updatedBy },
        where: {
          submission_id: data.submissionId
        },
        include: {
          activity: {
            include: {
              activity_contact: {
                include: {
                  contact: true
                }
              }
            }
          }
        }
      });
      //@ts-expect-error please help
      return submission.fromPrismaModelWithContact(result);
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
