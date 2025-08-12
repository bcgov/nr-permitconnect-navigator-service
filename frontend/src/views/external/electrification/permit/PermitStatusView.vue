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
import { Button, useToast } from '@/lib/primevue';
import { useProjectStore, usePermitStore } from '@/store';
import { NavigationPermission, useAuthZStore } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';
import { PermitAuthorizationStatus } from '@/utils/enums/permit';

import { contactService, electrificationProjectService, permitService } from '@/services';

import type { Ref } from 'vue';
import type { User } from '@/types';

// Props
const { permitId, projectId } = defineProps<{
  permitId: string;
  projectId: string;
}>();

// Composables
const { t } = useI18n();
const router = useRouter();
const toast = useToast();

// Store
const authZStore = useAuthZStore();
const permitStore = usePermitStore();
const projectStore = useProjectStore();
const { canNavigate } = storeToRefs(authZStore);
const { getPermit } = storeToRefs(permitStore);
const { getProject } = storeToRefs(projectStore);

// State
const assignedNavigator: Ref<User | undefined> = ref(undefined);
const descriptionModalVisible: Ref<boolean> = ref(false);
const updatedBy: Ref<string | undefined> = ref(undefined);

// Actions
const hideTimelineFromScreenReader = computed(() => {
  return (
    getPermit?.value &&
    (getPermit.value.authStatus === PermitAuthorizationStatus.ABANDONED ||
      getPermit.value.authStatus === PermitAuthorizationStatus.CANCELLED ||
      getPermit.value.authStatus === PermitAuthorizationStatus.WITHDRAWN)
  );
});

onBeforeMount(async () => {
  try {
    const permitData = (await permitService.getPermit(permitId)).data;
    permitStore.setPermit(permitData);

    if (!getProject.value) {
      const submission = (await electrificationProjectService.getProject(projectId)).data;
      projectStore.setProject(submission);
    }

    if (getProject.value?.assignedUserId) {
      assignedNavigator.value = (
        await contactService.searchContacts({ userId: [getProject.value.assignedUserId] })
      ).data[0];
    }

    if (getPermit.value?.updatedBy) {
      const updatedByUser = (await contactService.searchContacts({ userId: [getPermit.value.updatedBy] })).data[0];
      updatedBy.value = updatedByUser.firstName + ' ' + updatedByUser.lastName;
    }
  } catch {
    toast.error(t('e.common.permitStatusView.unableToLoad'));
  }
});
</script>

<template>
  <div class="permit-status-view">
    <div class="flex justify-between mb-5 mt-10">
      <div>
        <h1 class="mt-0 mb-0">{{ getPermit?.permitType.name }}</h1>
      </div>
      <Button
        v-if="canNavigate(NavigationPermission.EXT_ELECTRIFICATION)"
        class="p-button-sm header-btn mt-3"
        :label="t('e.common.permitStatusView.askNav')"
        @click="
          router.push({
            name: RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT_ENQUIRY,
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
</template>
