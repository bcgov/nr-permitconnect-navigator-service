<script setup lang="ts">
import { useFormValues } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { object } from 'yup';

import { Button, useConfirm } from '@/lib/primevue';
import { enquiryService } from '@/services';
import { RouteName } from '@/utils/enums/application';
import { SubmissionType } from '@/utils/enums/projectCommon';
import { generalErrorHandler, setEmptyStringsToNull } from '@/utils/utils';
import { contactValidator } from '@/validators';

import type { Ref } from 'vue';

// Composables
const formValues = useFormValues();
const { t } = useI18n();
const router = useRouter();

// State
const showTab: Ref<boolean> = ref(true);

// Actions
const confirm = useConfirm();
const contactSchema = object(contactValidator);

// Check if applicant section is filled
const checkApplicantValuesValid = (): boolean => {
  return contactSchema.isValidSync(formValues.value.contacts);
};

const confirmSubmit = () => {
  confirm.require({
    message: t('projectIntakeAssistance.submit.message'),
    header: t('projectIntakeAssistance.submit.header'),
    acceptLabel: t('ui.actions.confirm'),
    rejectLabel: t('ui.actions.cancel'),
    rejectProps: { outlined: true },
    accept: async () => {
      await onAssistanceRequest();
    }
  });
};

async function onAssistanceRequest() {
  try {
    const enquiryData = {
      basic: {
        enquiryDescription: t('projectIntakeAssistance.assistanceMessage'),
        submissionType: SubmissionType.ASSISTANCE
      },
      contact: setEmptyStringsToNull({
        contactId: formValues.value.contacts.contactId,
        firstName: formValues.value.contacts.contactFirstName,
        lastName: formValues.value.contacts.contactLastName,
        phoneNumber: formValues.value.contacts.contactPhoneNumber,
        email: formValues.value.contacts.contactEmail,
        contactApplicantRelationship: formValues.value.contacts.contactApplicantRelationship,
        contactPreference: formValues.value.contacts.contactPreference
      })
    };

    const enquiryResponse = (await enquiryService.createEnquiry(enquiryData)).data;
    router.push({
      name: RouteName.EXT_HOUSING_ENQUIRY_CONFIRMATION,
      params: {
        enquiryId: enquiryResponse.enquiryId
      }
    });
  } catch (e) {
    generalErrorHandler(e, t('projectIntakeAssistance.submit.failed'));
  }
}
</script>

<template>
  <Teleport to="#app">
    <div :class="{ 'teleport-container': true, '--open': showTab }">
      <div
        class="assistance-tab pb-4 pt-4 pr-1 pl-1"
        tabindex="0"
        @click="showTab = !showTab"
        @keydown.enter.prevent="showTab = !showTab"
        @keydown.space.prevent="showTab = !showTab"
      >
        <div class="tab-text">{{ t('projectIntakeAssistance.assistanceHeader') }}</div>
        <font-awesome-icon
          class="-rotate-90 mt-2"
          icon="fa-solid fa-circle-question"
        />
      </div>
      <div class="assistance-modal">
        <div class="font-bold mb-4">{{ t('projectIntakeAssistance.needAssistance') }}</div>
        <div>
          {{ t('projectIntakeAssistance.needAssistanceMessage') }}
        </div>
        <ol class="pl-4">
          <i18n-t
            scope="global"
            keypath="projectIntakeAssistance.instructions1"
            tag="li"
            class="mb-1"
          >
            <template #primary>
              <span class="font-bold">'{{ t('projectIntakeAssistance.labels.primaryContact') }}'</span>
            </template>

            <template #basic>
              <span class="font-bold">'{{ t('projectIntakeAssistance.labels.basicInformation') }}'</span>
            </template>
          </i18n-t>

          <li class="mb-1">{{ t('projectIntakeAssistance.instructions2') }}</li>
          <li class="mb-1">{{ t('projectIntakeAssistance.instructions3') }}</li>
        </ol>
        <div class="flex justify-center">
          <Button
            :label="t('projectIntakeAssistance.getAssistance')"
            :disabled="!checkApplicantValuesValid()"
            @click="() => confirmSubmit()"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.teleport-container {
  position: fixed;
  right: 0%;
  bottom: 0%;
  z-index: 1000;
  translate: 0rem;
  transition: all 0.75s ease-in;

  &.--open {
    translate: 20rem;
    transition: all 0.75s ease-out;
  }
}

.assistance-modal {
  overflow: hidden;
  position: relative;
  bottom: 0rem;
  right: 0rem;
  padding: 1rem;
  background-color: white;
  border-style: solid;
  border-color: #fdb913;
  border-width: 3px;
  width: 20rem;
}

:deep(.assistance-tab:focus-visible) {
  outline: 0.25rem solid var(--p-bcblue-700);
  outline-offset: 0.125rem;
}

.assistance-tab {
  cursor: pointer;
  position: absolute;
  top: 0rem;
  transform: translate(-100%, 0%);
  writing-mode: vertical-lr;
  background-color: #fdb913;
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
  z-index: 10;
  color: white;
  display: flex;

  .tab-text {
    transform: rotate(180deg);
  }
}
</style>
