<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import StatusPill from '@/components/common/StatusPill.vue';
import { Button, Card, useToast } from '@/lib/primevue';
import { userService } from '@/services';
import { PermitAuthorizationStatus } from '@/utils/enums/permit';
import { formatDate, formatDateTime } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Permit } from '@/types';

// Props
const { permit } = defineProps<{
  permit: Permit;
}>();

// Emits
const emit = defineEmits(['authorizationCard:more']);

// Composables
const { t } = useI18n();

// State
const cardUpdatedBy: Ref<string> = ref('');
const trackingNotShownToProponent = computed(() => permit.permitTracking?.filter((pt) => !pt.shownToProponent));
const trackingShownToProponent = computed(() => permit.permitTracking?.find((pt) => pt.shownToProponent));

// Actions
const toast = useToast();
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

function toCopy(toCopy: string) {
  navigator.clipboard.writeText(toCopy);
  toast.info(t('authorization.authorizationCard.copiedToClipboard'));
}
</script>

<template>
  <Card>
    <template #content>
      <div class="grid grid-cols-[2fr_1fr] p-2">
        <div>
          <div class="mb-4">
            <h4 class="mb-0">{{ permit.permitType?.name }}</h4>
          </div>
          <div class="mb-14">
            <span class="font-bold">
              {{ permit.statusLastVerified ? formatDate(permit.statusLastVerified) : undefined }}
            </span>
            <span class="ml-2 text-xs">{{ t('authorization.authorizationCard.statusVerified') }}</span>
          </div>
          <div class="flex gap-2">
            <span :class="permit.authStatus !== PermitAuthorizationStatus.NONE ? 'pb-4' : ''">
              <AuthorizationStatusPill
                v-if="permit.authStatus !== PermitAuthorizationStatus.NONE"
                :auth-status="permit.authStatus"
              />
            </span>
            <StatusPill :status="permit.status" />
          </div>
          <div
            v-if="permit.permitNote?.length"
            class="pb-2 mt-1 mr-3"
          >
            <div>
              <span>{{ ' ' + formatDateTime(permit.permitNote[0].createdAt) }},</span>
              {{ permit.permitNote[0].note }}
            </div>
          </div>
        </div>
        <div class="bg-[var(--p-bcblue-50)] grid grid-rows-[2fr_1fr]">
          <div class="mt-2">
            <div
              v-if="trackingShownToProponent"
              class="ml-5 mt-2 flex items-center"
            >
              <font-awesome-icon
                class="mr-2"
                icon="fa-solid fa-eye"
              />
              <span
                v-tooltip.right="t('authorization.authorizationCard.clickToCopy')"
                class="cursor-pointer"
                @click="toCopy(trackingShownToProponent?.trackingId as string)"
              >
                <span class="font-bold">
                  {{ trackingShownToProponent?.sourceSystemKind?.description }}
                </span>
                :

                {{ trackingShownToProponent?.trackingId }}
              </span>
            </div>
            <div
              v-for="permitTracking in trackingNotShownToProponent"
              :key="permitTracking.permitTrackingId"
              class="ml-5 mt-2 flex items-center"
            >
              <span
                v-tooltip.right="t('authorization.authorizationCard.clickToCopy')"
                class="cursor-pointer"
                @click="toCopy(permitTracking?.trackingId as string)"
              >
                <span class="font-bold">{{ permitTracking.sourceSystemKind?.description }}</span>
                :
                {{ permitTracking?.trackingId }}
              </span>
            </div>
          </div>
          <div class="flex justify-end items-end">
            <Button
              class="p-button-outlined mr-4 mb-4 size-fit"
              :label="t('authorization.authorizationCard.more')"
              @click="emit('authorizationCard:more')"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
