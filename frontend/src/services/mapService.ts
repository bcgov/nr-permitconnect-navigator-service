import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

const PATH = 'map';

export default {
  /**
   * @function getPIDs
   * getPIDs - Get the PIDs for a submission
   * @returns {Promise<data | null>} The result of calling the get api
   */
  getPIDs(housingProjectId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/pids/${housingProjectId}`);
  }
};
