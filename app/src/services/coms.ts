import axios from 'axios';
import config from 'config';

import { Action, GroupName } from '../utils/enums/application.ts';
import { getCurrentSubject, Problem, uuidValidateV4 } from '../utils/index.ts';
import { getSubjectGroups } from './yars.ts';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { CurrentContext } from '../types/stuff';

/**
 * PCNS Groups to COMS Permission mappings
 */
const COMS_PERM_MAP = new Map<GroupName, Action[]>([
  [GroupName.PROPONENT, [Action.CREATE]],
  [GroupName.NAVIGATOR_READ_ONLY, [Action.READ]],
  [GroupName.NAVIGATOR, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]],
  [GroupName.SUPERVISOR, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]],
  [GroupName.ADMIN, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]],
  [GroupName.DEVELOPER, [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]]
]);

/**
 * Returns an Axios instance for the COMS API
 * Injects pseudo service account basic auth if no other auth provided
 * @param options Axios request config options
 * @returns An axios instance
 */
function comsAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  // Inject pseudo service account if no other auth provided
  if (!options.headers?.Authorization) {
    const ak = config.get<string>('server.objectStorage.accessKeyId');
    const sak = config.get<string>('server.objectStorage.secretAccessKey');
    const b64 = Buffer.from(ak + ':' + sak).toString('base64');

    if (!options.headers) options.headers = {};
    options.headers.Authorization = `Basic ${b64}`;
    options.headers['x-amz-bucket'] = config.get('server.objectStorage.bucket');
    options.headers['x-amz-endpoint'] = config.get('server.objectStorage.endpoint');
  }

  // Create axios instance
  const instance = axios.create({
    baseURL: config.get('frontend.coms.apiPath'),
    timeout: 10000,
    ...options
  });

  return instance;
}

/**
 * Obtain a bucket record. This actually utilizes the COMS create bucket endpoint as its the only way to
 * obtain full bucket information using their pseudo service account access.
 * @returns The created bucket data
 */
export const getBucket = async () => {
  const { status, headers, data } = await comsAxios().put('/bucket', {
    accessKeyId: config.get('server.objectStorage.accessKeyId'),
    bucket: config.get('server.objectStorage.bucket'),
    bucketName: 'PCNS',
    endpoint: config.get('server.objectStorage.endpoint'),
    secretAccessKey: config.get('server.objectStorage.secretAccessKey'),
    key: config.get('server.objectStorage.key')
  });
  return { status, headers, data };
};

/**
 * Get an object
 * @param bearerToken The bearer token of the authorized user
 * @param objectId The id for the object to get
 * @returns The obtained object data
 */
export const getObject = async (bearerToken: string, objectId: string) => {
  if (!uuidValidateV4(objectId)) {
    throw new Problem(422, { detail: 'Invalid objectId parameter' });
  }
  const { status, headers, data } = await comsAxios({
    responseType: 'arraybuffer',
    headers: { Authorization: `Bearer ${bearerToken}` }
  }).get(`/object/${objectId}`);
  return { status, headers, data };
};

/**
 * Obtain the current user information in COMS
 * @param currentContext The current context of the Express request
 * @returns The COMS response
 */
export const searchUser = async (currentContext: CurrentContext) => {
  const { status, headers, data } = await comsAxios({
    headers: { Authorization: `Bearer ${currentContext.bearerToken}` }
    // Update to use username (sub) if COMS ever opens that up
  }).get('/user', { params: { identityId: getCurrentSubject(currentContext).split('@')[0].toUpperCase() } });
  return { status, headers, data };
};

/**
 * Assigns COMS permissions to the current user based on their current groups
 * @param tx Prisma transaction client
 * @param currentContext The current context of the Express request
 */
export const assignPermissions = async (tx: PrismaTransactionClient, currentContext: CurrentContext) => {
  const sub = currentContext.tokenPayload?.sub;

  if (!sub) {
    throw new Problem(403, {
      detail: 'Unable to obtain token sub'
    });
  }

  const groups = await getSubjectGroups(tx, sub);
  const groupNames = new Set(groups.map((x) => x.name));

  const actions = new Set<Action>([...groupNames].flatMap((groupName) => COMS_PERM_MAP.get(groupName) ?? []));

  if (actions.size > 0 && currentContext) {
    try {
      const [user, bucket] = await Promise.all([searchUser(currentContext), getBucket()]);

      const { userId } = user.data[0];
      const { bucketId } = bucket.data;

      if (!userId || !bucketId) {
        throw new Error('Unable to obtain userId or bucketId');
      }

      const permissions = [...actions].flatMap((action) => ({ permCode: action, userId }));

      await comsAxios().put(`/permission/bucket/${bucketId}`, permissions);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const detail = e.response?.data.detail;
        const status = e.response ? e.response.status : 500;
        throw new Problem(status, { detail }, { extra: { comsError: e.response?.data } });
      } else {
        throw new Problem(500, { detail: 'Server Error' });
      }
    }
  }
};
