<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Divider from '@/components/common/Divider.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { InputMask, InputText, Select } from '@/components/form';
import { Card } from '@/lib/primevue';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';

import type { FormSchemaType as ElectrificationFormSchemaType } from '@/components/electrification/project/ProjectIntakeSchema';
import type { FormSchemaType as HousingFormSchemaType } from '@/components/housing/submission/SubmissionIntakeSchema';
import type { DeepPartial } from '@/types';

// Props
const { editable = true, initialFormValues } = defineProps<{
  editable?: boolean;
  initialFormValues: DeepPartial<ElectrificationFormSchemaType> | DeepPartial<HousingFormSchemaType>;
}>();

// Composables
const { t } = useI18n();
</script>

<template>
  <Card>
    <template #title>
      <div class="flex">
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('common.contactCardIntakeForm.header') }}
        </span>
        <Tooltip
          icon="fa-solid fa-circle-question"
          right
          :text="t('common.contactCardIntakeForm.contactTooltip')"
        />
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-2 gap-4">
        <InputText
          :name="`contacts.contactFirstName`"
          label="First name"
          :bold="false"
          :disabled="!!initialFormValues?.contacts?.contactFirstName || !editable"
        />
        <InputText
          :name="`contacts.contactLastName`"
          label="Last name"
          :bold="false"
          :disabled="!!initialFormValues?.contacts?.contactLastName || !editable"
        />
        <InputMask
          :name="`contacts.contactPhoneNumber`"
          mask="(999) 999-9999"
          label="Phone number"
          :bold="false"
          :disabled="!!initialFormValues?.contacts?.contactPhoneNumber || !editable"
        />
        <InputText
          :name="`contacts.contactEmail`"
          label="Email"
          :bold="false"
          :disabled="!!initialFormValues?.contacts?.contactEmail || !editable"
        />
        <Select
          :name="`contacts.contactApplicantRelationship`"
          label="Relationship to project"
          :bold="false"
          :disabled="!!initialFormValues?.contacts?.contactApplicantRelationship || !editable"
          :options="PROJECT_RELATIONSHIP_LIST"
        />
        <Select
          :name="`contacts.contactPreference`"
          label="Preferred contact method"
          :bold="false"
          :disabled="!!initialFormValues?.contacts?.contactPreference || !editable"
          :options="CONTACT_PREFERENCE_LIST"
        />
      </div>
    </template>
  </Card>
</template>
