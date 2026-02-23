<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Divider from '@/components/common/Divider.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { InputMask, InputText, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card } from '@/lib/primevue';
import { useFormStore } from '@/store';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';

import type { ComponentPublicInstance, Ref } from 'vue';
import type { ContactSchemaType } from '@/validators/contact';

// Props
const { initialFormValues = undefined, tab = 0 } = defineProps<{
  initialFormValues?: Partial<ContactSchemaType>;
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'ContactCardIntakeForm', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <div class="flex">
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('contactCardIntakeForm.header') }}
        </span>
        <Tooltip
          icon="fa-solid fa-circle-question"
          right
          :text="t('contactCardIntakeForm.contactTooltip')"
        />
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-2 gap-4">
        <InputText
          :name="`contacts.contactFirstName`"
          :label="t('contactCardIntakeForm.labels.firstName')"
          :bold="false"
          :disabled="!!initialFormValues?.contactFirstName || !getEditable"
        />
        <InputText
          :name="`contacts.contactLastName`"
          :label="t('contactCardIntakeForm.labels.lastName')"
          :bold="false"
          :disabled="!!initialFormValues?.contactLastName || !getEditable"
        />
        <InputMask
          :name="`contacts.contactPhoneNumber`"
          mask="(999) 999-9999"
          :label="t('contactCardIntakeForm.labels.phoneNumber')"
          :bold="false"
          :disabled="!!initialFormValues?.contactPhoneNumber || !getEditable"
        />
        <InputText
          :name="`contacts.contactEmail`"
          :label="t('contactCardIntakeForm.labels.email')"
          :bold="false"
          :disabled="!!initialFormValues?.contactEmail || !getEditable"
        />
        <Select
          :name="`contacts.contactApplicantRelationship`"
          :label="t('contactCardIntakeForm.labels.contactApplicantRelationship')"
          :bold="false"
          :disabled="!!initialFormValues?.contactApplicantRelationship || !getEditable"
          :options="PROJECT_RELATIONSHIP_LIST"
        />
        <Select
          :name="`contacts.contactPreference`"
          :label="t('contactCardIntakeForm.labels.contactPreference')"
          :bold="false"
          :disabled="!!initialFormValues?.contactPreference || !getEditable"
          :options="CONTACT_PREFERENCE_LIST"
        />
      </div>
    </template>
  </Card>
</template>
