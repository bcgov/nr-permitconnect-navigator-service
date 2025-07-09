<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import { Button, Card } from '@/lib/primevue';
import { userService } from '@/services';
import { PermitAuthorizationStatus } from '@/utils/enums/permit';

import type { Ref } from 'vue';
import type { Permit } from '@/types';

// Props
const { permit } = defineProps<{
  permit: Permit;
}>();

// Composables
const { t } = useI18n();

// State
const cardUpdatedBy: Ref<string> = ref('');

// Actions
watchEffect(() => {
  if (permit.updatedBy) {
    userService
      .searchUsers({ userId: [permit.updatedBy] })
      .then((res) => {
        cardUpdatedBy.value = res?.data.length ? res?.data[0].fullName : '';
      })
      .catch(() => {});
  }
});
</script>

<template>
  <Card>
    <template #content>
      <div class="flex justify-between items-center">
        <h6 class="mb-0 font-bold">{{ permit.permitType?.name }}</h6>
        <div class="flex items-center gap-5">
          <AuthorizationStatusPill
            v-if="
              permit.authStatus !== PermitAuthorizationStatus.NONE &&
              permit.authStatus !== PermitAuthorizationStatus.IN_REVIEW &&
              permit.authStatus !== PermitAuthorizationStatus.PENDING
            "
            :auth-status="permit.authStatus"
          />
          <Button
            class="p-button-outlined size-fit"
            :label="t('authorization.authorizationCardLite.more')"
          />
        </div>
      </div>
    </template>
  </Card>
</template>
