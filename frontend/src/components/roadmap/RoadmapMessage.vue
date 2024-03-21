<script setup lang="ts">
import { Form } from 'vee-validate';
import type { Ref } from 'vue';
import { onMounted, ref } from 'vue';
import { object, string } from 'yup';

import { Button } from '@/lib/primevue';
import { InputText, TextArea } from '@/components/form';
import type { Permit, PermitType, Submission, User } from '@/types';
import emailService from '@/services/emailService';
import { roadmapTemplate } from '@/utils/templates';
import { userService } from '@/services';

// Props
type Props = {
  submission: Submission;
  permits: Array<Permit>;
  permitType: Array<PermitType>;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['roadmap:submit']);

// Roadmap schema
const messageSchema = object({
  toEmail: string().required().email(),
  ccEmail: string().email(),
  bccEmail: string().email(),
  subject: string(),
  messageBody: string().required()
});

// State
const navigator: Ref<User | undefined> = ref(undefined);
const templateReady: Ref<boolean> = ref(false);

const getNewPermits = () => {
  const newPermits = props.permits.map(
    (x) =>
      props.permitType.find((y) => {
        return y.permitTypeId === x.permitTypeId && x.status === 'New';
      })?.name
  );

  return newPermits.filter((p) => p !== undefined);
};

const getAppliedPermits = () => {
  const appliedPermits = props.permits.map(
    (x) =>
      props.permitType.find((y) => {
        return y.permitTypeId === x.permitTypeId && x.status === 'Applied';
      })?.name
  );

  return appliedPermits.filter((p) => p !== undefined && p !== '');
};

const getCompletedPermits = () => {
  const completedPermits = props.permits.map(
    (x) =>
      props.permitType.find((y) => {
        return y.permitTypeId === x.permitTypeId && x.status === 'Completed';
      })?.name
  );

  return completedPermits.filter((p) => p !== undefined);
};

onMounted(() => {
  userService.searchUsers({ userId: [props.submission.assignedUserId] }).then((res) => {
    navigator.value = res?.data[0];
    templateReady.value = true;
  });
});

let messageValues = {
  // TODO: swap out placeholder for actual value
  //        (temporarily subbing in dummy email to avoid erroneous sending of emails)
  // toEmail: props.submission.contactEmail,
  toEmail: 'null@example.com',
  ccEmail: '',
  // TODO: how does our endpoint (or CHES) handle multiple emails?
  bccEmail: 'Housing.Authorizations@gov.bc.ca, <navigator>@gov.bc.ca',
  subject: "Here is your housing project's Permit Roadmap",
  messageBody: roadmapTemplate({
    '{{ contactName }}': props.submission.contactName ?? '',
    '{{ locationAddress }}': props.submission.streetAddress ?? '',
    // TODO: ultimately, we don't want the "here are the permits you need/have/completed"
    //        to even appear if there aren't any permits underneath
    '{{ permitStateNew }}': getNewPermits().length > 0 ? getNewPermits() : '(none)',
    '{{ permitStateApplied }}': getAppliedPermits().length > 0 ? getAppliedPermits() : '(none)',
    '{{ permitStateCompleted }}': getCompletedPermits().length > 0 ? getCompletedPermits() : '(none)',
    // TODO: navigator name not showing up for some reason
    '{{ navigatorName }}': navigator.value?.firstName ?? ''
  })
};

async function onSubmit(values: any) {
  try {
    // TODO: might have to massage/tweak data before sending
    const result = await emailService.sendEmail({ values });
    // TODO: emit success event, parent to show toasts
  } catch (e: any) {
    // TODO: emit fail event, parent to show toasts
    console.log('fail!');
    console.log(e);
  }
}
</script>

<template>
  <Form
    v-if="templateReady"
    :initial-values="messageValues"
    :validation-schema="messageSchema"
    @submit="onSubmit"
  >
    <div class="formgrid grid">
      <InputText
        class="col-6"
        name="toEmail"
        label="To"
      />
      <div class="col-6" />
      <InputText
        class="col-6"
        name="ccEmail"
        label="CC"
      />
      <div class="col-6" />
      <InputText
        class="col-6"
        name="bccEmail"
        label="BCC"
      />
      <div class="col-6" />
      <InputText
        class="col-6"
        name="subject"
        label="Subject"
      />
      <div class="col-6" />
      <TextArea
        class="col-12"
        name="messageBody"
        label="Note"
      />
      <!-- TODO: figure out how to match the styling with the TextArea labels -->
      <!--        (right now it's black instead of bcgov blue)                -->
      <div class="col-12"><span class="key font-bold">Add attachments</span></div>
      <div class="col-12 flex pt-2">
        <Button>
          <font-awesome-icon
            icon="fa-solid fa-plus"
            class="mr-1"
          />
          Choose
        </Button>
      </div>
      <div class="field col-12 flex pt-5">
        <div class="flex-auto">
          <Button
            class="mr-2"
            label="Send"
            type="submit"
            icon="pi pi-envelope"
          />
        </div>
      </div>
    </div>
  </Form>
</template>
