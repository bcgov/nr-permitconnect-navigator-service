import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

const PATH = 'map';

export default {
  /**
   * Get the PIDs for a project
   * @param projectId The ID of the project
   * @returns {Promise} An axios response
   */
  getPIDs(projectId: string) {
    return appAxios().get(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/pids/${projectId}`);
  }
};
