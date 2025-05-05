<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import BasicInfo from '@/components/common/icons/BasicInfo.vue';
import { InputMask, InputText, Select } from '@/components/form';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/housing';

// Props
const { editable = true, initialFormValues } = defineProps<{
  editable?: boolean;
  initialFormValues: any;
}>();

// Composables
const { t } = useI18n();
</script>

<template>
  <div class="p-panel rounded px-9 py-6">
    <div class="flex items-center gap-x-2.5 mb-4">
      <BasicInfo />
      <h3 class="section-header m-0">
        {{ t('common.ContactCardNavForm.header') }}
      </h3>
    </div>
    <div class="grid grid-cols-3 gap-x-6 gap-y-6">
      <InputText
        name="contact.firstName"
        label="First name"
        :disabled="!editable || !!initialFormValues.contact.firstName"
      />
      <InputText
        name="contact.lastName"
        label="Last name"
        :disabled="!editable || !!initialFormValues.contact.lastName"
      />
      <Select
        name="contact.contactApplicantRelationship"
        label="Relationship to project"
        :disabled="!editable || !!initialFormValues.contact.contactApplicantRelationship"
        :options="PROJECT_RELATIONSHIP_LIST"
      />
      <Select
        name="contact.contactPreference"
        label="Preferred contact method"
        :disabled="!editable || !!initialFormValues.contact.contactPreference"
        :options="CONTACT_PREFERENCE_LIST"
      />
      <InputMask
        name="contact.phoneNumber"
        mask="(999) 999-9999"
        label="Contact phone"
        :disabled="!editable || !!initialFormValues.contact.phoneNumber"
      />
      <InputText
        name="contact.email"
        label="Contact email"
        :disabled="!editable || !!initialFormValues.contact.email"
      />
    </div>
  </div>
</template>
