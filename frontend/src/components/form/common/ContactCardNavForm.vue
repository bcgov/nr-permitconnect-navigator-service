<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicInfo from '@/components/common/icons/BasicInfo.vue';
import { InputMask, InputText, Select } from '@/components/form';
import { Message } from '@/lib/primevue';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';

import type { Ref } from 'vue';
import type { DeepPartial } from '@/types';
import type { FormSchemaType as ElectrificationFormSchemaType } from '@/validators/electrification/projectFormNavigatorSchema';
import type { FormSchemaType as HousingFormSchemaType } from '@/validators/housing/projectFormNavigatorSchema';

// Props
const { formValues } = defineProps<{
  formValues: DeepPartial<ElectrificationFormSchemaType> | DeepPartial<HousingFormSchemaType>;
}>();

// Composables
const { t } = useI18n();

// State
const userId: Ref<string> = ref('');

const isManualContact = computed(() => {
  if (formValues.contact?.contactId) return !formValues.contact.userId;
  return false;
});
</script>

<template>
  <div class="p-panel rounded px-9 py-6">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-x-2.5">
        <BasicInfo />
        <h3 class="section-header m-0">
          {{ t('common.contactCardNavForm.header') }}
        </h3>
      </div>
    </div>
    <div
      v-if="isManualContact"
      class="mb-2"
    >
      <Message
        severity="warn"
        class="text-center"
        :closable="false"
      >
        {{ t('enquiryForm.manualContactHint') }}
      </Message>
    </div>
    <div
      v-if="formValues?.contact?.contactId"
      class="grid grid-cols-3 gap-x-6 gap-y-6"
    >
      <InputText
        name="contact.firstName"
        label="First name"
        disabled
      />
      <InputText
        name="contact.lastName"
        label="Last name"
        disabled
      />
      <Select
        name="contact.contactApplicantRelationship"
        label="Relationship to project"
        disabled
        :options="PROJECT_RELATIONSHIP_LIST"
      />
      <Select
        name="contact.contactPreference"
        label="Preferred contact method"
        disabled
        :options="CONTACT_PREFERENCE_LIST"
      />
      <InputMask
        name="contact.phoneNumber"
        mask="(999) 999-9999"
        label="Contact phone"
        disabled
      />
      <InputText
        name="contact.email"
        label="Contact email"
        disabled
      />
      <input
        v-model="userId"
        name="contact.userId"
        type="hidden"
      />
    </div>
  </div>
</template>
