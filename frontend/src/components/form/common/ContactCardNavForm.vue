<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicInfo from '@/components/common/icons/BasicInfo.vue';
import ContactSearchModal from '@/components/contact/ContactSearchModal.vue';
import { InputMask, InputText, Select } from '@/components/form';
import { Message } from '@/lib/primevue';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';

import type { Ref } from 'vue';
import type { Contact, DeepPartial } from '@/types';
import type { FormSchemaType as ElectrificationFormSchemaType } from '../../electrification/project/ProjectFormSchema';
import type { FormSchemaType as HousingFormSchemaType } from '../../housing/project/ProjectFormSchema';

// Props
const { editable = true, formValues } = defineProps<{
  editable?: boolean;
  formValues: DeepPartial<ElectrificationFormSchemaType> | DeepPartial<HousingFormSchemaType>;
}>();

// State
const basicInfoManualEntry: Ref<boolean> = ref(false);
const searchContactModalVisible: Ref<boolean> = ref(false);
const selectedContact: Ref<Contact | undefined> = ref(undefined);
const userId: Ref<string> = ref('');

// Emits
const emit = defineEmits(['contactCardNavForm:pick', 'contactCardNavForm:manualEntry']);

// Composables
const { t } = useI18n();

// Actions
// Show the hint if any of the following conditions are met:
// 1. A contact is selected but it does not have a userId
// 2. The initial form values have a contactId but no userId
const showManualContactHint = computed(() => {
  if (selectedContact.value) return !selectedContact.value.userId;
  else if (formValues.contact?.contactId) return !formValues.contact.userId;
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
      <div>
        <font-awesome-icon
          icon="fa-magnifying-glass"
          class="mr-1 app-primary-color"
        />
        <a
          class="hover-hand"
          @click="searchContactModalVisible = true"
        >
          {{ t('common.contactCardNavForm.searchContacts') }}
        </a>
      </div>
    </div>
    <div
      v-if="showManualContactHint"
      class="mb-2"
    >
      <Message
        severity="warn"
        class="text-center"
        :closable="false"
      >
        {{ t('enquiryForm.manualContactHint') }}
        {{ userId }}
      </Message>
    </div>
    <ContactSearchModal
      v-model:visible="searchContactModalVisible"
      @contact-search:pick="
        (contact: Contact) => {
          searchContactModalVisible = false;
          selectedContact = contact;
          basicInfoManualEntry = false;
          emit('contactCardNavForm:pick', selectedContact);
        }
      "
      @contact-search:manual-entry="
        () => {
          searchContactModalVisible = false;
          emit('contactCardNavForm:manualEntry');
          selectedContact = undefined;
          basicInfoManualEntry = true;
        }
      "
    />
    <div
      v-if="formValues?.contact?.contactId || basicInfoManualEntry || selectedContact?.contactId"
      class="grid grid-cols-3 gap-x-6 gap-y-6"
    >
      <InputText
        name="contact.firstName"
        label="First name"
        :disabled="!editable || !basicInfoManualEntry"
      />
      <InputText
        name="contact.lastName"
        label="Last name"
        :disabled="!editable || !basicInfoManualEntry"
      />
      <Select
        name="contact.contactApplicantRelationship"
        label="Relationship to project"
        :disabled="!editable || !basicInfoManualEntry"
        :options="PROJECT_RELATIONSHIP_LIST"
      />
      <Select
        name="contact.contactPreference"
        label="Preferred contact method"
        :disabled="!editable || !basicInfoManualEntry"
        :options="CONTACT_PREFERENCE_LIST"
      />
      <InputMask
        name="contact.phoneNumber"
        mask="(999) 999-9999"
        label="Contact phone"
        :disabled="!editable || !basicInfoManualEntry"
      />
      <InputText
        name="contact.email"
        label="Contact email"
        :disabled="!editable || !basicInfoManualEntry"
      />
      <input
        v-model="userId"
        name="contact.userId"
        type="hidden"
      />
    </div>
  </div>
</template>
