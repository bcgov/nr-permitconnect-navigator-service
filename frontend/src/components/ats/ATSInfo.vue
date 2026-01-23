<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ATSUserCreateModal from '@/components/ats/ATSUserCreateModal.vue';
import ATSUserDetailsModal from '@/components/ats/ATSUserDetailsModal.vue';
import ATSUserLinkModal from '@/components/ats/ATSUserLinkModal.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { Button, useConfirm, useToast } from '@/lib/primevue/index.ts';
import { atsService } from '@/services/index.ts';
import { ATSCreateTypes } from '@/utils/enums/application.ts';

import type { Ref } from 'vue';
import type { ATSClientResource } from '@/types/index.ts';

// Props
const {
  atsClientId = undefined,
  atsEnquiryId = undefined,
  editable = true,
  email = undefined,
  firstName = undefined,
  lastName = undefined,
  phoneNumber = undefined,
  isRelatedEnquiry = false
} = defineProps<{
  atsClientId?: string | number;
  atsEnquiryId?: string | number;
  editable?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isRelatedEnquiry?: boolean;
}>();

// Emits
const emit = defineEmits(['atsInfo:setClientId', 'atsInfo:setAddedToAts', 'atsInfo:create', 'atsInfo:createEnquiry']);

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

// State
const atsCreateType: Ref<ATSCreateTypes | undefined> = ref(undefined);
const atsUserCreateModalVisible: Ref<boolean> = ref(false);
const atsUserDetailsModalVisible: Ref<boolean> = ref(false);
const atsUserLinkModalVisible: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(false);
const users: Ref<ATSClientResource[]> = ref([]);
const visible = defineModel<boolean>('visible');

// Actions
async function getATSClientInformation() {
  try {
    loading.value = true;

    const response = await atsService.searchATSUsers({
      clientId: atsClientId
    });

    users.value = response.data.clients;

    users.value.forEach((client: ATSClientResource) => {
      // Combine address lines and filter out empty lines
      const address = [client.address.addressLine1, client.address.addressLine2].filter(Boolean).join(', ');
      client.formattedAddress = address;
    });
  } catch (error) {
    toast.error(t('i.ats.common.errorSearchingUsers') + error);
  } finally {
    loading.value = false;
  }
}

function onNewATSEnquiry() {
  confirm.require({
    message: t('i.ats.atsInfo.atsEnquiryConfirmMsg'),
    header: t('i.ats.atsInfo.atsEnquiryConfirmTitle'),
    acceptLabel: t('i.ats.atsInfo.confirm'),
    rejectLabel: t('i.ats.common.cancel'),
    rejectProps: { outlined: true },
    accept: () => {
      atsCreateType.value = ATSCreateTypes.ENQUIRY;
      emit('atsInfo:createEnquiry');
    }
  });
}

watch(visible, () => {
  if (atsClientId) getATSClientInformation();
});
</script>

<template>
  <div class="bg-[var(--p-bcblue-50)] rounded px-9 py-6">
    <div class="mb-4">
      <span class="section-header mr-2 mt-0 font-bold text-xl text-[var(--p-primary-950)]">
        {{ t('i.ats.atsInfo.atsHeader') }}
      </span>
      <Tooltip
        icon="fa-solid fa-circle-question"
        right
        :text="t('i.ats.atsInfo.atsToolTip')"
      />
    </div>
    <input
      type="hidden"
      name="atsClientId"
    />
    <input
      type="hidden"
      name="atsEnquiryId"
    />

    <div class="flex items-center">
      <div
        v-if="
          atsClientId ||
          atsCreateType === ATSCreateTypes.CLIENT ||
          atsCreateType === ATSCreateTypes.CLIENT_ENQUIRY ||
          isRelatedEnquiry
        "
        class="flex items-center mb-4"
      >
        <p class="text-[var(--p-primary-900)] mr-3">
          <b>{{ t('i.ats.atsInfo.atsClientIdHeader') }}</b>
        </p>
        <a
          v-if="atsClientId"
          class="hover-hand"
          @click="atsUserDetailsModalVisible = true"
        >
          {{ atsClientId }}
        </a>
        <span v-else-if="isRelatedEnquiry">
          {{ t('i.ats.atsInfo.unavailable') }}
        </span>
        <span v-else>{{ t('i.ats.atsInfo.pendingSave') }}</span>
      </div>
      <Button
        v-else
        class="ats-button w-full mb-4"
        :aria-label="t('i.ats.atsInfo.atsSearchButton')"
        outlined
        :label="t('i.ats.atsInfo.atsSearchButton')"
        :disabled="!editable"
        @click="atsUserLinkModalVisible = true"
      />
    </div>

    <div
      v-if="atsEnquiryId || atsCreateType === ATSCreateTypes.ENQUIRY || atsCreateType === ATSCreateTypes.CLIENT_ENQUIRY"
      class="flex items-center"
    >
      <p class="text-[var(--p-primary-900)] mr-2">
        <b>{{ t('i.ats.atsInfo.atsEnquiryIdHeader') }}</b>
      </p>
      <span v-if="atsEnquiryId">
        {{ atsEnquiryId }}
      </span>
      <span v-else>{{ t('i.ats.atsInfo.pendingSave') }}</span>
    </div>
    <Button
      v-if="
        atsClientId &&
        !atsEnquiryId &&
        ![ATSCreateTypes.CLIENT_ENQUIRY, ATSCreateTypes.ENQUIRY].includes(atsCreateType as ATSCreateTypes)
      "
      class="ats-button mt-4 w-full"
      :aria-label="t('i.ats.atsInfo.atsNewEnquiryBtn')"
      outlined
      :disabled="!editable"
      @click="onNewATSEnquiry()"
    >
      {{ t('i.ats.atsInfo.atsNewEnquiryBtn') }}
    </Button>
  </div>
  <ATSUserLinkModal
    v-model:visible="atsUserLinkModalVisible"
    :first-name="firstName"
    :last-name="lastName"
    :phone-number="phoneNumber"
    :email-id="email"
    @ats-user-link:link="
      (atsClientResource: ATSClientResource) => {
        atsUserLinkModalVisible = false;
        emit('atsInfo:setClientId', atsClientResource.clientId);
        if (!atsEnquiryId) {
          atsCreateType = ATSCreateTypes.ENQUIRY;
          emit('atsInfo:create', atsCreateType);
        }
      }
    "
    @ats-user-link:create="
      atsUserLinkModalVisible = false;
      atsUserCreateModalVisible = true;
    "
  />
  <ATSUserDetailsModal
    v-if="atsClientId"
    v-model:visible="atsUserDetailsModalVisible"
    :ats-client-id="atsClientId"
    :is-related-enquiry="isRelatedEnquiry"
    @ats-user-details:un-link="
      () => {
        atsUserDetailsModalVisible = false;
        emit('atsInfo:setClientId', null);
        emit('atsInfo:setAddedToAts', false);
        atsCreateType = undefined;
      }
    "
  />
  <ATSUserCreateModal
    v-model:visible="atsUserCreateModalVisible"
    :first-name="firstName"
    :last-name="lastName"
    :phone="phoneNumber"
    :email="email"
    @ats-user-create:create="
      () => {
        atsUserCreateModalVisible = false;
        if (!atsEnquiryId) atsCreateType = ATSCreateTypes.CLIENT_ENQUIRY;
        else atsCreateType = ATSCreateTypes.CLIENT;
        emit('atsInfo:create', atsCreateType);
      }
    "
  />
</template>

<style scoped lang="scss">
.ats-button {
  background-color: white;
}
</style>
