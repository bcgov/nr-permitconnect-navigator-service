<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AuthorizationCard from '@/components/authorization/AuthorizationCard.vue';
import AuthorizationCardLite from '@/components/authorization/AuthorizationCardLite.vue';
import { Button } from '@/lib/primevue';
import { useAppStore, useAuthZStore, useProjectStore } from '@/store';
import { Action, Resource } from '@/utils/enums/application';
import { projectAuthorizationRouteNameKey } from '@/utils/keys';

// Injections
const projectAuthorizationRouteName = inject(projectAuthorizationRouteNameKey);

// Composables
const { t } = useI18n();
const router = useRouter();

// Store
const { getInitiative } = storeToRefs(useAppStore());
const projectStore = useProjectStore();
const {
  getAuthsCompleted,
  getAuthsNeeded,
  getAuthsNotNeeded,
  getAuthsOnGoing,
  getAuthsUnderInvestigation,
  getProject,
  getProjectIsCompleted,
  getPermits
} = storeToRefs(projectStore);

// State

// Actions
function toAuthorization(authId: string) {
  router.push({
    name: projectAuthorizationRouteName?.value,
    params: {
      permitId: authId,
      projectId: getProject.value?.projectId
    }
  });
}
</script>

<template>
  <div>
    <div class="flex items-center pb-5">
      <div class="grow">
        <p class="font-bold">{{ t('views.i.projectView.applicableAuthorizations') }} ({{ getPermits.length }})</p>
      </div>
      <Button
        data-test-id="add-authorization-button"
        :aria-label="t('views.i.projectView.addAuthorization')"
        :disabled="getProjectIsCompleted || !useAuthZStore().can(getInitiative, Resource.PERMIT, Action.CREATE)"
        @click="
          router.push({
            name: projectAuthorizationRouteName,
            params: {
              projectId: getProject?.projectId
            }
          })
        "
      >
        <font-awesome-icon
          class="pr-2"
          icon="fa-solid fa-plus"
        />
        {{ t('views.i.projectView.addAuthorization') }}
      </Button>
    </div>
    <!-- On going Authorizations -->
    <div
      v-for="(permit, index) in getAuthsOnGoing"
      :id="permit.permitId"
      :key="permit.permitId"
      :index="index"
      class="mb-6 mt-6"
    >
      <AuthorizationCard
        :editable="!getProjectIsCompleted"
        :permit="permit"
        @authorization-card:more="toAuthorization(permit.permitId)"
      />
    </div>
    <!-- Authorizations with needed = under investigation -->
    <div
      v-if="getAuthsUnderInvestigation.length > 0"
      class="mb-8 mt-16"
    >
      <h4 class="mb-6">{{ t('views.i.projectView.underInvestigation') }}</h4>
      <div
        v-for="(permit, index) in getAuthsUnderInvestigation"
        :id="permit.permitId"
        :key="permit.permitId"
        :index="index"
        class="my-2"
      >
        <AuthorizationCardLite
          :editable="!getProjectIsCompleted"
          :permit="permit"
          @authorization-card-lite:more="toAuthorization(permit.permitId)"
        />
      </div>
    </div>
    <!-- Authorizations with needed = Yes & stage = Pre-submission -->
    <div
      v-if="getAuthsNeeded.length > 0"
      class="mb-8 mt-16"
    >
      <h4 class="mb-6">{{ t('views.i.projectView.needed') }}</h4>
      <div
        v-for="(permit, index) in getAuthsNeeded"
        :id="permit.permitId"
        :key="permit.permitId"
        :index="index"
        class="my-2"
      >
        <AuthorizationCardLite
          :editable="!getProjectIsCompleted"
          :permit="permit"
          @authorization-card-lite:more="toAuthorization(permit.permitId)"
        />
      </div>
    </div>
    <!--Authorizations when its state=Approved, Denied, Cancelled, OR Withdrawn.-->
    <div
      v-if="getAuthsCompleted.length > 0"
      class="mb-8 mt-16"
    >
      <h4 class="mb-6">{{ t('views.i.projectView.completed') }}</h4>
      <div
        v-for="(permit, index) in getAuthsCompleted"
        :id="permit.permitId"
        :key="permit.permitId"
        :index="index"
        class="my-2"
      >
        <AuthorizationCard
          :editable="!getProjectIsCompleted"
          :permit="permit"
          @authorization-card:more="toAuthorization(permit.permitId)"
        />
      </div>
    </div>
    <!--Authorizations when needed = NO-->
    <div
      v-if="getAuthsNotNeeded.length > 0"
      class="mb-8 mt-16"
    >
      <h4 class="mb-6">{{ t('views.i.projectView.notNeeded') }}</h4>
      <div
        v-for="(permit, index) in getAuthsNotNeeded"
        :id="permit.permitId"
        :key="permit.permitId"
        :index="index"
        class="my-2"
      >
        <AuthorizationCardLite
          :editable="!getProjectIsCompleted"
          :permit="permit"
          @authorization-card-lite:more="toAuthorization(permit.permitId)"
        />
      </div>
    </div>
  </div>
</template>
