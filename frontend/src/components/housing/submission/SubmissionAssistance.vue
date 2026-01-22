<script setup lang="ts">
import { Button, useConfirm } from '@/lib/primevue';
import { ref } from 'vue';
import { object } from 'yup';

import { contactValidator } from '@/validators';
import { IntakeFormCategory } from '@/utils/enums/projectCommon';

import type { Ref } from 'vue';

// Props
const { formValues } = defineProps<{
  formValues: { [key: string]: string };
}>();
// Emits
const emit = defineEmits(['onSubmitAssistance']);

// State
const showTab: Ref<boolean> = ref(true);

// Actions
const confirm = useConfirm();
const contactSchema = object(contactValidator);

const checkApplicantValuesValid = (values: { [key: string]: string }): boolean => {
  // Check applicant section is filled
  let applicant = values?.[IntakeFormCategory.CONTACTS];
  return contactSchema.isValidSync(applicant);
};

const confirmSubmit = () => {
  confirm.require({
    message: 'Are you sure you want to request assistance for this form?',
    header: 'Please confirm assistance',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: () => {
      emit('onSubmitAssistance');
    }
  });
};
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
        <div class="tab-text">Assistance</div>
        <font-awesome-icon
          class="-rotate-90 mt-2"
          icon="fa-solid fa-circle-question"
        />
      </div>
      <div class="assistance-modal">
        <div class="font-bold mb-4">Need assistance with the form?</div>
        <div>
          Are you unable to complete this form and need assistance? Please follow the instructions below. You will be
          contacted by a housing navigator.
        </div>
        <ol class="pl-4">
          <li class="mb-1">
            Make sure the
            <span class="font-bold">'Primary Contact'</span>
            section under
            <span class="font-bold">'Contact Information'</span>
            tab is filled out.
          </li>
          <li class="mb-1">Try to fill out the form as much as you can.</li>
          <li class="mb-1">Click "Get assistance" below to submit the form.</li>
        </ol>
        <div class="flex justify-center">
          <Button
            label="Get assistance"
            :disabled="!checkApplicantValuesValid(formValues)"
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
