import axios from 'axios';
import config from 'config';

import { Action, GroupName } from '../utils/enums/application.ts';
import { Problem, uuidValidateV4 } from '../utils/index.ts';
import { getSubjectGroups } from './yars.ts';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { PrismaTransactionClient } from '../db/database.ts';
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

    options.headers ??= {};
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
 * @param sub The subject to search for
 * @returns The COMS response
 */
export const searchUser = async (currentContext: CurrentContext, sub: string) => {
  try {
    const { status, headers, data } = await comsAxios({
      headers: { Authorization: `Bearer ${currentContext.bearerToken}` }
    }).get('/user', { params: { username: sub } });
    return { status, headers, data };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const detail = e.response?.data.detail;
      const status = e.response ? e.response.status : 500;
      throw new Problem(status, { detail }, { extra: { comsError: e.response?.data } });
    } else if (e instanceof Error) {
      throw new Problem(500, { detail: e.message });
    } else {
      throw new Problem(500, { detail: 'Server Error' });
    }
  }
};

/**
 * Obtain the current users bucket permissions
 * @param currentContext The current context of the Express request
 * @param sub The subject to check permissions for
 * @returns The COMS response with the data filtered to a unique Set
 */
export const searchUserBucketPermissions = async (currentContext: CurrentContext, sub: string) => {
  try {
    const [user, bucket] = await Promise.all([searchUser(currentContext, sub), getBucket()]);

    const userId = user.data?.[0]?.userId;
    const bucketId = bucket.data?.bucketId;

    if (!userId || !bucketId) {
      throw new Error('Unable to obtain userId or bucketId');
    }

    const { status, headers, data } = await comsAxios({
      headers: { Authorization: `Bearer ${currentContext.bearerToken}` }
    }).get('/permission/bucket', { params: { bucketId, userId } });

    // Get just the codes - never touch COMS `MANAGE` permission
    const perms = (data[0]?.permissions ?? [])
      .map((x: { permCode: string }) => x.permCode)
      .filter((perm: string) => perm !== 'MANAGE');

    return { status, headers, data: { userId, bucketId, perms: new Set<Action>(perms) } };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const detail = e.response?.data.detail;
      const status = e.response ? e.response.status : 500;
      throw new Problem(status, { detail }, { extra: { comsError: e.response?.data } });
    } else if (e instanceof Error) {
      throw new Problem(500, { detail: e.message });
    } else {
      throw new Problem(500, { detail: 'Server Error' });
    }
  }
};

/**
 * Assigns COMS permissions to the current user based on their current groups
 * @param tx Prisma transaction client
 * @param currentContext The current context of the Express request
 * @param sub The subject to be assigned permissions
 */
export const assignPermissions = async (
  tx: PrismaTransactionClient,
  currentContext: CurrentContext,
  sub: string
): Promise<void> => {
  if (!sub) {
    throw new Problem(403, {
      detail: 'No sub provided'
    });
  }

  const groups = await getSubjectGroups(tx, sub);
  const groupNames = new Set(groups.map((x) => x.name));

  const required = new Set<Action>([...groupNames].flatMap((groupName) => COMS_PERM_MAP.get(groupName) ?? []));
  const {
    data: { userId, bucketId, perms: current }
  } = await searchUserBucketPermissions(currentContext, sub);

  const areEqual = current.size === required.size && [...current].every((x) => required.has(x));

  if (!areEqual && currentContext) {
    try {
      if (!userId || !bucketId) {
        throw new Error('Unable to obtain userId or bucketId');
      }

      const toRemove = [...current].filter((x) => !required.has(x));
      const toAdd = [...required].filter((x) => !current.has(x));

      // Delete non matching permissions
      // Length check required - providing empty array to COMS removes all permissions
      if (toRemove.length > 0) {
        await comsAxios().delete(`/permission/bucket/${bucketId}`, {
          params: { permCode: toRemove, userId }
        });
      }

      // Assign new permissions
      if (toAdd.length > 0) {
        await comsAxios().put(
          `/permission/bucket/${bucketId}`,
          toAdd.map((x) => ({
            permCode: x,
            userId
          }))
        );
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const detail = e.response?.data.detail;
        const status = e.response ? e.response.status : 500;
        throw new Problem(status, { detail }, { extra: { comsError: e.response?.data } });
      } else if (e instanceof Error) {
        throw new Problem(500, { detail: e.message });
      } else {
        throw new Problem(500, { detail: 'Server Error' });
      }
    }
  }
};
