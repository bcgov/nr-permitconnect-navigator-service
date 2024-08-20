<script setup lang="ts">
import { Button, useConfirm } from '@/lib/primevue';
import { ref } from 'vue';

import { IntakeFormCategory } from '@/utils/enums/housing';

import type { Ref } from 'vue';

// Props
type Prop = {
  formErrors: Record<string, string | undefined>;
};

const props = withDefaults(defineProps<Prop>(), {});

// State
const showTab: Ref<boolean> = ref(true);

// Actions
const confirm = useConfirm();

const checkApplicantValuesValid = (errors: Record<string, string | undefined>): boolean => {
  // Check applicant section is valid
  let isValid = true;
  const errorList = Object.keys(errors);

  for (const error of errorList) {
    if (error.includes(IntakeFormCategory.APPLICANT)) {
      isValid = false;
      break;
    }
  }
  return isValid;
};

const confirmSubmit = () => {
  confirm.require({
    message: 'Are you sure you wish for assistance with this form? Please review the form before submitting.',
    header: 'Please confirm assistance',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => {
      emit('onSubmitAssistance');
    }
  });
};

const emit = defineEmits(['onSubmitAssistance']);
</script>

<template>
  <Teleport to="#app">
    <div :class="{ 'teleport-container': true, '--open': showTab }">
      <div
        class="assistance-tab pb-3 pt-3 pr-1 pl-1"
        @click="showTab = !showTab"
      >
        <div class="tab-text">Assistance</div>
        <font-awesome-icon
          class="-rotate-90 mt-2"
          icon="fa-solid fa-circle-question"
        />
      </div>
      <div class="assistance-modal">
        <div class="font-bold mb-3">Need assistance with the form?</div>
        <div>
          Are you unable to complete this form and need assistance? Please follow the instructions below. You will be
          contacted by a housing navigator.
        </div>
        <ol class="pl-3">
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
        <div class="flex justify-content-center">
          <Button
            label="Get assistance"
            :disabled="!checkApplicantValuesValid(props.formErrors)"
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
