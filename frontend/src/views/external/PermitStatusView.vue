<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { computed, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import AuthorizationInfoProponent from '@/components/authorization/AuthorizationInfoProponent.vue';
import AuthorizationStatusDescriptionModal from '@/components/authorization/AuthorizationStatusDescriptionModal.vue';
import AuthorizationTrackerCard from '@/components/authorization/AuthorizationTrackerCard.vue';
import AuthorizationUpdateHistory from '@/components/authorization/AuthorizationUpdateHistory.vue';
import { AskMyNavigator } from '@/components/common/icons';
import { Button } from '@/lib/primevue';
import { contactService, electrificationProjectService, housingProjectService, permitService } from '@/services';
import { useProjectStore, usePermitStore, useAppStore } from '@/store';
import { NavigationPermission, useAuthZStore } from '@/store/authzStore';
import { Initiative, RouteName } from '@/utils/enums/application';
import { PermitState } from '@/utils/enums/permit';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IProjectService } from '@/interfaces/IProjectService';

// Props
const { permitId, projectId } = defineProps<{
  permitId: string;
  projectId: string;
}>();

// Interfaces
interface InitiativeState {
  enquiryPermitRouteName: RouteName;
  initiativeNavigationPermission: NavigationPermission;
  projectService: IProjectService;
}

// Constants
const ELECTRIFICATION_VIEW_STATE: InitiativeState = {
  enquiryPermitRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT_ENQUIRY,
  initiativeNavigationPermission: NavigationPermission.EXT_ELECTRIFICATION,
  projectService: electrificationProjectService
};

const HOUSING_VIEW_STATE: InitiativeState = {
  enquiryPermitRouteName: RouteName.EXT_HOUSING_PROJECT_PERMIT_ENQUIRY,
  initiativeNavigationPermission: NavigationPermission.EXT_HOUSING,
  projectService: housingProjectService
};

// Composables
const { t } = useI18n();
const router = useRouter();

// Store
const authZStore = useAuthZStore();
const permitStore = usePermitStore();
const projectStore = useProjectStore();
const { getInitiative } = storeToRefs(useAppStore());
const { canNavigate } = storeToRefs(authZStore);
const { getPermit } = storeToRefs(permitStore);
const { getProject } = storeToRefs(projectStore);

// State
const descriptionModalVisible: Ref<boolean> = ref(false);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_VIEW_STATE);
const updatedBy: Ref<string | undefined> = ref(undefined);

// Actions
const hideTimelineFromScreenReader = computed(() => {
  return (
    getPermit?.value &&
    (getPermit.value.state === PermitState.CANCELLED || getPermit.value.state === PermitState.WITHDRAWN)
  );
});

onBeforeMount(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_VIEW_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_VIEW_STATE;
        break;
      default:
        throw new Error(t('i.common.view.initiativeStateError'));
    }

    try {
      const permitData = (await permitService.getPermit(permitId)).data;
      permitStore.setPermit(permitData);

      if (!getProject.value) {
        const submission = (await initiativeState.value.projectService.getProject(projectId)).data;
        projectStore.setProject(submission);
      }

      if (getPermit.value?.updatedBy) {
        const updatedByUser = (await contactService.searchContacts({ userId: [getPermit.value.updatedBy] })).data[0];
        if (updatedByUser) updatedBy.value = updatedByUser.firstName + ' ' + updatedByUser.lastName;
      }
    } catch {
      throw new Error(t('e.common.permitStatusView.unableToLoad'));
    }
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div>
    <div class="permit-status-view">
      <div class="flex justify-between mb-5 mt-10">
        <div>
          <h1 class="mt-0 mb-0">{{ getPermit?.permitType?.name }}</h1>
        </div>
        <Button
          v-if="canNavigate(initiativeState.initiativeNavigationPermission)"
          class="p-button-sm max-h-8 mt-3"
          :label="t('e.common.permitStatusView.askNav')"
          @click="
            router.push({
              name: initiativeState.enquiryPermitRouteName,
              params: { permitId, projectId }
            })
          "
        >
          <AskMyNavigator />
          {{ t('e.common.permitStatusView.askNav') }}
        </Button>
      </div>

      <AuthorizationInfoProponent
        v-if="getPermit"
        :permit="getPermit"
      />
      <h3
        class="mt-14 mb-8"
        :aria-hidden="hideTimelineFromScreenReader"
      >
        {{ t('e.common.permitStatusView.applicationProgress') }}
      </h3>
      <AuthorizationTrackerCard
        v-if="getPermit"
        :permit="getPermit"
      />
      <h4 class="mb-8 mt-14">{{ t('e.common.permitStatusView.updateHistory') }}</h4>
      <AuthorizationUpdateHistory
        v-if="getPermit?.permitNote && getPermit.permitNote.length > 0"
        :authorization-notes="getPermit.permitNote"
      />
    </div>
    <AuthorizationStatusDescriptionModal
      v-model:visible="descriptionModalVisible"
      dismissable-mask
    />
  </div>
</template>
