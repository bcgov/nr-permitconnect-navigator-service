<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { Form } from 'vee-validate';
import { object, string } from 'yup';
import { Button } from '@/lib/primevue';
import { InputText, TextArea } from '@/components/form';

import { roadmapTemplate } from '@/utils/templates';
import { getPermitTypesByStatus } from '@/utils/utils';

import { permitService, roadmapService, submissionService, userService } from '@/services';
import { useAuthStore } from '@/store';
import type { Permit, PermitType, Submission, User } from '@/types';

// Props
type Props = {
  activityId: string;
  submission: Submission;
  permits: Array<Permit> | [];
  permitTypes: Array<PermitType>;
};

const props = withDefaults(defineProps<Props>(), {});

// store
// TODO: remove
const { getProfile } = storeToRefs(useAuthStore());

// local state
const navigator: Ref<User | undefined> = ref(undefined);
const confirmation = ref('');

// message schema
const messageSchema = object({
  toEmail: string().required().email(),
  ccEmail: string().email(),
  bccEmail: string().email(),
  subject: string().required(),
  messageBody: string().required()
});

// initial values
let messageValues = {
  // assigned to
  fromEmail: 'a@a.com',
  // props.submission.contactEmail
  toEmail: ['a@a.com', 'a@a.com'],
  ccEmail: ['a@a.com'],
  // 'Housing.Authorizations@gov.bc.ca, <navigator>@gov.bc.ca'
  bccEmail: ['a@a.com'],
  subject: "Here is your housing project's Permit Roadmap",
  bodyType: 'text',
  messageBody: roadmapTemplate({
    '{{ contactName }}': props.submission.contactName ?? '',
    '{{ locationAddress }}': props.submission.streetAddress ?? '',
    '{{ permitStateNew }}': getPermitTypesByStatus(props.permits, props.permitTypes, 'New'),
    '{{ permitStateApplied }}': getPermitTypesByStatus(props.permits, props.permitTypes, 'Applied'),
    '{{ permitStateCompleted }}': getPermitTypesByStatus(props.permits, props.permitTypes, 'Completed'),
    '{{ navigatorName }}': navigator.value?.fullName
  })
  // delayTS: this.form.datetime !== null ? new Date(this.form.datetime).getTime() : 0,
  // attachments: this.form.attachments,
  // priority: this.form.priority,
  // tag: this.form.tag,
};

async function onSubmit(formValues: any) {
  try {
    confirmation.value = (await roadmapService.update(props.activityId, formValues)).data;
    // TODO: emit success event, parent to show toasts
  } catch (e: any) {
    // TODO: emit fail event, parent to show toasts
    console.log('fail!');
    console.log(e);
  }
}

onMounted(async () => {
  userService.searchUsers({ userId: [props.submission.assignedUserId] }).then((res) => {
    navigator.value = res?.data[0];
  });
});
</script>

<template>
  <Form
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
  <pre>{{ confirmation }}</pre>
</template>
